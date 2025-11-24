package handlers

import (
	"api/internal/config"
	"api/internal/models"
	"api/internal/ports"
	service "api/internal/proto/payments"
	"context"
	"log/slog"
	"strconv"
	"time"

	"connectrpc.com/connect"
	"github.com/stripe/stripe-go/v83"
)

type PaymentHandler struct {
	log              *slog.Logger
	config           *config.Config
	facilityStore    ports.FacilityStore
	reservationStore ports.ReservationStore
	sc               *stripe.Client
}

func NewPaymentHandler(log *slog.Logger, config *config.Config, facilityStore ports.FacilityStore, reservationStore ports.ReservationStore, sc *stripe.Client) *PaymentHandler {
	return &PaymentHandler{
		log:              log,
		config:           config,
		facilityStore:    facilityStore,
		reservationStore: reservationStore,
		sc:               sc,
	}
}

func (p *PaymentHandler) CreatePaymentIntent(ctx context.Context, req *connect.Request[service.CreatePaymentIntentRequest]) (*connect.Response[service.CreatePaymentIntentResponse], error) {
	reservationID := req.Msg.ReservationId
	reservation, err := p.reservationStore.Get(ctx, reservationID)
	if err != nil {
		p.log.Error("failed to get reservation", "error", err)
		return nil, err
	}

	category, err := p.facilityStore.GetCategory(ctx, reservation.Reservation.CategoryID)
	if err != nil {
		p.log.Error("failed to get category", "error", err)
		return nil, err
	}

	price, err := p.sc.V1Prices.Retrieve(ctx, reservation.Reservation.PriceID.String, nil)
	if err != nil {
		p.log.Error("failed to get price", "error", err)
		return nil, err
	}

	stringCost, err := reducer(ctx, category, reservation, price)
	if err != nil {
		p.log.Error("failed to calculate cost", "error", err)
		return nil, err
	}

	costInt, err := strconv.ParseFloat(stringCost, 10)
	if err != nil {
		p.log.Error("failed to parse cost", "error", err)
		return nil, err
	}

	params := &stripe.PaymentIntentCreateParams{
		Amount:   stripe.Int64(int64(costInt * 100)),
		Currency: stripe.String(string(stripe.CurrencyUSD)),
		AutomaticPaymentMethods: &stripe.PaymentIntentCreateAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}
	pi, err := p.sc.V1PaymentIntents.Create(ctx, params)
	if err != nil {
		p.log.Error("failed to create payment intent", "error", err)
		return nil, err
	}
	// err = p.reservationStore.UpdatePaymentIntent(ctx, reservationID, pi.ID)
	// if err != nil {
	// 	p.log.Error("failed to update payment intent", "error", err)
	// 	return nil, err
	// }
	return connect.NewResponse(&service.CreatePaymentIntentResponse{
		ClientSecret: pi.ClientSecret,
	}), nil
}

func (p *PaymentHandler) GetStripePublicKey(ctx context.Context, req *connect.Request[service.GetStripePublicKeyRequest]) (*connect.Response[service.GetStripePublicKeyResponse], error) {
	return connect.NewResponse(&service.GetStripePublicKeyResponse{
		PublicKey: p.config.StripePublicKey,
	}), nil
}

func (p *PaymentHandler) CreatePaymentSession(ctx context.Context, req *connect.Request[service.CreatePaymentIntentRequest]) (*connect.Response[service.CreatePaymentSessionResponse], error) {
	reservation, err := p.reservationStore.Get(ctx, req.Msg.ReservationId)
	if err != nil {
		p.log.Error("failed to get reservation", "error", err)
		return nil, err
	}

	var total time.Duration
	for _, date := range reservation.Dates {
		if date.Approved == models.ReservationDateApprovedDenied || date.Approved == models.ReservationDateApprovedCanceled {
			continue
		}
		start := date.LocalStart.Time
		end := date.LocalEnd.Time
		if end.Before(start) {
			return nil, connect.NewError(connect.CodeFailedPrecondition, err)
		}
		total += end.Sub(start)
	}
	totalHours := max(int64(total/time.Hour), 1)

	domain := p.config.FrontendUrl
	params := &stripe.CheckoutSessionCreateParams{
		ReturnURL: stripe.String(domain + "/reservation/checkout/success"),
		LineItems: []*stripe.CheckoutSessionCreateLineItemParams{
			{
				Price:    stripe.String(reservation.Reservation.PriceID.String),
				Quantity: stripe.Int64(totalHours),
			},
		},
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
	}

	s, err := p.sc.V1CheckoutSessions.Create(ctx, params)
	if err != nil {
		p.log.Error("failed to create checkout session", "error", err)
		return nil, err
	}

	return connect.NewResponse(&service.CreatePaymentSessionResponse{
		Url: s.URL,
	}), nil

}

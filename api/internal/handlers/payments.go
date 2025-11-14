package handlers

import (
	"api/internal/config"
	"api/internal/ports"
	"encoding/json"
	"github.com/stripe/stripe-go/v83"
	"github.com/stripe/stripe-go/v83/paymentintent"
	"log/slog"
	"net/http"
	"strconv"
)

type PaymentHandler struct {
	log              *slog.Logger
	config           *config.Config
	facilityStore    ports.FacilityStore
	reservationStore ports.ReservationStore
}

func NewPaymentHandler(log *slog.Logger, config *config.Config, facilityStore ports.FacilityStore, reservationStore ports.ReservationStore) *PaymentHandler {
	return &PaymentHandler{
		log:              log,
		config:           config,
		facilityStore:    facilityStore,
		reservationStore: reservationStore,
	}
}

func (p *PaymentHandler) HandleCreatePaymentIntent(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		ID string `json:"ID"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	parsedID, err := strconv.ParseInt(req.ID, 10, 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	ctx := r.Context()

	reservation, err := p.reservationStore.Get(ctx, parsedID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	category, err := p.facilityStore.GetCategory(ctx, reservation.Reservation.CategoryID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	stringCost, err := reducer(ctx, category, reservation)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	costInt, err := strconv.ParseInt(stringCost, 10, 64)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(costInt),
		Currency: stripe.String(string(stripe.CurrencyUSD)),
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	resp := struct {
		ClientSecret string `json:"clientSecret"`
	}{
		ClientSecret: pi.ClientSecret,
	}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

}

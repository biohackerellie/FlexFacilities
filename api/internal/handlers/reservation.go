package handlers

import (
	"api/internal/lib/utils"
	"api/internal/models"
	"api/internal/ports"
	service "api/internal/proto/reservation"
	"context"
	"fmt"
	"log/slog"
	"math"
	"time"

	"connectrpc.com/connect"
)

type ReservationHandler struct {
	reservationStore ports.ReservationStore
	facilityStore    ports.FacilityStore
	log              *slog.Logger
	timezone         *time.Location
}

func NewReservationHandler(reservationStore ports.ReservationStore, log *slog.Logger, timezone *time.Location) *ReservationHandler {
	log.With(slog.Group("Core_ReservationHandler", slog.String("name", "reservation")))
	return &ReservationHandler{reservationStore: reservationStore, log: log, timezone: timezone}
}
func (a *ReservationHandler) GetAllReservations(ctx context.Context, req *connect.Request[service.GetAllReservationsRequest]) (*connect.Response[service.AllReservationsResponse], error) {
	res, err := a.reservationStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	reservations := make([]*service.FullReservation, len(res))
	for i, reservation := range res {
		reservations[i] = reservation.ToProto()
	}
	return connect.NewResponse(&service.AllReservationsResponse{
		Reservations: reservations,
	}), nil
}

func (a *ReservationHandler) GetReservation(ctx context.Context, req *connect.Request[service.GetReservationRequest]) (*connect.Response[service.FullReservation], error) {
	res, err := a.reservationStore.Get(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	protoRes := res.ToProto()
	return connect.NewResponse(&service.FullReservation{
		Reservation: protoRes.Reservation,
		Dates:       protoRes.Dates,
		Fees:        protoRes.Fees,
	}), nil
}

func (a *ReservationHandler) RequestCount(ctx context.Context, req *connect.Request[service.RequestCountRequest]) (*connect.Response[service.RequestCountResponse], error) {
	res, err := a.reservationStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	var pendingCount int64
	for _, r := range res {
		if r.Reservation.Approved == "pending" {
			pendingCount++
		}
	}
	return connect.NewResponse(&service.RequestCountResponse{
		Count: pendingCount,
	}), nil
}

func (a *ReservationHandler) GetRequestsThisWeek(ctx context.Context, req *connect.Request[service.GetRequestsThisWeekRequest]) (*connect.Response[service.RequestThisWeekResponse], error) {
	requests, err := a.reservationStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	sevenDaysFromNow := time.Now().Add(time.Hour * 24 * 7)
	filtered := make([]*service.FullReservation, 0)
	for _, r := range requests {
		if r.Reservation.Approved != "denied" {
			for _, d := range r.Dates {
				if d.StartDate.Time.After(time.Now()) && d.StartDate.Time.Before(sevenDaysFromNow) {
					filtered = append(filtered, r.ToProto())
				}
			}
		}
	}
	return connect.NewResponse(&service.RequestThisWeekResponse{
		Reservations: filtered,
	}), nil
}

func (a *ReservationHandler) CreateReservation(ctx context.Context, req *connect.Request[service.CreateReservationRequest]) (*connect.Response[service.CreateReservationResponse], error) {
	reservation := req.Msg.GetReservation()

	id, err := a.reservationStore.Create(ctx, models.ToReservation(reservation.GetReservation()))

	if err != nil {
		return nil, err
	}
	dates := models.ToReservationDates(reservation.GetDates())
	for i := range dates {
		dates[i].ReservationID = id
	}

	err = a.reservationStore.CreateDates(ctx, dates)

	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.CreateReservationResponse{
		Id: id,
	}), nil
}

func (a *ReservationHandler) UpdateReservation(ctx context.Context, req *connect.Request[service.UpdateReservationRequest]) (*connect.Response[service.UpdateReservationResponse], error) {
	reservation := req.Msg.GetReservation()
	err := a.reservationStore.Update(ctx, models.ToReservation(reservation))
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.UpdateReservationResponse{}), nil
}

func (a *ReservationHandler) DeleteReservation(ctx context.Context, req *connect.Request[service.DeleteReservationRequest]) (*connect.Response[service.DeleteReservationResponse], error) {
	err := a.reservationStore.Delete(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationResponse{}), nil
}

func (a *ReservationHandler) UserReservations(ctx context.Context, req *connect.Request[service.UserReservationsRequest]) (*connect.Response[service.UserReservationsResponse], error) {
	res, err := a.reservationStore.GetUserReservations(ctx, req.Msg.GetUserId())
	if err != nil {
		return nil, err
	}
	reservations := make([]*service.FullReservation, len(res))
	for i, reservation := range res {
		reservations[i] = reservation.ToProto()
	}
	return connect.NewResponse(&service.UserReservationsResponse{
		Reservations: reservations,
	}), nil
}

func (a *ReservationHandler) CreateReservationDate(ctx context.Context, req *connect.Request[service.CreateReservationDatesRequest]) (*connect.Response[service.CreateReservationDateResponse], error) {
	dates := models.ToReservationDates(req.Msg.GetDate())
	err := a.reservationStore.CreateDates(ctx, dates)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.CreateReservationDatesResponse{}), nil
}

func (a *ReservationHandler) UpdateReservationDates(ctx context.Context, req *connect.Request[service.UpdateReservationDatesRequest]) (*connect.Response[service.UpdateReservationDateResponse], error) {
	dates := models.ToReservationDates(req.Msg.GetDate())
	for _, d := range dates {
		err := a.reservationStore.UpdateDate(ctx, &d)
		if err != nil {
			return nil, err
		}
	}
	return connect.NewResponse(&service.UpdateReservationDatesResponse{}), nil
}
func (a *ReservationHandler) DeleteReservationDates(ctx context.Context, req *connect.Request[service.DeleteReservationDatesRequest]) (*connect.Response[service.DeleteReservationDateResponse], error) {
	err := a.reservationStore.DeleteDates(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationDateResponse{}), nil
}

func (a *ReservationHandler) CreateReservationFee(ctx context.Context, req *connect.Request[service.CreateReservationFeeRequest]) (*connect.Response[service.CreateReservationFeeResponse], error) {
	fees := models.ToReservationFees(req.Msg.GetFee())
	for i := range fees {
		a.reservationStore.CreateFee(ctx, fees[i])
	}
	return connect.NewResponse(&service.CreateReservationFeeResponse{}), nil
}

func (a *ReservationHandler) UpdateReservationFee(ctx context.Context, req *connect.Request[service.UpdateReservationFeeRequest]) (*connect.Response[service.UpdateReservationFeeResponse], error) {
	// fee := models.ToReservationFee(req.Msg.GetFee())
	// err := a.reservationStore.Update(ctx, fee)
	// if err != nil {
	// 	return nil, err
	// }
	return connect.NewResponse(&service.UpdateReservationFeeResponse{}), nil
}
func (a *ReservationHandler) DeleteReservationFee(ctx context.Context, req *connect.Request[service.DeleteReservationFeeRequest]) (*connect.Response[service.DeleteReservationFeeResponse], error) {
	err := a.reservationStore.DeleteFees(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationFeeResponse{}), nil
}

// Get the total cost of the reservation, rounded to 2 decimal places
func (a *ReservationHandler) CostReducer(ctx context.Context, req *connect.Request[service.CostReducerRequest]) (*connect.Response[service.CostReducerResponse], error) {
	reservation, err := a.reservationStore.Get(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	ids := []int64{reservation.Reservation.CategoryID}
	categories, err := a.facilityStore.GetCategories(ctx, ids)
	if err != nil {
		return nil, err
	}
	category := categories[0]
	loc := a.timezone
	var total time.Duration
	for _, date := range reservation.Dates {
		if date.Approved != models.ReservationDateApprovedApproved {
			continue
		}
		startDate := date.StartDate
		endDate := date.EndDate
		if !endDate.Valid {
			endDate = startDate
		}
		start, err := utils.CombineDateAndTime(loc, startDate, date.StartTime)
		if err != nil {
			return nil, fmt.Errorf("invalid start date: %w", err)
		}
		end, err := utils.CombineDateAndTime(loc, endDate, date.EndTime)
		if err != nil {
			return nil, fmt.Errorf("invalid end date: %w", err)
		}
		if end.Before(start) {
			return nil, fmt.Errorf("end before start for date id %d", date.ID)
		}
		total += end.Sub(start)
	}
	totalMinutes := int64(total / time.Minute)
	fees := 0.0
	for _, fee := range reservation.Fees {
		fees += utils.PGNumericToFloat64(fee.AdditionalFees)
	}

	pricePerHourCents := int64(category.Price * 100)
	feeCents := int64(math.Round(fees * 100))
	costCents := int64(math.Round(float64(pricePerHourCents) * float64(totalMinutes) / 60.0))
	totalCents := max(costCents+feeCents, 0)
	stringCost := fmt.Sprintf("%.2f", float64(totalCents)/100.0)
	return connect.NewResponse(&service.CostReducerResponse{
		Cost: string(stringCost),
	}), nil
}

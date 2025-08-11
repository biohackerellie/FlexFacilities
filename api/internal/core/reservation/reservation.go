package reservation

import (
	"api/internal/models"
	service "api/internal/proto/reservation"
	"context"
	"time"

	"connectrpc.com/connect"
)

func (a *Adapter) GetAllReservations(ctx context.Context, req *connect.Request[service.GetAllReservationsRequest]) (*connect.Response[service.AllReservationsResponse], error) {
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

func (a *Adapter) GetReservation(ctx context.Context, req *connect.Request[service.GetReservationRequest]) (*connect.Response[service.FullReservation], error) {
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

func (a *Adapter) RequestCount(ctx context.Context, req *connect.Request[service.RequestCountRequest]) (*connect.Response[service.RequestCountResponse], error) {
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

func (a *Adapter) GetRequestsThisWeek(ctx context.Context, req *connect.Request[service.GetRequestsThisWeekRequest]) (*connect.Response[service.RequestThisWeekResponse], error) {
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

func (a *Adapter) CreateReservation(ctx context.Context, req *connect.Request[service.CreateReservationRequest]) (*connect.Response[service.CreateReservationResponse], error) {
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

func (a *Adapter) UpdateReservation(ctx context.Context, req *connect.Request[service.UpdateReservationRequest]) (*connect.Response[service.UpdateReservationResponse], error) {
	reservation := req.Msg.Reservation.GetReservation()
	err := a.reservationStore.Update(ctx, models.ToReservation(reservation))
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.UpdateReservationResponse{}), nil
}

func (a *Adapter) DeleteReservation(ctx context.Context, req *connect.Request[service.DeleteReservationRequest]) (*connect.Response[service.DeleteReservationResponse], error) {
	err := a.reservationStore.Delete(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationResponse{}), nil
}

func (a *Adapter) UserReservations(ctx context.Context, req *connect.Request[service.UserReservationsRequest]) (*connect.Response[service.UserReservationsResponse], error) {
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

func (a *Adapter) CreateReservationDate(ctx context.Context, req *connect.Request[service.CreateReservationDateRequest]) (*connect.Response[service.CreateReservationDateResponse], error) {
	dates := models.ToReservationDates(req.Msg.GetDate())
	err := a.reservationStore.CreateDates(ctx, dates)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.CreateReservationDateResponse{}), nil
}

func (a *Adapter) UpdateReservationDate(ctx context.Context, req *connect.Request[service.UpdateReservationDateRequest]) (*connect.Response[service.UpdateReservationDateResponse], error) {
	err := a.reservationStore.UpdateDate(ctx, models.ToReservationDate(req.Msg.GetDate()))
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.UpdateReservationDateResponse{}), nil
}
func (a *Adapter) DeleteReservationDate(ctx context.Context, req *connect.Request[service.DeleteReservationDateRequest]) (*connect.Response[service.DeleteReservationDateResponse], error) {
	err := a.reservationStore.DeleteDates(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationDateResponse{}), nil
}

func (a *Adapter) CreateReservationFee(ctx context.Context, req *connect.Request[service.CreateReservationFeeRequest]) (*connect.Response[service.CreateReservationFeeResponse], error) {
	fees := models.ToReservationFees(req.Msg.GetFee())
	for i := range fees {
		a.reservationStore.CreateFee(ctx, fees[i])
	}
	return connect.NewResponse(&service.CreateReservationFeeResponse{}), nil
}

func (a *Adapter) UpdateReservationFee(ctx context.Context, req *connect.Request[service.UpdateReservationFeeRequest]) (*connect.Response[service.UpdateReservationFeeResponse], error) {
	// fee := models.ToReservationFee(req.Msg.GetFee())
	// err := a.reservationStore.Update(ctx, fee)
	// if err != nil {
	// 	return nil, err
	// }
	return connect.NewResponse(&service.UpdateReservationFeeResponse{}), nil
}
func (a *Adapter) DeleteReservationFee(ctx context.Context, req *connect.Request[service.DeleteReservationFeeRequest]) (*connect.Response[service.DeleteReservationFeeResponse], error) {
	err := a.reservationStore.DeleteFees(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationFeeResponse{}), nil
}

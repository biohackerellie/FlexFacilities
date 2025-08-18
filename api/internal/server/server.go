package server

import (
	"api/internal/handlers"
	facilityMux "api/internal/proto/facilities/facilitiesserviceconnect"
	reservationMux "api/internal/proto/reservation/reservationserviceconnect"
	userMux "api/internal/proto/users/usersserviceconnect"
	"log/slog"
	"net/http"
)

func NewServer(handlers *handlers.Handlers, log *slog.Logger) *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle(facilityMux.NewFacilitiesServiceHandler(handlers.FacilityHandler))
	mux.Handle(reservationMux.NewReservationServiceHandler(handlers.ReservationHandler))
	mux.Handle(userMux.NewUsersServiceHandler(handlers.UserHandler))
	return mux
}

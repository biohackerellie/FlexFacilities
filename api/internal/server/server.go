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
	mux.HandleFunc("/api/auth/{provider}", handlers.Auth.BeginOauth)
	mux.HandleFunc("/api/auth/login", handlers.Auth.Begin2FA)
	mux.HandleFunc("/api/auth/{provider}/callback", handlers.Auth.AuthCallback)
	mux.HandleFunc("/api/auth/{token}/verify", handlers.Auth.Verify2FACode)
	return mux
}

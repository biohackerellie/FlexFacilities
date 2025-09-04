package server

import (
	"api/internal/handlers"
	authMux "api/internal/proto/auth/authserviceconnect"
	facilityMux "api/internal/proto/facilities/facilitiesserviceconnect"
	reservationMux "api/internal/proto/reservation/reservationserviceconnect"
	userMux "api/internal/proto/users/usersserviceconnect"
	"log/slog"
	"net/http"
)

func NewServer(handlers *handlers.Handlers, log *slog.Logger) *http.ServeMux {
	api := http.NewServeMux()
	api.Handle(facilityMux.NewFacilitiesServiceHandler(handlers.FacilityHandler))
	api.Handle(reservationMux.NewReservationServiceHandler(handlers.ReservationHandler))
	api.Handle(userMux.NewUsersServiceHandler(handlers.UserHandler))
	api.Handle(authMux.NewAuthHandler(handlers.Auth))
	mux := http.NewServeMux()
	mux.HandleFunc("/auth/{provider}", handlers.Auth.BeginOauth)
	mux.HandleFunc("/auth/{provider}/callback", handlers.Auth.AuthCallback)
	mux.HandleFunc("/auth/{token}/verify", handlers.Auth.Verify2FACode)
	mux.Handle("/rpc/", http.StripPrefix("/rpc", handlers.Auth.AuthMiddleware(api)))
	return mux
}

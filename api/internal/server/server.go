package server

import (
	"api/internal/handlers"
	authMux "api/internal/proto/auth/authserviceconnect"
	facilityMux "api/internal/proto/facilities/facilitiesserviceconnect"
	reservationMux "api/internal/proto/reservation/reservationserviceconnect"
	userMux "api/internal/proto/users/usersserviceconnect"
	utilityMux "api/internal/proto/utility/utilityserviceconnect"
	"context"
	"errors"
	"log/slog"
	"net/http"
	"runtime/debug"

	"connectrpc.com/connect"
)

func NewServer(handlers *handlers.Handlers, log *slog.Logger) *http.ServeMux {
	api := http.NewServeMux()
	panicInterceptor := connect.WithInterceptors(RecoveryInterceptor())

	facilityPath, facilityHandler := facilityMux.NewFacilitiesServiceHandler(handlers.FacilityHandler)
	api.Handle(facilityPath, handlers.Auth.AuthMiddleware(facilityHandler))

	reservationPath, reservationHandler := reservationMux.NewReservationServiceHandler(handlers.ReservationHandler, panicInterceptor)
	api.Handle(reservationPath, handlers.Auth.AuthMiddleware(reservationHandler))
	userPath, userHandler := userMux.NewUsersServiceHandler(handlers.UserHandler, panicInterceptor)
	api.Handle(userPath, handlers.Auth.AuthMiddleware(userHandler))
	authPath, authHandler := authMux.NewAuthHandler(handlers.Auth, panicInterceptor)
	api.Handle(authPath, handlers.Auth.AuthMiddleware(authHandler))
	api.Handle(utilityMux.NewUtilityServiceHandler(handlers.UtilityHandler, panicInterceptor))
	api.HandleFunc("/auth/{provider}", handlers.Auth.BeginOauth)
	api.HandleFunc("/auth/{provider}/callback", handlers.Auth.AuthCallback)
	return api
}

func RecoveryInterceptor() connect.UnaryInterceptorFunc {
	interceptor := func(next connect.UnaryFunc) connect.UnaryFunc {
		return connect.UnaryFunc(func(
			ctx context.Context,
			req connect.AnyRequest,
		) (res connect.AnyResponse, err error) {
			defer func() {
				if r := recover(); r != nil {
					slog.Error("recovered from server panic", "error", r, "stack", string(debug.Stack()))
					err = connect.NewError(connect.CodeInternal, errors.New("recovered from server panic"))
				}
			}()
			return next(ctx, req)
		})
	}
	return connect.UnaryInterceptorFunc(interceptor)
}

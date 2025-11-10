package server

import (
	"api/internal/handlers"
	"api/internal/lib/utils"
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
	"github.com/go-chi/chi/v5"
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

	api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	r := chi.NewRouter()
	r.Route("/auth", func(r chi.Router) {
		r.HandleFunc("/{provider}", handlers.Auth.BeginOauth)
		r.HandleFunc("/{provider}/callback", handlers.Auth.AuthCallback)
		r.HandleFunc("/verify", handlers.Auth.Verify)
		r.HandleFunc("/session", handlers.Auth.GetSessionHandler)
		r.HandleFunc("/logout", handlers.Auth.LogoutHandler)
	})
	r.Route("/files", func(r chi.Router) {
		r.Get("/images/{file}", handlers.FilesHandler.GetImage)
		r.Get("/images/{building}/{file}", handlers.FilesHandler.GetFacilityImage)
		r.Get("/images/{building}/{facility}/{file}", handlers.FilesHandler.GetFacilityImage)
		r.Post("/images/{building}/{facility}", handlers.FilesHandler.UploadFacilityImage)
		r.Get("/documents/{reservationID}/{file}", handlers.FilesHandler.GetReservationFile)
		r.Post("/documents/{reservationID}", handlers.FilesHandler.UploadReservationFile)
	})
	api.Handle("/", r)
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
					stack := debug.Stack()
					method := req.Spec().Procedure
					requestID := "unknown"
					if id, ok := ctx.Value(utils.CtxKey("requestID")).(string); ok {
						requestID = id
					}
					slog.Error("panic recovered",
						"error", r,
						"method", method,
						"requestID", requestID,
						"stack", string(stack),
					)
					err = connect.NewError(connect.CodeInternal, errors.New("recovered from server panic"))
				}
			}()
			return next(ctx, req)
		})
	}
	return connect.UnaryInterceptorFunc(interceptor)
}

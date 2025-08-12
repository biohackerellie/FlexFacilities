package handlers

import (
	"api/internal/auth"
	"api/internal/config"
	repository "api/internal/db"
	"fmt"
	"log/slog"

	"github.com/biohackerellie/flexauth"
	"github.com/biohackerellie/flexauth/providers/entra"
)

type Handlers struct {
	UserHandler        *UserHandler
	FacilityHandler    *FacilityHandler
	ReservationHandler *ReservationHandler
	Auth               *auth.Auth
}

func New(db *repository.DB, log *slog.Logger, config *config.Config) {

	userStore := repository.NewUserStore(db, log)
	facilityStore := repository.NewFacilityStore(db, log)
	reservationStore := repository.NewReservationStore(db, log)

	entraconfig := flexauth.Config{
		ClientID:     config.EntraClientID,
		ClientSecret: config.EntraClientSecret,
		RedirectURL:  fmt.Sprintf("%s/api/auth/entra/callback", config.Host),
	}
	entraProvider := entra.NewEntraProvider(entraconfig, config.EntraTenant)
	authHandler := auth.NewAuth(userStore, log)
	authHandler.RegisterProvider("entra", entraProvider)

}

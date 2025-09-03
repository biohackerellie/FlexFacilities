package handlers

import (
	"api/internal/auth"
	"api/internal/config"
	repository "api/internal/db"
	"api/pkg/calendar"
	"context"
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
	Calendar           *calendar.Calendar
}

func New(db *repository.DB, log *slog.Logger, config *config.Config) *Handlers {

	cal, err := calendar.NewCalendar(context.Background())
	if err != nil {
		log.Error("Could not create calendar", "error", err)
		panic(err)
	}
	userStore := repository.NewUserStore(db, log)
	facilityStore := repository.NewFacilityStore(db, log)
	reservationStore := repository.NewReservationStore(db, log)

	entraconfig := flexauth.Config{
		ClientID:     config.EntraClientID,
		ClientSecret: config.EntraClientSecret,
		RedirectURL:  fmt.Sprintf("%s/api/auth/entra/callback", config.Host),
	}
	entraProvider := entra.NewEntraProvider(entraconfig, config.EntraTenant)
	authHandler := auth.NewAuth(userStore, log, config)
	authHandler.RegisterProvider("entra", entraProvider)

	userHandler := NewUserHandler(userStore, log)
	facilityHandler := NewFacilityHandler(facilityStore, log)
	reservationHandler := NewReservationHandler(reservationStore, log)

	return &Handlers{
		UserHandler:        userHandler,
		FacilityHandler:    facilityHandler,
		ReservationHandler: reservationHandler,
		Auth:               authHandler,
		Calendar:           cal,
	}
}

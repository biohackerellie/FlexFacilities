package handlers

import (
	"api/internal/auth"
	"api/internal/config"
	repository "api/internal/db"
	"api/pkg/calendar"
	"api/pkg/files"
	"context"
	"fmt"
	"github.com/biohackerellie/flexauth"
	"github.com/biohackerellie/flexauth/providers/entra"
	"log/slog"
	"time"
)

type Handlers struct {
	UserHandler        *UserHandler
	FacilityHandler    *FacilityHandler
	ReservationHandler *ReservationHandler
	UtilityHandler     *UtilityHandler
	Auth               *auth.Auth
	FilesHandler       *FileHandler
}

func New(db *repository.DB, log *slog.Logger, config *config.Config) *Handlers {

	cal, err := calendar.NewCalendar(context.Background(), config.GoogleClientID, config.GoogleClientSecret, config.GoogleRefreshToken, time.Local, config.Timezone)
	if err != nil {
		log.Error("Could not create calendar", "error", err)
		panic(err)
	}
	localFiles := files.NewLocalFileStorage(config.FilesPath, config.FrontendUrl)
	userStore := repository.NewUserStore(db, log)
	facilityStore := repository.NewFacilityStore(db, log)
	reservationStore := repository.NewReservationStore(db, log)
	brandingStore := repository.NewBrandingStore(db, log)
	filesHandler := NewFileHandler(localFiles, log)

	entraconfig := flexauth.Config{
		ClientID:     config.EntraClientID,
		ClientSecret: config.EntraClientSecret,
		RedirectURL:  fmt.Sprintf("%s/api/auth/entra/callback", config.FrontendUrl),
	}
	log.Debug("Entra config", "config", entraconfig)
	log.Debug("Entra tenant", "tenant", config.EntraTenant)
	entraProvider := entra.NewEntraProvider(entraconfig, config.EntraTenant)
	authHandler := auth.NewAuth(userStore, log, config)
	authHandler.RegisterProvider("entra", entraProvider)

	timezone, err := time.LoadLocation(config.Timezone)
	if err != nil {
		log.Error("Could not load timezone", "error", err)
		panic(err)
	}
	userHandler := NewUserHandler(userStore, log)
	facilityHandler := NewFacilityHandler(facilityStore, log, cal)
	reservationHandler := NewReservationHandler(reservationStore, userStore, facilityStore, log, timezone, config)
	utilityHandler := NewUtilityHandler(reservationStore, brandingStore, log, timezone)

	return &Handlers{
		UserHandler:        userHandler,
		FacilityHandler:    facilityHandler,
		ReservationHandler: reservationHandler,
		UtilityHandler:     utilityHandler,
		Auth:               authHandler,
		FilesHandler:       filesHandler,
	}
}

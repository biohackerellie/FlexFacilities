package handlers

import (
	"api/internal/auth"
	"api/internal/config"
	repository "api/internal/db"
	"api/pkg/calendar"
	"api/pkg/files"
	"fmt"
	"log/slog"
	"time"

	"github.com/biohackerellie/flexauth"
	"github.com/biohackerellie/flexauth/providers/entra"
	"github.com/stripe/stripe-go/v83"
)

type Handlers struct {
	UserHandler        *UserHandler
	FacilityHandler    *FacilityHandler
	ReservationHandler *ReservationHandler
	UtilityHandler     *UtilityHandler
	Auth               *auth.Auth
	FilesHandler       *FileHandler
	PaymentHandler     *PaymentHandler
}

func New(dbService *repository.DBService, log *slog.Logger, config *config.Config, cal *calendar.Calendar) *Handlers {

	localFiles := files.NewLocalFileStorage(config.FilesPath, config.FrontendUrl)
	filesHandler := NewFileHandler(localFiles, log, dbService.FacilityStore, dbService.ReservationStore)
	stripeClient := stripe.NewClient(config.StripeSecretKey)
	entraconfig := flexauth.Config{
		ClientID:     config.EntraClientID,
		ClientSecret: config.EntraClientSecret,
		RedirectURL:  fmt.Sprintf("%s/api/auth/entra/callback", config.FrontendUrl),
	}

	entraProvider := entra.NewEntraProvider(entraconfig, config.EntraTenant)
	authHandler := auth.NewAuth(dbService.UserStore, log, config)
	authHandler.RegisterProvider(entraProvider.Name(), entraProvider)

	timezone, err := time.LoadLocation(config.Timezone)
	if err != nil {
		log.Error("Could not load timezone", "error", err)
		panic(err)
	}
	userHandler := NewUserHandler(dbService.UserStore, log)
	facilityHandler := NewFacilityHandler(dbService.FacilityStore, log, cal, stripeClient)
	reservationHandler := NewReservationHandler(dbService.ReservationStore, dbService.UserStore, dbService.FacilityStore, log, timezone, config, cal, stripeClient)
	utilityHandler := NewUtilityHandler(dbService.ReservationStore, dbService.BrandingStore, log, timezone)
	paymentHandler := NewPaymentHandler(log, config, dbService.FacilityStore, dbService.ReservationStore, stripeClient)

	return &Handlers{
		UserHandler:        userHandler,
		FacilityHandler:    facilityHandler,
		ReservationHandler: reservationHandler,
		UtilityHandler:     utilityHandler,
		Auth:               authHandler,
		FilesHandler:       filesHandler,
		PaymentHandler:     paymentHandler,
	}
}

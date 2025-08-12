package main

import (
	"api/internal/auth"
	"api/internal/config"
	repository "api/internal/db"
	"api/internal/lib/logger"
	"api/internal/lib/workers"
	"api/internal/server"
	"io"

	"context"
	"log/slog"
	"net/http"
	"strings"
	"syscall"
	"time"

	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	"github.com/joho/godotenv"
)

var log *slog.Logger

func run(ctx context.Context, stdout io.Writer, getenv func(string) string) error {

	config := config.New(getenv)
	logLevel := config.LogLevel
	if logLevel == "" {
		logLevel = "info"
	}
	verboseLogging := config.VerboseLogging == "true"
	local := config.AppEnv != "production"

	if local {
		err := godotenv.Load("../.env")
		if err != nil {
			return err
		}
	}
	logOptions := logger.LogOptions(strings.TrimSpace(strings.ToLower(logLevel)), verboseLogging, local)

	if local {
		log = slog.New(slog.NewTextHandler(stdout, logOptions))
	} else {
		log = slog.New(slog.NewJSONHandler(stdout, logOptions))
	}

	db := repository.NewDB(ctx, config.DatabaseURL)
	defer db.Close()

	facilityStore := repository.NewFacilityStore(db, log)
	reservationStore := repository.NewReservationStore(db, log)
	userStore := repository.NewUserStore(db, log)

	ReservationService := reservation.NewAdapter(reservationStore, log)
	FacilityService := facility.NewAdapter(facilityStore, log)
	UserService := user.NewAdapter(userStore, log)
	AuthService := auth.NewAuthService(userStore, log)

	s := server.NewServer(db, log)
	handler := h2c.NewHandler(s, &http2.Server{})
	srv := &http.Server{
		Addr:              "0.0.0.0:3030",
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("Could not start server", slog.Any("error", err))
			panic(err)
		}
	}()

	mgr := workers.NewManager()
	janitor := workers.NewWorker(&workers.Janitor{
		Auth:      nil,
		UserStore: nil,
		Interval:  5 * time.Minute,
		Logger:    log,
	})
	mgr.Add(janitor)
	mgr.Start(ctx)

	return nil
}

func waitForShutdown(srv *http.Server, ctx context.Context, cancel context.CancelFunc) {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig
	log.Info("Shutting down")
	cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Error("Could not gracefully shutdown the server", slog.Any("err", err))
		os.Exit(1)
	}
}

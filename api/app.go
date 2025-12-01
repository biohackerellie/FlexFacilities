package main

import (
	"api/internal/config"
	repository "api/internal/db"
	"api/internal/handlers"
	"api/internal/lib/logger"
	"api/internal/lib/workers"
	"api/internal/server"
	"api/pkg/calendar"
	"context"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	"github.com/joho/godotenv"
)

var (
	log    *slog.Logger
	AppEnv = "development"
)

func Run(ctx context.Context, stdout io.Writer, getenv func(string, string) string) error {

	local := AppEnv != "production"
	if local {
		err := godotenv.Load("../.env")
		if err != nil {
			return err
		}
	}

	config, err := config.New(getenv, AppEnv)
	if err != nil {
		return err
	}
	if config.AppEnv != "production" {
		local = true
	}
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	logLevel := config.LogLevel
	if logLevel == "" {
		logLevel = "info"
	}
	verboseLogging := config.VerboseLogging == "true"

	logOptions := logger.LogOptions(strings.TrimSpace(strings.ToLower(logLevel)), verboseLogging, local)
	var withContext *logger.ContextLogger
	if local {
		baselog := slog.NewTextHandler(stdout, logOptions)
		withContext = &logger.ContextLogger{Handler: baselog}
	} else {
		baselog := slog.NewJSONHandler(stdout, logOptions)
		withContext = &logger.ContextLogger{Handler: baselog}
	}

	log = slog.New(withContext)
	slog.SetDefault(log)

	log.Info("Starting server", "local", local, "app_env", config.AppEnv, "log_level", logLevel, "verbose_logging", verboseLogging)
	db := repository.InitDB(ctx, config.DatabaseURL)
	defer db.Close()

	dbService := repository.NewDBService(db, log)

	cal, err := createCalendar(ctx, config, log)
	if err != nil {
		panic(err)
	}
	h := handlers.New(dbService, log, config, cal)
	s := server.NewServer(h, log)
	handler := h2c.NewHandler(s, &http2.Server{})
	srv := &http.Server{
		Addr:              "0.0.0.0:8080",
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error("Could not start server", slog.Any("error", err))
			panic(err)
		}
	}()

	log.Info("Server started", "addr", srv.Addr)

	mgr := workers.NewManager()
	janitor := workers.NewWorker(&workers.Janitor{
		Auth:      nil,
		UserStore: nil,
		Interval:  5 * time.Minute,
		Logger:    log,
	})
	mgr.Add(janitor)

	// Only add calendar sync worker if calendar was created successfully
	if cal != nil {
		calendarSync := workers.NewWorker(&workers.CalendarSync{
			FacilityStore: dbService.FacilityStore,
			Calendar:      cal,
			Interval:      2 * time.Hour,
			Logger:        log,
		})
		mgr.Add(calendarSync)
	}

	mgr.Start(ctx)

	log.Info("Workers started")
	waitForShutdown(srv, ctx, cancel, log)
	return nil
}

func createCalendar(ctx context.Context, config *config.Config, log *slog.Logger) (*calendar.Calendar, error) {
	// Configure rate limiting to prevent hitting Google Calendar API limits
	// Google allows ~10 queries per second per user
	rateLimitConfig := &calendar.RateLimitConfig{
		MaxConcurrent: 5, // Limit to 5 concurrent API calls
		MaxRetries:    5, // Retry up to 5 times with exponential backoff
		Logger:        log,
	}

	return calendar.NewCalendarWithRateLimit(
		ctx,
		config.GoogleClientID,
		config.GoogleClientSecret,
		config.GoogleRefreshToken,
		config.Location,
		config.Timezone,
		rateLimitConfig,
	)
}

func waitForShutdown(srv *http.Server, ctx context.Context, cancel context.CancelFunc, log *slog.Logger) {
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

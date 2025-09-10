package main

import (
	"api/internal/config"
	repository "api/internal/db"
	"api/internal/handlers"
	"api/internal/lib/logger"
	"api/internal/lib/workers"
	"api/internal/server"
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

var log *slog.Logger

func Run(ctx context.Context, stdout io.Writer, getenv func(string, string) string) error {

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	config, err := config.New(getenv)
	if err != nil {
		return err
	}
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

	log.Info("Starting server", "local", local, "log_level", logLevel, "verbose_logging", verboseLogging)
	db := repository.NewDB(ctx, config.DatabaseURL)
	defer db.Close()

	h := handlers.New(db, log, config)
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
	mgr.Start(ctx)

	log.Info("Workers started")
	waitForShutdown(srv, ctx, cancel, log)
	return nil
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

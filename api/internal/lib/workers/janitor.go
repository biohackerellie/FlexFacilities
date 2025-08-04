package workers

import (
	"context"
	"log/slog"
	"time"

	"api/internal/ports"
)

type Janitor struct {
	DB       ports.DBService
	Auth     ports.AuthService
	Interval time.Duration
	Logger   *slog.Logger
}

func (j *Janitor) Name() string { return "Janitor" }

func (j *Janitor) Run(ctx context.Context) {
	// Handle zero or negative intervals by using a reasonable minimum
	interval := j.Interval
	if interval <= 0 {
		interval = time.Second // Default minimum interval
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			j.Logger.Info("Exiting", "name", j.Name())
			return
		case <-ticker.C:
			err := j.DB.DeleteExpiredSessions(ctx)
			j.Auth.CleanupExpiredTokens(ctx)
			if err != nil {
				j.Logger.Error("Failed to delete expired sessions", "error", err)
			} else {
				j.Logger.Info("Expired sessions deleted successfully")
			}
		}
	}
}

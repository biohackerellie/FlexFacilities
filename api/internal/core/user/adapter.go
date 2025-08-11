package user

import (
	"api/internal/ports"
	"log/slog"
)

type Adapter struct {
	userStore ports.UserStore
	log       *slog.Logger
}

func NewAdapter(userStore ports.UserStore, log *slog.Logger) *Adapter {
	log.With(slog.Group("Core_Adapter", slog.String("name", "user")))
	return &Adapter{userStore: userStore, log: log}
}

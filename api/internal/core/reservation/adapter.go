package reservation

import (
	"api/internal/ports"
	"log/slog"
)

type Adapter struct {
	reservationStore ports.ReservationStore
	log              *slog.Logger
}

func NewAdapter(reservationStore ports.ReservationStore, log *slog.Logger) *Adapter {
	log.With(slog.Group("Core_Adapter", slog.String("name", "reservation")))
	return &Adapter{reservationStore: reservationStore, log: log}
}

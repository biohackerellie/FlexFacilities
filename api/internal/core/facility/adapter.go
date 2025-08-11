package facility

import (
	"api/internal/ports"
	"log/slog"
)

type Adapter struct {
	facilityStore ports.FacilityStore
	log           *slog.Logger
}

func NewAdapter(facilityStore ports.FacilityStore, log *slog.Logger) *Adapter {
	log.With(slog.Group("Core_Adapter", slog.String("name", "facility")))
	return &Adapter{facilityStore: facilityStore, log: log}
}

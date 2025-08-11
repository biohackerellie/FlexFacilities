package server

import (
	facilityMux "api/internal/proto/facilities/facilitiesserviceconnect"
	reservationMux "api/internal/proto/reservation/reservationserviceconnect"
	userMux "api/internal/proto/users/usersserviceconnect"
	"net/http"

	"api/internal/core/facility"
	"api/internal/core/reservation"
	"api/internal/core/user"
	repository "api/internal/db"
	"log/slog"
)

func NewServer(db *repository.DB, log *slog.Logger) *http.ServeMux {
	facilityStore := repository.NewFacilityStore(db, log)
	reservationStore := repository.NewReservationStore(db, log)
	userStore := repository.NewUserStore(db, log)

	ReservationService := reservation.NewAdapter(reservationStore, log)
	FacilityService := facility.NewAdapter(facilityStore, log)
	UserService := user.NewAdapter(userStore, log)

	mux := http.NewServeMux()
	mux.Handle(facilityMux.NewFacilitiesServiceHandler(FacilityService))
	mux.Handle(reservationMux.NewReservationServiceHandler(ReservationService))
	mux.Handle(userMux.NewUsersServiceHandler(UserService))

	return mux
}

package handlers

import (
	"api/internal/models"
	"api/internal/ports"
	"api/pkg/files"
	"fmt"
	"log/slog"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type FileHandler struct {
	fileStorage      files.FileStorage
	log              *slog.Logger
	facilityStore    ports.FacilityStore
	reservationStore ports.ReservationStore
}

func NewFileHandler(fileStorage files.FileStorage, log *slog.Logger, facilityStore ports.FacilityStore, reservationStore ports.ReservationStore) *FileHandler {
	return &FileHandler{fileStorage: fileStorage, log: log, facilityStore: facilityStore, reservationStore: reservationStore}
}

func (a *FileHandler) UploadReservationFile(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "multipart/form-data") {
		http.Error(w, "invalid content type", http.StatusBadRequest)
		return
	}
	err := r.ParseMultipartForm(32 << 20) // 32 MB
	if err != nil {
		a.log.Error("Failed to parse multipart form", "err", err)
		http.Error(w, "failed to parse multipart form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		a.log.Error("Failed to get file", "err", err)
		http.Error(w, "failed to get file", http.StatusBadRequest)
		return
	}
	reservationID := r.PathValue("reservationID")
	path := fmt.Sprintf("documents/%s", reservationID)
	err = a.fileStorage.Store(file, header, path)
	if err != nil {
		a.log.Error("Failed to store file", "err", err)
		http.Error(w, "failed to store file", http.StatusBadRequest)
		return
	}
	parsed, _ := strconv.ParseInt(reservationID, 10, 64)
	reservation, err := a.reservationStore.Get(r.Context(), parsed)
	if err != nil {
		a.log.Error("Failed to get reservation", "err", err)
		http.Error(w, "failed to get reservation", http.StatusBadRequest)
		return
	}
	dbPath := fmt.Sprintf("%s/%s", path, header.Filename)
	reservation.Reservation.InsuranceLink = models.CheckNullString(dbPath)
	a.log.DebugContext(r.Context(), "Updated reservation", "reservation", reservation, "path", dbPath)

	err = a.reservationStore.Update(r.Context(), &reservation.Reservation)
	if err != nil {
		a.log.Error("Failed to update reservation", "err", err)
		http.Error(w, "failed to update reservation", http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)

}

func (a *FileHandler) GetReservationFile(w http.ResponseWriter, r *http.Request) {
	reservationID := r.PathValue("reservationID")
	file := r.PathValue("file")
	path := filepath.Join("documents", reservationID, file)
	reader, err := a.fileStorage.Get(path)
	if err != nil {
		a.log.Error("Failed to get file", "err", err)
		http.Error(w, "failed to get file", http.StatusBadRequest)
		return
	}
	http.ServeContent(w, r, path, time.Now(), reader)
}

// Handler works for getting the building image and facility image
// @path: images/{building}  or  images/{building}/{facility}
func (a *FileHandler) GetFacilityImage(w http.ResponseWriter, r *http.Request) {
	a.log.Debug("Get facility image", "path", r.URL.Path)
	building := r.PathValue("building")
	facility := r.PathValue("facility")
	file := r.PathValue("file")
	path := filepath.Join("images", building, facility, file)
	a.log.Debug("Get facility image", "path", path)
	reader, err := a.fileStorage.Get(path)
	if err != nil {
		a.log.Error("Failed to get file", "err", err)
		http.Error(w, "failed to get file", http.StatusBadRequest)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=86400")
	http.ServeContent(w, r, path, time.Now(), reader)
}

// Handler gets other images like logo, cover, etc
// @path: images/{file}
func (a *FileHandler) GetImage(w http.ResponseWriter, r *http.Request) {
	a.log.Debug("Get image", "path", r.URL.Path)
	file := r.PathValue("file")
	path := filepath.Join("images", file)
	reader, err := a.fileStorage.Get(path)
	if err != nil {
		a.log.Error("Failed to get file", "err", err)
		http.Error(w, "failed to get file", http.StatusBadRequest)
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=86400")
	http.ServeContent(w, r, path, time.Now(), reader)
}

func (a *FileHandler) UploadFacilityImage(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "multipart/form-data") {
		http.Error(w, "invalid content type", http.StatusBadRequest)
		return
	}
	a.log.Debug("Upload facility image", "request", r)
	err := r.ParseMultipartForm(32 << 20) // 32 MB
	if err != nil {
		a.log.Error("file too large", "err", err)
		http.Error(w, "file too large", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		a.log.Error("Failed to get file", "err", err)
		http.Error(w, "failed to get file", http.StatusBadRequest)
		return
	}
	building := r.PathValue("building")
	facilityId := r.PathValue("facility")
	parsed, _ := strconv.ParseInt(facilityId, 10, 64)
	path := fmt.Sprintf("images/%s/%s", building, facilityId)
	err = a.fileStorage.Store(file, header, path)
	if err != nil {
		a.log.Error("Failed to store file", "err", err)
		http.Error(w, "failed to store file", http.StatusBadRequest)
		return
	}
	facility, err := a.facilityStore.Get(r.Context(), parsed)
	if err != nil {
		a.log.Error("Failed to get facility", "err", err)
		http.Error(w, "failed to get facility", http.StatusBadRequest)
		return
	}
	facility.Facility.ImagePath = models.CheckNullString(path) //nolint:errcheck // path
	err = a.facilityStore.Update(r.Context(), facility.Facility)
	if err != nil {
		a.log.Error("Failed to update facility", "err", err)
		http.Error(w, "failed to update facility", http.StatusBadRequest)
		return
	}
}

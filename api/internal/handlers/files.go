package handlers

import (
	"api/pkg/files"
	"fmt"
	"log/slog"
	"net/http"
	"path/filepath"
	"time"
)

type FileHandler struct {
	fileStorage files.FileStorage
	log         *slog.Logger
}

func NewFileHandler(fileStorage files.FileStorage, log *slog.Logger) *FileHandler {
	return &FileHandler{fileStorage: fileStorage, log: log}
}

func (a *FileHandler) UploadReservationFile(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	if contentType != "multipart/form-data" {
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
}

func (a *FileHandler) GetReservationFile(w http.ResponseWriter, r *http.Request) {
	reservationID := r.PathValue("reservationID")
	path := fmt.Sprintf("documents/%s", reservationID)
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

// Hanlder gets other images like logo, cover, etc
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
	if contentType != "multipart/form-data" {
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
	building := r.PathValue("building")
	facility := r.PathValue("facility")
	path := fmt.Sprintf("images/%s/%s", building, facility)
	err = a.fileStorage.Store(file, header, path)
	if err != nil {
		a.log.Error("Failed to store file", "err", err)
		http.Error(w, "failed to store file", http.StatusBadRequest)
		return
	}
}

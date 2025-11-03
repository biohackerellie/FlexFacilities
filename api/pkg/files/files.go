package files

import (
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/HugoSmits86/nativewebp"
)

type LocalFileStorage struct {
	BasePath string // data/files/
	BaseURL  string // localhost:3000/api/files
}

type FileStorage interface {
	Store(file multipart.File, header *multipart.FileHeader, path string) error
	Get(path string) (io.ReadSeeker, error)
	Delete(path string) error
}

const maxFileSize = 1024 * 1024 * 10 // 10 MB

func NewLocalFileStorage(basePath, baseURL string) *LocalFileStorage {
	path := filepath.Clean(basePath)
	path = filepath.Join(path, "files")
	documentsPath := filepath.Join(path, "documents")
	imagesPath := filepath.Join(path, "images")
	if err := os.MkdirAll(path, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create storage directory : %v", err))
	}
	if err := os.MkdirAll(documentsPath, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create storage directory : %v", err))
	}
	if err := os.MkdirAll(imagesPath, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create storage directory : %v", err))
	}
	return &LocalFileStorage{
		BasePath: path,
		BaseURL:  baseURL,
	}
}

func (s *LocalFileStorage) Store(file multipart.File, header *multipart.FileHeader, path string) error {
	fileName := header.Filename
	fullPath := filepath.Join(s.BasePath, path, fileName)

	if _, err := os.Stat(fullPath); err == nil {
		return fmt.Errorf("file already exists: %s", fullPath)
	}
	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	dst, err := os.Create(fullPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	if ok := ValidateFileType(header.Header.Get("Content-Type"), header.Size); !ok {
		return fmt.Errorf("invalid file type")
	}

	_, err = io.Copy(dst, file)
	if err != nil {
		return fmt.Errorf("failed to copy file: %w", err)
	}

	return nil
}

// Finds a file in the given path and returns a readseeker
func (s *LocalFileStorage) Get(path string) (io.ReadSeeker, error) {
	fullPath := filepath.Join(s.BasePath, path)

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("file not found: %s", fullPath)
	}
	return os.Open(fullPath)
}

// ValidateFileType checks if the file type is allowed
func ValidateFileType(contentType string, fileSize int64) bool {
	allowedTypes := []string{
		"image/jpeg", "image/png", "image/gif", "image/webp",
		"application/pdf", "text/plain",
		"application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	}

	if slices.Contains(allowedTypes, contentType) {
		return ValidateFileSize(fileSize, maxFileSize)
	}
	return false
}

// ValidateFileSize checks if the file size is within limits
func ValidateFileSize(size int64, maxSizeMB int64) bool {
	maxSizeBytes := maxSizeMB * 1024 * 1024
	return size <= maxSizeBytes
}

func (s *LocalFileStorage) ConvertToWebp(inputPath string) error {
	fullPath := filepath.Join(s.BasePath, inputPath)
	f, err := os.Open(fullPath)
	if err != nil {
		return err
	}
	defer f.Close()

	ext := strings.ToLower(filepath.Ext(inputPath))
	var img image.Image
	switch ext {
	case ".jpg", ".jpeg":
		img, err = jpeg.Decode(f)
	case ".png":
		img, err = png.Decode(f)
	default:
		return fmt.Errorf("unsupported image format: %s", ext)
	}
	if err != nil {
		return err
	}

	outPath := strings.TrimSuffix(inputPath, filepath.Ext(inputPath)) + ".webp"
	out, err := os.Create(outPath)
	if err != nil {
		return err
	}
	defer out.Close()

	if err := nativewebp.Encode(out, img, nil); err != nil {
		return err
	}
	if err := os.Remove(fullPath); err != nil {
		return err
	}
	return nil
}

func (f *LocalFileStorage) Delete(path string) error {
	return nil
}

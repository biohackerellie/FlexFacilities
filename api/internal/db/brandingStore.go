package db

import (
	"api/internal/models"
	"log/slog"
)

type BrandingStore struct {
	log *slog.Logger
	db  *DB
}

func NewBrandingStore(db *DB, log *slog.Logger) *BrandingStore {
	log.With("layer", "db", "store", "branding")
	return &BrandingStore{db: db, log: log}
}

func (s *BrandingStore) Get() (*models.Branding, error) {
	var branding models.Branding
	err := s.db.Get(&branding, "SELECT * FROM branding LIMIT 1")
	if err != nil {
		return nil, err
	}
	return &branding, nil
}

const updateBrandingQuery = `UPDATE branding SET
	organization_name = :organization_name,
	organization_logo_path = :organization_logo_path,
	organization_primary_color = :organization_primary_color,
	organization_secondary_color = :organization_secondary_color,
	organization_url = :organization_url,
	organization_description = :organization_description,
	organization_email = :organization_email
	WHERE id = :id
`

func (s *BrandingStore) Update(branding *models.Branding) error {
	params := map[string]any{
		"id":                           branding.ID,
		"organization_name":            branding.OrganizationName,
		"organization_logo_path":       branding.OrganizationLogoPath,
		"organization_primary_color":   branding.OrganizationPrimaryColor,
		"organization_secondary_color": branding.OrganizationSecondaryColor,
		"organization_url":             branding.OrganizationUrl,
		"organization_description":     branding.OrganizationDescription,
		"organization_email":           branding.OrganizationEmail,
	}
	_, err := s.db.NamedExec(updateBrandingQuery, params)
	return err
}

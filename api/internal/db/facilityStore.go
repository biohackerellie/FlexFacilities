package db

import (
	"api/internal/models"
	"context"
	"database/sql"
	"errors"
	"log/slog"

	"github.com/jmoiron/sqlx"
)

type FacilityStore struct {
	log *slog.Logger
	db  *DB
}

func NewFacilityStore(db *DB, log *slog.Logger) *FacilityStore {
	log.With("layer", "db", "store", "facility")
	return &FacilityStore{db: db, log: log}
}

const (
	createFacilityQuery   = `INSERT INTO facilities (name, description, price) VALUES ($1, $2, $3) RETURNING id`
	getAllFacilitiesQuery = `SELECT * FROM facilities`
	updateFacilityQuery   = `UPDATE facilities SET name = $2, description = $3, price = $4 WHERE id = $1`
	deleteFacilityQuery   = `DELETE FROM facilities WHERE id = $1`

	getFacilityQuery = `SELECT * FROM facilities WHERE id = $1`
)

func (f *FacilityStore) Get(ctx context.Context, id int64) (*models.FacilityWithCategories, error) {
	var facility models.Facility
	var categories []models.Category
	if err := f.db.GetContext(ctx, &facility, getFacilityQuery, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if err := f.db.SelectContext(ctx, &categories, "SELECT * FROM categories WHERE facility_id = $1", id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			categories = []models.Category{}
		}
		return nil, err
	}
	facilityWithCategories := &models.FacilityWithCategories{
		Facility:   facility,
		Categories: categories,
	}
	return facilityWithCategories, nil
}

const allCategoriesInQuery = `SELECT * FROM categories WHERE facility_id IN (?)`

func (f *FacilityStore) GetAll(ctx context.Context) ([]*models.FacilityWithCategories, error) {
	var facilities []*models.Facility
	if err := f.db.SelectContext(ctx, &facilities, getAllFacilitiesQuery); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if len(facilities) == 0 {
		return []*models.FacilityWithCategories{}, nil
	}
	facilityIds := make([]int64, len(facilities))
	for i, facility := range facilities {
		facilityIds[i] = facility.ID
	}
	var categories []models.Category
	query, args, err := sqlx.In(allCategoriesInQuery, facilityIds)
	if err != nil {
		return nil, err
	}
	query = f.db.Rebind(query)
	err = f.db.SelectContext(ctx, &categories, query, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			categories = []models.Category{}
		}
		return nil, err
	}

	facilityWithCategories := make([]*models.FacilityWithCategories, len(facilities))
	categoriesByFacility := make(map[int64][]models.Category)
	for _, category := range categories {
		categoriesByFacility[category.FacilityID] = append(categoriesByFacility[category.FacilityID], category)
	}
	for i, facility := range facilities {
		facilityWithCategories[i] = &models.FacilityWithCategories{
			Facility:   *facility,
			Categories: categoriesByFacility[facility.ID],
		}
	}
	return facilityWithCategories, nil
}

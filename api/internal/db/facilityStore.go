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

const getFacilityQuery = `SELECT * FROM facilities WHERE id = $1`

func (f *FacilityStore) Get(ctx context.Context, id int64) (*models.FullFacility, error) {
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
	var reservations []models.Reservation
	if err := f.db.SelectContext(ctx, &reservations, "SELECT * FROM reservations WHERE facility_id = $1", id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			reservations = []models.Reservation{}
		}
		return nil, err
	}
	reservationIds := make([]int64, len(reservations))
	for i, res := range reservations {
		reservationIds[i] = res.ID
	}
	facilityWithCategories := &models.FullFacility{
		Facility:       &facility,
		Categories:     categories,
		ReservationIDs: reservationIds,
	}
	return facilityWithCategories, nil
}

const allCategoriesInQuery = `SELECT * FROM categories WHERE facility_id IN (?)`
const getAllFacilitiesQuery = `SELECT * FROM facilities`

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

	categories, err := f.GetCategories(ctx, facilityIds)
	if err != nil {
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

func (f *FacilityStore) GetCategories(ctx context.Context, ids []int64) ([]models.Category, error) {
	var categories []models.Category
	query, args, err := sqlx.In(allCategoriesInQuery, ids)
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
	return categories, nil
}

const facilityByBuildingQuery = `SELECT * FROM facilities WHERE building = $1`

func (f *FacilityStore) GetByBuilding(ctx context.Context, building string) ([]*models.FacilityWithCategories, error) {
	var facilities []*models.Facility
	if err := f.db.SelectContext(ctx, &facilities, facilityByBuildingQuery, building); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if len(facilities) == 0 {
		return []*models.FacilityWithCategories{}, nil
	}
	return f.GetAll(ctx)
}

const createFacilityQuery = `INSERT INTO facilities (
	name,
	building,
	address,
	image_path,
	capacity,
	google_calendar_id
) VALUES (:name, :building, :address, :image_path, :capacity, :google_calendar_id) RETURNING *`
const createCategoryQuery = `INSERT INTO categories (
	name,
	description,
	price,
	facility_id
) VALUES (:name, :description, :price, :facility_id)
`

func (f *FacilityStore) Create(ctx context.Context, input *models.FacilityWithCategories) error {
	categories := input.Categories
	var facility models.Facility
	params := map[string]any{
		"name":               input.Facility.Name,
		"building":           input.Facility.Building,
		"address":            input.Facility.Address,
		"image_path":         input.Facility.ImagePath,
		"capacity":           input.Facility.Capacity,
		"google_calendar_id": input.Facility.GoogleCalendarID,
	}
	tx, err := f.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	txStmt, err := tx.PrepareNamedContext(ctx, createFacilityQuery)
	if err != nil {
		return err
	}
	defer txStmt.Close()
	err = txStmt.QueryRowxContext(ctx, params).StructScan(&facility)
	if err != nil {
		return err
	}
	txCatStmt, err := tx.PrepareNamedContext(ctx, createCategoryQuery)
	if err != nil {
		return err
	}
	defer txCatStmt.Close()
	facilityID := facility.ID
	for _, category := range categories {
		catParams := map[string]any{
			"name":        category.Name,
			"description": category.Description,
			"price":       category.Price,
			"facility_id": facilityID,
		}
		if _, err := txCatStmt.ExecContext(ctx, catParams); err != nil {
			return err
		}
	}
	return tx.Commit()
}

const updateFacilityQuery = `UPDATE facilities SET
	name = :name,
	building = :building,
	address = :address,
	image_path = :image_path,
	capacity = :capacity,
	google_calendar_id = :google_calendar_id
	WHERE id = :id
`

func (f *FacilityStore) Update(ctx context.Context, input *models.Facility) error {
	params := map[string]any{
		"name":               input.Name,
		"building":           input.Building,
		"address":            input.Address,
		"image_path":         input.ImagePath,
		"capacity":           input.Capacity,
		"google_calendar_id": input.GoogleCalendarID,
		"id":                 input.ID,
	}

	stmt, err := f.db.PrepareNamedContext(ctx, updateFacilityQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.ExecContext(ctx, params)
	return err
}

const deleteFacilityQuery = `DELETE FROM facilities WHERE id = $1`

func (f *FacilityStore) Delete(ctx context.Context, id int64) error {
	_, err := f.db.ExecContext(ctx, deleteFacilityQuery, id)
	return err
}

const allFacilitiesInQuery = `SELECT * FROM facilities WHERE id IN (?)`

func (f *FacilityStore) GetAllIn(ctx context.Context, ids []int64) ([]*models.FacilityWithCategories, error) {
	var facilities []*models.Facility
	query, args, err := sqlx.In(allFacilitiesInQuery, ids)
	if err != nil {
		return nil, err
	}
	query = f.db.Rebind(query)
	err = f.db.SelectContext(ctx, &facilities, query, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if len(facilities) == 0 {
		return []*models.FacilityWithCategories{}, nil
	}

	categories, err := f.GetCategories(ctx, ids)
	if err != nil {
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

const editCategoryQuery = ` UPDATE categories SET
	name = :name,
	description = :description,
	price = :price
	WHERE id = :id
`

func (f *FacilityStore) EditCategory(ctx context.Context, category *models.Category) error {
	params := map[string]any{
		"name":        category.Name,
		"description": category.Description,
		"price":       category.Price,
		"id":          category.ID,
	}
	stmt, err := f.db.PrepareNamedContext(ctx, editCategoryQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.ExecContext(ctx, params)
	return err
}

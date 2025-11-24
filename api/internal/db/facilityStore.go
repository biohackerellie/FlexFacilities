package db

import (
	"api/internal/models"
	"context"
	"database/sql"
	"errors"
	"log/slog"
)

type FacilityStore struct {
	log *slog.Logger
	db  *DB
}

func NewFacilityStore(db *DB, log *slog.Logger) *FacilityStore {
	log.With("layer", "db", "store", "facility")
	return &FacilityStore{db: db, log: log}
}

const getFacilityQuery = `SELECT * FROM facility WHERE id = $1`

func (f *FacilityStore) Get(ctx context.Context, id int64) (*models.FullFacility, error) {

	var facility models.Facility
	var categories []models.Category
	if err := f.db.GetContext(ctx, &facility, getFacilityQuery, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if err := f.db.SelectContext(ctx, &categories, "SELECT * FROM category"); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			categories = []models.Category{}
		}
		return nil, err
	}
	catMap := make(map[int64]models.Category)

	for _, category := range categories {
		catMap[category.ID] = category
	}
	var reservationIds []int64
	if err := f.db.SelectContext(ctx, &reservationIds, "SELECT id FROM reservation WHERE facility_id = $1", id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			reservationIds = []int64{}
		}
		return nil, err
	}

	var building models.Building
	if err := f.db.GetContext(ctx, &building, "SELECT * FROM building WHERE id = $1", facility.BuildingID); err != nil {

		if errors.Is(err, sql.ErrNoRows) {
			building = models.Building{}
		}
		return nil, err

	}
	var pricing []models.Pricing
	if err := f.db.SelectContext(ctx, &pricing, "SELECT * FROM pricing WHERE product_id = $1", facility.ProductID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			pricing = []models.Pricing{}
		}
		return nil, err
	}
	var finalPricing []models.PricingWithCategory
	for _, pricing := range pricing {
		finalPricing = append(finalPricing, models.PricingWithCategory{
			Pricing:             pricing,
			CategoryName:        catMap[pricing.CategoryID].Name,
			CategoryDescription: catMap[pricing.CategoryID].Description,
		})
	}

	facilityWithCategories := &models.FullFacility{
		Facility:       &facility,
		Building:       &building,
		Pricing:        finalPricing,
		ReservationIDs: reservationIds,
	}
	return facilityWithCategories, nil
}

const getAllBuildingsQuery = `SELECT * FROM building`

func (f *FacilityStore) GetAllBuildings(ctx context.Context) ([]*models.Building, error) {
	var buildings []*models.Building
	if err := f.db.SelectContext(ctx, &buildings, getAllBuildingsQuery); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			buildings = []*models.Building{}
		}
		return nil, err
	}
	return buildings, nil
}

const getBuilding = `SELECT * FROM building WHERE id = $1 LIMIT 1`

func (f *FacilityStore) GetBuilding(ctx context.Context, id int64) (*models.Building, error) {
	var building models.Building
	if err := f.db.GetContext(ctx, &building, getBuilding, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &building, nil
}

const getAllCategoriesQuery = `SELECT * FROM category`
const getAllFacilitiesForBuildingQuery = `SELECT * FROM facility WHERE building_id = $1`
const getAllFacilitiesQuery = `SELECT * FROM facility`

func (f *FacilityStore) GetAll(ctx context.Context) ([]models.BuildingWithFacilities, error) {
	var buildings []models.Building
	if err := f.db.SelectContext(ctx, &buildings, getAllBuildingsQuery); err != nil {
		f.log.ErrorContext(ctx, "error getting buildings", "err", err)
		return nil, err
	}
	if len(buildings) == 0 {
		return nil, errors.New("no buildings found")
	}
	result := make([]models.BuildingWithFacilities, len(buildings))
	for i, building := range buildings {
		var facilities []models.Facility
		if err := f.db.SelectContext(ctx, &facilities, getAllFacilitiesForBuildingQuery, building.ID); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				facilities = []models.Facility{}
			}
			f.log.ErrorContext(ctx, "error getting facilities, db", "err", err)

			return nil, err
		}

		if len(facilities) == 0 {
			return result, nil
		}

		result[i] = models.BuildingWithFacilities{
			Building:   building,
			Facilities: facilities,
		}
	}
	return result, nil
}
func (f *FacilityStore) GetAllFacilities(ctx context.Context) ([]*models.Facility, error) {
	var facilities []*models.Facility
	if err := f.db.SelectContext(ctx, &facilities, getAllFacilitiesQuery); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		f.log.ErrorContext(ctx, "error getting facilities, db", "err", err)

		return nil, err
	}
	return facilities, nil
}
func (f *FacilityStore) GetCategories(ctx context.Context) ([]models.Category, error) {
	var categories []models.Category
	err := f.db.SelectContext(ctx, &categories, getAllCategoriesQuery)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			categories = []models.Category{}
		}
		return nil, err
	}
	return categories, nil
}

const getBuildingQuery = `SELECT * FROM building WHERE id = $1`

func (f *FacilityStore) GetByBuilding(ctx context.Context, buildingID int64) (*models.BuildingWithFacilities, error) {
	var building models.Building
	if err := f.db.GetContext(ctx, &building, getBuildingQuery, buildingID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &models.BuildingWithFacilities{}, nil
		}
		return nil, err
	}

	var facilities []models.Facility
	if err := f.db.SelectContext(ctx, &facilities, "SELECT * FROM facility WHERE building_id = $1", building.ID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			facilities = []models.Facility{}
		}
		return nil, err
	}
	categories, err := f.GetCategories(ctx)
	if err != nil {
		return nil, err
	}

	return &models.BuildingWithFacilities{
		Building:   building,
		Facilities: facilities,
		Categories: categories,
	}, nil

}

const createFacilityQuery = `INSERT INTO facility (
	name,
	image_path,
	capacity,
	google_calendar_id,
	building_id,
	product_id
) VALUES (:name, :image_path, :capacity, :google_calendar_id, :building_id, :product_id) RETURNING *`

func (f *FacilityStore) Create(ctx context.Context, input *models.Facility) error {
	params := map[string]any{
		"name":               input.Name,
		"image_path":         input.ImagePath,
		"capacity":           input.Capacity,
		"google_calendar_id": input.GoogleCalendarID,
		"building_id":        input.BuildingID,
		"product_id":         input.ProductID,
	}
	_, err := f.db.NamedExecContext(ctx, createFacilityQuery, params)
	if err != nil {
		return err
	}
	return nil
}

const updateFacilityQuery = `UPDATE facility SET
	name = :name,
	image_path = :image_path,
	capacity = :capacity,
	google_calendar_id = :google_calendar_id
	WHERE id = :id
`

func (f *FacilityStore) Update(ctx context.Context, input *models.Facility) error {
	params := map[string]any{
		"name":               input.Name,
		"image_path":         input.ImagePath,
		"capacity":           input.Capacity,
		"google_calendar_id": input.GoogleCalendarID,
		"id":                 input.ID,
	}

	stmt, err := f.db.PrepareNamedContext(ctx, updateFacilityQuery)
	if err != nil {
		return err
	}
	defer func() { _ = stmt.Close() }() //nolint:errcheck // stmt.Close()
	_, err = stmt.ExecContext(ctx, params)
	return err
}

const deleteFacilityQuery = `DELETE FROM facility WHERE id = $1`

func (f *FacilityStore) Delete(ctx context.Context, id int64) error {
	_, err := f.db.ExecContext(ctx, deleteFacilityQuery, id)
	return err
}

const editCategoryQuery = ` UPDATE category SET
	name = :name,
	description = :description,
	price = :price
	WHERE id = :id
`

func (f *FacilityStore) EditCategory(ctx context.Context, category *models.Category) error {
	params := map[string]any{
		"name":        category.Name,
		"description": category.Description,
		"id":          category.ID,
	}
	stmt, err := f.db.PrepareNamedContext(ctx, editCategoryQuery)
	if err != nil {
		return err
	}
	defer func() { _ = stmt.Close() }() //nolint:errcheck // stmt.Close()
	_, err = stmt.ExecContext(ctx, params)
	return err
}

const getCategoryQuery = `SELECT * FROM category WHERE id = $1 LIMIT 1`

func (f *FacilityStore) GetCategory(ctx context.Context, id int64) (*models.Category, error) {
	var category models.Category
	err := f.db.GetContext(ctx, &category, getCategoryQuery, id)
	return &category, err
}

const getBuildingCoordinatesQuery = `SELECT id, name, latitude, longitude FROM building WHERE latitude IS NOT NULL AND longitude IS NOT NULL`

func (f *FacilityStore) GetBuildingCoordinates(ctx context.Context) ([]models.BuildingCoords, error) {
	var coords []models.BuildingCoords
	if err := f.db.SelectContext(ctx, &coords, getBuildingCoordinatesQuery); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return coords, nil
}

const getPricingFromFacilityAndCategoryQuery = `SELECT p.*
	FROM pricing AS p
	JOIN facility AS f
		ON f.product_id = p.product_id
	WHERE f.facility_id = :facility_id
		AND p.category_id = :category_id;
`

func (f *FacilityStore) GetPricingByFacilityAndCategory(ctx context.Context, facilityID, categoryID int64) (models.Pricing, error) {
	var pricing models.Pricing
	args := map[string]any{
		"facility_id": facilityID,
		"category_id": categoryID,
	}
	err := f.db.GetContext(ctx, &pricing, getPricingFromFacilityAndCategoryQuery, args)
	return pricing, err
}

func (f *FacilityStore) GetProductPricingWithCategories(ctx context.Context, productID string) ([]models.PricingWithCategory, error) {
	var pricing []models.Pricing
	if err := f.db.SelectContext(ctx, &pricing, "SELECT * FROM pricing WHERE product_id = $1", productID); err != nil {
		return nil, err
	}
	if len(pricing) == 0 {
		return nil, errors.New("no pricing found")
	}

	var categories []models.Category
	if err := f.db.SelectContext(ctx, &categories, "SELECT * FROM category"); err != nil {
		return nil, err
	}
	catMap := make(map[int64]models.Category, len(categories))
	for _, cat := range categories {
		catMap[cat.ID] = cat
	}
	var finalPricing []models.PricingWithCategory
	for _, pricing := range pricing {
		finalPricing = append(finalPricing, models.PricingWithCategory{
			Pricing:             pricing,
			CategoryName:        catMap[pricing.CategoryID].Name,
			CategoryDescription: catMap[pricing.CategoryID].Description,
		})
	}
	return finalPricing, nil
}
func (f *FacilityStore) GetPricing(ctx context.Context, pricingID string) (models.Pricing, error) {
	var pricing models.Pricing
	if err := f.db.GetContext(ctx, &pricing, "SELECT * FROM pricing WHERE id = $1", pricingID); err != nil {
		return models.Pricing{}, err
	}
	return pricing, nil
}

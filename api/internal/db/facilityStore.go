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

const (
	createFacilityQuery   = `INSERT INTO facilities (name, description, price) VALUES ($1, $2, $3) RETURNING id`
	getFacilityQuery      = `SELECT * FROM facilities WHERE id = $1`
	getAllFacilitiesQuery = `SELECT * FROM facilities`
	updateFacilityQuery   = `UPDATE facilities SET name = $2, description = $3, price = $4 WHERE id = $1`
	deleteFacilityQuery   = `DELETE FROM facilities WHERE id = $1`
)

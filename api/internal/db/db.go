package db

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

type DB struct {
	*sqlx.DB
}

const initSQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`

func InitDB(ctx context.Context, connectionString string) *DB {
	sqlDB := sqlx.MustOpen("pgx", connectionString)
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := sqlDB.PingContext(ctx); err != nil {
		panic(fmt.Errorf("failed to ping database: %w", err))
	}

	_ = sqlDB.MustExecContext(ctx, initSQL)
	db := &DB{sqlDB}
	if err := db.runMigrations(ctx); err != nil {
		panic(fmt.Errorf("failed to run migrations: %w", err))
	}
	fmt.Println("Connected to database")
	return db
}

type DBService struct {
	*FacilityStore
	*UserStore
	*ReservationStore
	*BrandingStore
}

func NewDBService(db *DB, log *slog.Logger) *DBService {
	return &DBService{
		FacilityStore:    NewFacilityStore(db, log),
		UserStore:        NewUserStore(db, log),
		ReservationStore: NewReservationStore(db, log),
		BrandingStore:    NewBrandingStore(db, log),
	}
}

package db

import (
	"context"
	"fmt"
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

func NewDB(ctx context.Context, connectionString string) (*DB, error) {
	sqlDB, err := sqlx.Open("pgx", connectionString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to postgres: %w", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	if err := sqlDB.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to connect to postgres: %w", err)
	}

	if _, err := sqlDB.ExecContext(ctx, initSQL); err != nil {
		return nil, err
	}

	db := &DB{sqlDB}
	if err := db.runMigrations(ctx); err != nil {
		return nil, err
	}
	return db, nil
}

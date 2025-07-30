package db

import (
	"api/internal/lib/utils/errors"
	"context"
	"embed"
	"fmt"
	"log/slog"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

type Migration struct {
	Version int64
	Name    string
	SQL     string
}

func (db *DB) getAppliedMigrations(ctx context.Context) (map[int64]bool, error) {
	rows, err := db.QueryContext(ctx, "SELECT version FROM schema_migrations")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	applied := make(map[int64]bool)
	for rows.Next() {
		var version int64
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		applied[version] = true
	}
	slog.Info("Applied migrations", "count", len(applied))
	return applied, rows.Err()
}

// This function signature needs to match what's in your build-tagged files
func (db *DB) runMigrations(ctx context.Context) error {
	applied, err := db.getAppliedMigrations(ctx)
	if err != nil {
		return errors.NewIgnorableError("failed to get applied migrations: " + err.Error())
	}

	// Call the build-tag specific loadMigrations function
	migrations, err := loadMigrations()
	if err != nil {
		return errors.NewIgnorableError("failed to load migrations: " + err.Error())
	}

	tx, err := db.Beginx()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	for _, migration := range migrations {
		if applied[migration.Version] {
			continue
		}
		slog.Info("Applying migration",
			slog.Int64("version", migration.Version),
			slog.String("name", migration.Name))
		if _, err := tx.ExecContext(ctx, migration.SQL); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to apply migration %d: %w", migration.Version, err)
		}

		insertSQL := "INSERT INTO schema_migrations (version, name) VALUES ($1, $2)"

		_, err = tx.ExecContext(ctx, insertSQL, migration.Version, migration.Name)

		if err != nil {
			tx.Rollback()
			return fmt.Errorf("migration %d failed: %w", migration.Version, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func loadMigrations() ([]Migration, error) {
	entries, err := migrationFiles.ReadDir("migrations/postgres")
	if err != nil {
		return nil, err
	}

	var migrations []Migration
	for _, entry := range entries {
		if !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}

		parts := strings.SplitN(entry.Name(), "_", 2)
		if len(parts) < 2 {
			continue
		}

		version, err := strconv.ParseInt(parts[0], 10, 64)
		if err != nil {
			continue
		}

		content, err := migrationFiles.ReadFile(filepath.Join("migrations/postgres", entry.Name()))
		if err != nil {
			return nil, err
		}

		name := strings.TrimSuffix(parts[1], ".sql")
		migrations = append(migrations, Migration{
			Version: version,
			Name:    name,
			SQL:     string(content),
		})
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

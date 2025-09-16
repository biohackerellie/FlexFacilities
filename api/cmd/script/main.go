package main

import (
	pg "api/internal/db"
	"api/internal/models"
	"context"
	"flag"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/joho/godotenv"
	"log"
	"os"
)

type Facility struct {
	ID               int64              `db:"id" json:"id"`
	Name             string             `db:"name" json:"name"`
	Building         string             `db:"building" json:"building"`
	Address          string             `db:"address" json:"address"`
	ImagePath        *string            `db:"image_path" json:"image_path"`
	Capacity         *int64             `db:"capacity" json:"capacity"`
	CreatedAt        pgtype.Timestamptz `db:"created_at" json:"created_at"`
	UpdatedAt        pgtype.Timestamptz `db:"updated_at" json:"updated_at"`
	GoogleCalendarID string             `db:"google_calendar_id" json:"google_calendar_id"`
	BuildingID       *int64             `db:"building_id" json:"building_id"`
}

func main() {
	envPath := flag.String("env", "", "path to env file")
	flag.Parse()
	if envPath != nil && *envPath != "" {
		err := godotenv.Load(*envPath)
		if err != nil {
			panic(err)
		}
	}
	ctx := context.Background()
	db := pg.NewDB(ctx, os.Getenv("DATABASE_URL"))
	defer db.Close()
	var facilities []Facility
	err := db.SelectContext(ctx, &facilities, "SELECT * FROM facility")
	if err != nil {
		log.Fatal(err)
	}
	var buildings []models.Building

	err = db.SelectContext(ctx, &buildings, "SELECT * FROM building")
	if err != nil {
		log.Fatal(err)
	}
	// map facilities to buildings by name
	buildingMap := make(map[string]*int64)
	for _, building := range buildings {
		buildingMap[building.Name] = &building.ID
	}
	for _, facility := range facilities {
		if _, ok := buildingMap[facility.Building]; ok {
			facility.BuildingID = buildingMap[facility.Building]
			_, err := db.ExecContext(ctx, "UPDATE facility SET building_id = $1 WHERE id = $2", facility.BuildingID, facility.ID)
			if err != nil {
				log.Fatal(err)
			}
		}
	}
	log.Println("Done")
}

package main

import (
	pg "api/internal/db"
	"context"
	"embed"
	"flag"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

//go:embed sql/*.sql
var sqlFiles embed.FS

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
	db, err := pg.NewDB(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	entries, err := sqlFiles.ReadDir("sql")
	if err != nil {
		log.Fatal(err)
	}
	for _, entry := range entries {
		if !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		log.Printf("Applying %s\n", entry.Name())
		content, err := sqlFiles.ReadFile(filepath.Join("sql", entry.Name()))
		if err != nil {
			log.Fatal(err)
		}
		if _, err := db.ExecContext(ctx, string(content)); err != nil {
			log.Fatal(err)
		}
	}
	log.Println("Done")
}

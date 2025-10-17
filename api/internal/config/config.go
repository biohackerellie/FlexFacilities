package config

import (
	"fmt"
	"time"
)

type Config struct {
	LogLevel           string         `mapstructure:"LOG_LEVEL"`
	VerboseLogging     string         `mapstructure:"VERBOSE_LOGGING"`
	AppEnv             string         `mapstructure:"APP_ENV"`
	EntraClientID      string         `mapstructure:"ENTRA_CLIENT_ID"`
	EntraClientSecret  string         `mapstructure:"ENTRA_CLIENT_SECRET"`
	EntraTenant        string         `mapstructure:"ENTRA_TENANT_ID"`
	GoogleClientID     string         `mapstructure:"GOOGLE_CLIENT_ID"`
	GoogleClientSecret string         `mapstructure:"GOOGLE_CLIENT_SECRET"`
	GoogleRefreshToken string         `mapstructure:"GOOGLE_REFRESH_TOKEN"`
	DatabaseURL        string         `mapstructure:"DATABASE_URL"`
	AuthSecret         string         `mapstructure:"AUTH_SECRET"`
	AuthSalt           string         `mapstructure:"AUTH_SALT"`
	EmailHost          string         `mapstructure:"EMAIL_HOST"`
	EmailPassword      string         `mapstructure:"EMAIL_PASSWORD"`
	EmailUser          string         `mapstructure:"EMAIL_USER"`
	ApiHost            string         `mapstructure:"API_HOST"`
	FrontendUrl        string         `mapstructure:"FRONTEND_URL"`
	Timezone           string         `mapstructure:"TIMEZONE"`
	Location           *time.Location `mapstructure:"-"`
}

func New(getenv func(string, string) string) (*Config, error) {
	cfg := &Config{
		LogLevel:           getenv("LOG_LEVEL", "debug"),
		VerboseLogging:     getenv("VERBOSE_LOGGING", "true"),
		AppEnv:             getenv("APP_ENV", "development"),
		EntraClientID:      getenv("ENTRA_CLIENT_ID", ""),
		EntraClientSecret:  getenv("ENTRA_CLIENT_SECRET", ""),
		EntraTenant:        getenv("ENTRA_TENANT_ID", ""),
		GoogleClientID:     getenv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getenv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRefreshToken: getenv("GOOGLE_REFRESH_TOKEN", ""),
		DatabaseURL:        getenv("DATABASE_URL", "postgres://postgres@localhost:5432/postgres?sslmode=disable"),
		AuthSecret:         getenv("AUTH_SECRET", ""),
		AuthSalt:           getenv("AUTH_SALT", ""),
		EmailHost:          getenv("EMAIL_HOST", "smtp.gmail.com"),
		EmailPassword:      getenv("EMAIL_PASSWORD", ""),
		EmailUser:          getenv("EMAIL_USER", ""),
		ApiHost:            getenv("API_HOST", "http://localhost:8080"),
		FrontendUrl:        getenv("FRONTEND_URL", "http://localhost:3000"),
		Timezone:           getenv("TIMEZONE", "America/Denver"),
	}
	loc, err := time.LoadLocation(cfg.Timezone)
	if err != nil {
		return nil, fmt.Errorf("invalid TIMEZONE %q: %w", cfg.Timezone, err)
	}
	cfg.Location = loc
	return cfg, nil
}

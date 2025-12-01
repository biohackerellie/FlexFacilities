package config

import (
	"fmt"
	"time"
)

type Env string

func (e Env) String() string {
	return string(e)
}

const (
	PROD Env = "production"
	DEV  Env = "development"
)

type Config struct {
	LogLevel           string        `mapstructure:"LOG_LEVEL"`
	VerboseLogging     string        `mapstructure:"VERBOSE_LOGGING"`
	AppEnv             Env           `mapstructure:"APP_ENV"`
	EntraClientID      string        `mapstructure:"ENTRA_CLIENT_ID"`
	EntraClientSecret  string        `mapstructure:"ENTRA_CLIENT_SECRET"`
	EntraTenant        string        `mapstructure:"ENTRA_TENANT_ID"`
	GoogleClientID     string        `mapstructure:"GOOGLE_CLIENT_ID"`
	GoogleClientSecret string        `mapstructure:"GOOGLE_CLIENT_SECRET"`
	GoogleRefreshToken string        `mapstructure:"GOOGLE_REFRESH_TOKEN"`
	DatabaseURL        string        `mapstructure:"DATABASE_URL"`
	AuthSecret         string        `mapstructure:"AUTH_SECRET"`
	AuthSalt           string        `mapstructure:"AUTH_SALT"`
	EmailHost          string        `mapstructure:"EMAIL_HOST"`
	EmailPassword      string        `mapstructure:"EMAIL_PASSWORD"`
	EmailUser          string        `mapstructure:"EMAIL_USER"`
	ApiHost            string        `mapstructure:"API_HOST"`
	FrontendUrl        string        `mapstructure:"FRONTEND_URL"`
	FilesPath          string        `mapstructure:"FILES_PATH"`
	Timezone           string        `mapstructure:"TIMEZONE"`
	Location           time.Location `mapstructure:"-"`
	StripeSecretKey    string        `mapstructure:"STRIPE_SECRET_KEY"`
	StripePublicKey    string        `mapstructure:"STRIPE_PUBLIC_KEY"`
}

func New(getenv func(string, string) string, AppEnv string) (*Config, error) {
	cfg := &Config{
		LogLevel:           getenv("LOG_LEVEL", "debug"),
		VerboseLogging:     getenv("VERBOSE_LOGGING", "true"),
		AppEnv:             Env(getenv("APP_ENV", "development")),
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
		FilesPath:          getenv("FILES_PATH", "data"),
		Timezone:           getenv("TIMEZONE", "America/Denver"),
		StripeSecretKey:    getenv("STRIPE_SECRET_KEY", ""),
		StripePublicKey:    getenv("STRIPE_PUBLIC_KEY", ""),
	}
	loc, err := time.LoadLocation(cfg.Timezone)
	if err != nil {
		return nil, fmt.Errorf("invalid TIMEZONE %q: %w", cfg.Timezone, err)
	}
	cfg.Location = *loc
	return cfg, nil
}

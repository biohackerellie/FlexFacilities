package config

type Config struct {
	LogLevel          string `mapstructure:"LOG_LEVEL"`
	VerboseLogging    string `mapstructure:"VERBOSE_LOGGING"`
	AppEnv            string `mapstructure:"APP_ENV"`
	EntraClientID     string `mapstructure:"ENTRA_CLIENT_ID"`
	EntraClientSecret string `mapstructure:"ENTRA_CLIENT_SECRET"`
	EntraTenant       string `mapstructure:"ENTRA_TENANT"`
	DatabaseURL       string `mapstructure:"DATABASE_URL"`
	AuthSecret        string `mapstructure:"AUTH_SECRET"`
	AuthSalt          string `mapstructure:"AUTH_SALT"`
	EmailHost         string `mapstructure:"EMAIL_HOST"`
	EmailPassword     string `mapstructure:"EMAIL_PASSWORD"`
	EmailUser         string `mapstructure:"EMAIL_USER"`
	Host              string `mapstructure:"HOST"`
}

func New(getenv func(string) string) *Config {
	return &Config{
		LogLevel:          getenv("LOG_LEVEL"),
		VerboseLogging:    getenv("VERBOSE_LOGGING"),
		AppEnv:            getenv("APP_ENV"),
		EntraClientID:     getenv("ENTRA_CLIENT_ID"),
		EntraClientSecret: getenv("ENTRA_CLIENT_SECRET"),
		EntraTenant:       getenv("ENTRA_TENANT"),
		DatabaseURL:       getenv("DATABASE_URL"),
		AuthSecret:        getenv("AUTH_SECRET"),
		AuthSalt:          getenv("AUTH_SALT"),
		EmailHost:         getenv("EMAIL_HOST"),
		EmailPassword:     getenv("EMAIL_PASSWORD"),
		EmailUser:         getenv("EMAIL_USER"),
		Host:              getenv("HOST"),
	}
}

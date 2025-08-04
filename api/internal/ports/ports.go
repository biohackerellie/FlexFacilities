package ports

import (
	"api/internal/models"
	"context"
	"net/http"
)

type DBService interface {
	UserStore
}

type UserStore interface {
	CreateUser(ctx context.Context, user *models.Users) error
	GetUser(ctx context.Context, id string) (*models.Users, error)
	GetUserByEmail(ctx context.Context, email string) (*models.Users, error)
	UserExists(ctx context.Context, id string) (bool, error)
	CreateSession(ctx context.Context, session *models.Session) error
	GetSession(ctx context.Context, id string) (*models.Session, error)
	DeleteSession(ctx context.Context, id string) error
	DeleteExpiredSessions(ctx context.Context) error
}

type AuthService interface {
	AuthCallback(w http.ResponseWriter, r *http.Request)
	BeginOauth(w http.ResponseWriter, r *http.Request)
	CleanupExpiredTokens(ctx context.Context)
}

package ports

import (
	"api/internal/models"
	"context"
	"net/http"
)

type UserStore interface {
	Create(ctx context.Context, user *models.Users) (*models.Users, error)
	Get(ctx context.Context, id string) (*models.Users, error)
	GetByEmail(ctx context.Context, email string) (*models.Users, error)
	Update(ctx context.Context, user *models.Users) (*models.Users, error)
	UpdateByEmail(ctx context.Context, user *models.Users) (*models.Users, error)
	Delete(ctx context.Context, id string) error
	GetAll(ctx context.Context) ([]*models.Users, error)
	UserExists(ctx context.Context, id string) (bool, error)
	CreateSession(ctx context.Context, session *models.Session) error
	GetSession(ctx context.Context, id string) (*models.Session, error)
	DeleteSession(ctx context.Context, id string) error
	UpdateSession(ctx context.Context, session *models.Session) error
	DeleteExpiredSessions(ctx context.Context) error
}

type AuthService interface {
	AuthCallback(w http.ResponseWriter, r *http.Request)
	BeginOauth(w http.ResponseWriter, r *http.Request)
	CleanupExpiredTokens(ctx context.Context)
}

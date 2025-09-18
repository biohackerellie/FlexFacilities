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
	CreateSession(ctx context.Context, session *models.Session) (*models.Session, error)
	GetSession(ctx context.Context, id string) (*models.Session, error)
	DeleteSession(ctx context.Context, id string) error
	UpdateSession(ctx context.Context, session *models.Session) error
	DeleteExpiredSessions(ctx context.Context) error
	GetNotifications(context.Context) ([]*models.Notification, error)
	CreateNotification(context.Context, *models.Notification) error
	EditNotification(context.Context, *models.Notification) error
	DeleteNotification(context.Context, int64) error
}
type FacilityStore interface {
	Get(ctx context.Context, id int64) (*models.FullFacility, error)
	GetAllBuildings(ctx context.Context) ([]*models.Building, error)
	GetAll(ctx context.Context) ([]*models.BuildingWithFacilities, error)
	GetAllFacilities(ctx context.Context) ([]*models.Facility, error)
	GetByBuilding(ctx context.Context, buildingID int64) (*models.BuildingWithFacilities, error)
	GetBuilding(ctx context.Context, id int64) (*models.Building, error)
	GetCategories(ctx context.Context, ids []int64) ([]models.Category, error)
	Create(ctx context.Context, input *models.FacilityWithCategories) error
	Update(ctx context.Context, input *models.Facility) error
	Delete(ctx context.Context, id int64) error
	EditCategory(ctx context.Context, category *models.Category) error
	GetCategory(ctx context.Context, id int64) (*models.Category, error)
}

type ReservationStore interface {
	Get(ctx context.Context, id int64) (*models.FullReservation, error)
	GetAll(ctx context.Context) ([]*models.FullReservation, error)
	GetAllIn(ctx context.Context, ids []int64) ([]*models.FullReservation, error)
	GetUserReservations(ctx context.Context, userID string) ([]*models.FullReservation, error)
	Create(ctx context.Context, reservation *models.Reservation) (int64, error)
	CreateDates(ctx context.Context, dates []models.ReservationDate) error
	CreateFee(ctx context.Context, fee models.ReservationFee) error
	Update(ctx context.Context, reservation *models.Reservation) error
	Delete(ctx context.Context, id int64) error
	DeleteDates(ctx context.Context, id []int64) error
	DeleteFees(ctx context.Context, id int64) error
	UpdateCostOverride(ctx context.Context, id int64, cost string) error
	UpdateDate(ctx context.Context, date *models.ReservationDate) error
	GetDates(ctx context.Context, ids []int64) ([]models.ReservationDate, error)
	GetFees(ctx context.Context, ids []int64) ([]models.ReservationFee, error)
	GetFutureDates(ctx context.Context) ([]models.ReservationDate, error)
	Aggregate(ctx context.Context) ([]models.Aggregate, error)
}

type AuthService interface {
	AuthMiddleware(next http.Handler) http.Handler
	AuthCallback(w http.ResponseWriter, r *http.Request)
	BeginOauth(w http.ResponseWriter, r *http.Request)
	CleanupExpiredTokens(ctx context.Context)
}

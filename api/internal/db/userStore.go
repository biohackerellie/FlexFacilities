package db

import (
	"api/internal/models"
	"context"
	"database/sql"
	"errors"
	"log/slog"
)

type UserStore struct {
	log *slog.Logger
	db  *DB
}

func NewUserStore(db *DB, log *slog.Logger) *UserStore {
	log.With("layer", "db", "store", "user")
	return &UserStore{db: db, log: log}
}

const getUserQuery = `SELECT id, name, email, provider, role FROM users WHERE id = $1 LIMIT 1`

func (s *UserStore) Get(ctx context.Context, id string) (*models.Users, error) {
	stmt, _ := s.db.PreparexContext(ctx, getUserQuery)
	var user *models.Users

	if err := stmt.GetContext(ctx, &user, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

const getUserByEmailQuery = `SELECT * FROM users WHERE email = $1 LIMIT 1`

func (s *UserStore) GetByEmail(ctx context.Context, email string) (*models.Users, error) {
	stmt, _ := s.db.PreparexContext(ctx, getUserByEmailQuery)
	var user *models.Users

	if err := stmt.GetContext(ctx, &user, email); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return user, nil
}

const createUserQuery = `INSERT INTO users (id, name, email, password, provider, role, tos) VALUES (:id, :name, :email, :password, :provider, :role, :tos) RETURNING *`

func (s *UserStore) Create(ctx context.Context, user *models.Users) (*models.Users, error) {
	params := map[string]any{
		"id":       user.ID,
		"name":     user.Name,
		"email":    user.Email,
		"password": user.Password,
		"provider": user.Provider,
		"role":     user.Role,
		"tos":      user.Tos,
	}
	var u models.Users
	stmt, err := s.db.PrepareNamedContext(ctx, createUserQuery)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	err = stmt.QueryRowxContext(ctx, params).StructScan(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

const updateUserQuery = `UPDATE users SET name = :name, email = :email, provider = :provider WHERE id = :id RETURNING *`

func (s *UserStore) Update(ctx context.Context, user *models.Users) (*models.Users, error) {
	params := map[string]any{
		"id":       user.ID,
		"name":     user.Name,
		"email":    user.Email,
		"provider": user.Provider,
	}
	var u models.Users
	stmt, err := s.db.PrepareNamedContext(ctx, updateUserQuery)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	err = stmt.QueryRowxContext(ctx, params).StructScan(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

const updateUserByEmailQuery = `UPDATE users SET id = :id, name = :name, email = :email, provider = :provider WHERE email = :email RETURNING *`

func (s *UserStore) UpdateByEmail(ctx context.Context, user *models.Users) (*models.Users, error) {
	params := map[string]any{
		"id":       user.ID,
		"name":     user.Name,
		"email":    user.Email,
		"provider": user.Provider,
	}
	var u models.Users
	stmt, err := s.db.PrepareNamedContext(ctx, updateUserByEmailQuery)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	err = stmt.QueryRowxContext(ctx, params).StructScan(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

const deleteUserQuery = `DELETE FROM users WHERE id = $1`

func (s *UserStore) Delete(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, deleteUserQuery, id)
	return err
}

const getAllUsersQuery = `SELECT id, name, email, provider, role FROM users`

func (s *UserStore) GetAll(ctx context.Context) ([]*models.Users, error) {
	stmt, _ := s.db.PreparexContext(ctx, getAllUsersQuery)
	var users []*models.Users
	if err := stmt.SelectContext(ctx, &users); err != nil {
		return nil, err
	}
	return users, nil
}

const createSessionQuery = `INSERT INTO sessions (
	id, 
	user_id,
	refresh_token,
	provider
) 
VALUES (:id, :user_id, :refresh_token, :provider)
RETURNING *
`

func (s *UserStore) CreateSession(ctx context.Context, session *models.Session) (*models.Session, error) {
	params := map[string]any{
		"id":            session.ID,
		"user_id":       session.UserID,
		"refresh_token": session.RefreshToken,
		"provider":      session.Provider,
	}
	stmt, err := s.db.PrepareNamedContext(ctx, createSessionQuery)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	var u models.Session
	err = stmt.QueryRowxContext(ctx, params).StructScan(&u)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

const getSessionQuery = `SELECT id, user_id, refresh_token, provider FROM sessions WHERE id = $1`

func (s *UserStore) GetSession(ctx context.Context, id string) (*models.Session, error) {
	var session models.Session
	if err := s.db.GetContext(ctx, &session, getSessionQuery, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &session, nil
}

const deleteSessionQuery = `DELETE FROM sessions WHERE id = $1`

func (s *UserStore) DeleteSession(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, deleteSessionQuery, id)
	return err
}

const updateSessionQuery = `UPDATE sessions SET user_id = :user_id, refresh_token = :refresh_token, provider = :provider WHERE id = :id`

func (s *UserStore) UpdateSession(ctx context.Context, session *models.Session) error {
	args := map[string]any{
		"id":            session.ID,
		"user_id":       session.UserID,
		"refresh_token": session.RefreshToken,
		"provider":      session.Provider,
	}
	_, err := s.db.NamedExecContext(ctx, updateSessionQuery, args)
	return err
}

const deleteExpiredSessionsQuery = `DELETE FROM sessions WHERE expires_at < now()`

func (s *UserStore) DeleteExpiredSessions(ctx context.Context) error {
	_, err := s.db.ExecContext(ctx, deleteExpiredSessionsQuery)
	return err
}

const getNotificationsQuery = `SELECT * FROM notifications`

func (s *UserStore) GetNotifications(ctx context.Context) ([]*models.Notification, error) {
	var notifications []*models.Notification
	if err := s.db.SelectContext(ctx, &notifications, getNotificationsQuery); err != nil {
		return nil, err
	}
	return notifications, nil
}

const deleteNotificationQuery = `DELETE FROM notifications WHERE id = $1`

func (s *UserStore) DeleteNotification(ctx context.Context, id int64) error {
	_, err := s.db.ExecContext(ctx, deleteNotificationQuery, id)
	return err
}

const createNotificationQuery = `INSERT INTO notifications (
	id, 
	facility_id,
	building,
	title,
	body
) 
VALUES (:id, :user_id, :title, :body)
`

func (s *UserStore) CreateNotification(ctx context.Context, notification *models.Notification) error {
	_, err := s.db.NamedExecContext(ctx, createNotificationQuery, notification)
	return err
}

const editNotificationQuery = `UPDATE notifications SET title = :title, body = :body WHERE id = :id`

func (s *UserStore) EditNotification(ctx context.Context, notification *models.Notification) error {
	_, err := s.db.NamedExecContext(ctx, editNotificationQuery, notification)
	return err
}

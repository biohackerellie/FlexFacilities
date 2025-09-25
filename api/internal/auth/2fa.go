package auth

import (
	"api/internal/lib/emails"
	"api/internal/lib/utils"
	"api/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"net/url"
	"time"

	"connectrpc.com/connect"

	service "api/internal/proto/auth"
)

type TwoFACode struct {
	Code      string
	Email     string
	ExpiresAt time.Time
}

func (s *Auth) Verify2FACode(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Code  string `json:"code"`
		Token string `json:"token"`
	}
	var req request

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	code, email, ok := s.getTempToken(req.Token)
	if !ok {
		http.Error(w, "Invalid token", http.StatusBadRequest)
		return
	}
	if req.Code != code {
		http.Error(w, "Invalid code", http.StatusUnauthorized)
		return
	}

	user, err := s.db.GetByEmail(r.Context(), email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	accessToken, err := createToken(user.ID, user.Name, user.Email, *user.Provider, user.Role, s.key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     fmt.Sprintf("%s%s", s.cookiePrefix, jwtCookieName),
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteLaxMode,
	})

	sessionID := utils.GenerateRandomID()

	session := &models.Session{
		ID:           sessionID,
		RefreshToken: &accessToken,
		UserID:       user.ID,
		Provider:     *user.Provider,
		CreatedAt:    utils.TimeToPgTimestamptz(time.Now()),
		ExpiresAt:    utils.TimeToPgTimestamptz(time.Now().Add(absoluteExpiration)),
	}
	_, err = s.db.CreateSession(r.Context(), session)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	s.SetSessionCookie(w, sessionID)
	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func (s *Auth) Login(ctx context.Context, req *connect.Request[service.LoginRequest]) (*connect.Response[service.LoginResponse], error) {
	email := req.Msg.GetEmail()
	password := req.Msg.GetPassword()
	err := s.verifyCredentials(ctx, email, password)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	if err := s.send2FACode(email, s.config.Host); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&service.LoginResponse{}), nil
}

func (s *Auth) send2FACode(email, host string) error {

	token := uuid.NewString()
	code := utils.GenerateRandomSixDigitCode()

	s.setTempToken(token, code, email, time.Minute*5)
	urlString := fmt.Sprintf("%s/login/2fa/verify", host)
	s.logger.Debug("Sending login code", "email", email, "code", code)
	url, err := url.Parse(urlString)
	if err != nil {
		return err
	}
	q := url.Query()
	q.Set("token", token)
	url.RawQuery = q.Encode()
	emails.Send(&emails.EmailData{
		To:       email,
		Subject:  "Facilities Login Code",
		Template: "2fa.html",
		Data: map[string]any{
			"Code": code,
			"URL":  url,
		},
	})
	return nil
}

func (s *Auth) verifyCredentials(ctx context.Context, email, password string) error {
	user, err := s.db.GetByEmail(ctx, email)
	if err != nil || user.Password == nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword(*user.Password, []byte(password)); err != nil {
		return err
	}
	return nil
}
func (s *Auth) setTempToken(token, code, email string, d time.Duration) {
	s.storeMu.Lock()
	defer s.storeMu.Unlock()
	s.tokenStore[token] = TwoFACode{Code: code, Email: email, ExpiresAt: time.Now().Add(d)}
}

func (s *Auth) getTempToken(token string) (string, string, bool) {
	s.storeMu.Lock()
	defer s.storeMu.Unlock()
	v, ok := s.tokenStore[token]
	if !ok || time.Now().After(v.ExpiresAt) {
		delete(s.tokenStore, token)
		return "", "", false
	}
	delete(s.tokenStore, token)
	return v.Code, v.Email, true
}

func (s *Auth) Register(ctx context.Context, req *connect.Request[service.RegisterRequest]) (*connect.Response[service.LoginResponse], error) {
	email := req.Msg.GetEmail()
	password := req.Msg.GetPassword()
	name := req.Msg.GetName()
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	_, err = s.db.Create(ctx, &models.Users{
		ID:       uuid.NewString(),
		Name:     name,
		Email:    email,
		Password: &hash,
		Role:     models.UserRoleUSER,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	if err := s.send2FACode(email, s.config.Host); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	return connect.NewResponse(&service.LoginResponse{}), nil
}

func (s *Auth) CleanupExpiredTokens() {
	s.storeMu.Lock()
	now := time.Now()
	for k, v := range s.tokenStore {
		if now.After(v.ExpiresAt) {
			delete(s.tokenStore, k)
		}
	}
	s.storeMu.Unlock()
}

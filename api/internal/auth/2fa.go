package auth

import (
	"api/internal/lib/emails"
	"api/internal/lib/utils"
	"api/internal/models"
	"context"
	"fmt"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"net/url"
	"time"

	"connectrpc.com/connect"

	service "api/internal/proto/auth"
)

const providerType = "email"

type TwoFACode struct {
	Code      string
	Email     string
	ExpiresAt time.Time
	Attempts  int
}

const MAX_ATTEMPTS = 3

func (s *Auth) VerifyResetPassword(ctx context.Context, req *connect.Request[service.VerifyPasswordRequest]) (*connect.Response[service.VerifyResetResponse], error) {
	token := req.Msg.Token
	_, email, ok := s.getTempToken(token)
	if !ok {
		return nil, connect.NewError(connect.CodeUnauthenticated, fmt.Errorf("invalid token"))
	}
	return connect.NewResponse(&service.VerifyResetResponse{
		Email: email,
	}), nil
}
func (s *Auth) ResetPassword(ctx context.Context, req *connect.Request[service.LoginRequest]) (*connect.Response[service.LoginResponse], error) {
	user, err := s.db.GetByEmail(ctx, req.Msg.Email)
	if err != nil {
		return nil, err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Msg.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user.Password = &hash
	_, err = s.db.UpdatePassword(ctx, user)
	if err != nil {
		return nil, err
	}
	accessToken, err := createToken(user.ID, user.Name, user.Email, user.Provider, user.Role, s.key, sessionLife.Abs())
	if err != nil {
		return nil, err
	}
	response := &service.LoginResponse{}
	w := connect.NewResponse(response)
	cookie := &http.Cookie{
		Name:     jwtCookieName,
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(absoluteExpiration.Seconds()),
		Domain:   s.config.FrontendUrl,
	}
	w.Header().Set("Set-Cookie", cookie.String())

	sessionID := utils.GenerateRandomID()

	session := &models.Session{
		RefreshToken: &accessToken,
		UserID:       user.ID,
		Provider:     user.Provider,
		CreatedAt:    utils.TimeToPgTimestamptz(time.Now()),
		ExpiresAt:    utils.TimeToPgTimestamptz(time.Now().Add(absoluteExpiration)),
	}

	_, err = s.db.CreateSession(ctx, session)
	if err != nil {
		return nil, err
	}
	sessionCookie := &http.Cookie{
		Name:     sessionCookieName,
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(absoluteExpiration.Seconds()),
		Domain:   s.config.FrontendUrl,
	}

	w.Header().Set("Set-Cookie", sessionCookie.String())

	return w, nil
}
func (s *Auth) RequestResetPassword(ctx context.Context, req *connect.Request[service.RequestResetPasswordRequest]) (*connect.Response[service.LoginResponse], error) {
	email := req.Msg.Email

	user, err := s.db.GetByEmail(ctx, email)
	if err != nil {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("user not found"))
	}
	if user.Provider != "email" {
		return nil, connect.NewError(connect.CodeAlreadyExists, fmt.Errorf("User registered with %s provider", user.Provider))
	}
	err = s.sendResetPasswordToken(ctx, email)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.LoginResponse{}), nil
}

type VerifyRequest struct {
	Code  string `json:"code"`
	Token string `json:"token"`
}

func (s *Auth) Verify(w http.ResponseWriter, r *http.Request) {
	rcode := r.URL.Query().Get("code")
	token := r.URL.Query().Get("token")
	ctx := r.Context()
	code, email, ok := s.getTempToken(token)
	if !ok || rcode != code {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	user, err := s.db.GetByEmail(ctx, email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	accessToken, err := createToken(user.ID, user.Name, user.Email, user.Provider, user.Role, s.key, sessionLife.Abs())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	s.SetJWTCookie(w, accessToken)

	sessionID := utils.GenerateRandomID()

	session := &models.Session{
		ID:           sessionID,
		RefreshToken: &accessToken,
		UserID:       user.ID,
		Provider:     user.Provider,
		CreatedAt:    utils.TimeToPgTimestamptz(time.Now()),
		ExpiresAt:    utils.TimeToPgTimestamptz(time.Now().Add(absoluteExpiration)),
	}

	_, err = s.db.CreateSession(ctx, session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	s.SetSessionCookie(w, sessionID)

	http.Redirect(w, r, s.config.FrontendUrl, http.StatusTemporaryRedirect)
}
func (s *Auth) Verify2FACode(ctx context.Context, req *connect.Request[service.VerifyRequest]) (*connect.Response[service.VerifyResponse], error) {

	code, email, ok := s.getTempToken(req.Msg.Token)
	if !ok {
		return nil, connect.NewError(connect.CodeUnauthenticated, fmt.Errorf("invalid token"))
	}
	if req.Msg.Code != code {
		return nil, connect.NewError(connect.CodeUnauthenticated, fmt.Errorf("invalid code"))
	}

	user, err := s.db.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	accessToken, err := createToken(user.ID, user.Name, user.Email, user.Provider, user.Role, s.key, sessionLife.Abs())
	if err != nil {
		return nil, err
	}
	response := &service.VerifyResponse{
		Authorized: true,
	}
	w := connect.NewResponse(response)
	cookie := &http.Cookie{
		Name:     jwtCookieName,
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(sessionLife.Seconds()),
		Domain:   "",
	}
	w.Header().Set("Set-Cookie", cookie.String())

	sessionID := utils.GenerateRandomID()

	session := &models.Session{
		RefreshToken: &accessToken,
		UserID:       user.ID,
		Provider:     user.Provider,
		CreatedAt:    utils.TimeToPgTimestamptz(time.Now()),
		ExpiresAt:    utils.TimeToPgTimestamptz(time.Now().Add(absoluteExpiration)),
	}

	_, err = s.db.CreateSession(ctx, session)
	if err != nil {
		return nil, err
	}
	sessionCookie := &http.Cookie{
		Name:     sessionCookieName,
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(absoluteExpiration.Seconds()),
	}

	w.Header().Set("Set-Cookie", sessionCookie.String())

	return w, nil
}

func (s *Auth) Login(ctx context.Context, req *connect.Request[service.LoginRequest]) (*connect.Response[service.LoginResponse], error) {
	email := req.Msg.GetEmail()
	password := req.Msg.GetPassword()
	err := s.verifyCredentials(ctx, email, password)
	if err != nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, err)
	}
	if err := s.send2FACode(email, s.config.FrontendUrl); err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&service.LoginResponse{}), nil
}

func (s *Auth) send2FACode(email, host string) error {

	token := utils.GenerateRandomID()
	code := utils.GenerateRandomSixDigitCode()

	s.setTempToken(token, code, email, time.Minute*5)
	urlString := fmt.Sprintf("%s/login/verify", host)
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
func (s *Auth) sendResetPasswordToken(ctx context.Context, email string) error {

	token := utils.GenerateRandomID()
	s.setTempToken(token, "", email, time.Minute*5)
	urlString := fmt.Sprintf("%s/login/reset/%v", s.config.FrontendUrl, token)
	url, err := url.Parse(urlString)
	if err != nil {
		return err
	}
	emails.Send(&emails.EmailData{
		To:       email,
		Subject:  "Facilities Reset Password",
		Template: "passwordReset.html",
		Data: map[string]any{
			"URL": url,
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
	s.tokenStore[token] = TwoFACode{Code: code, Email: email, ExpiresAt: time.Now().Add(d), Attempts: 0}
}

func (s *Auth) getTempToken(token string) (string, string, bool) {
	s.storeMu.Lock()
	defer s.storeMu.Unlock()
	v, ok := s.tokenStore[token]
	if !ok {
		return "", "", false
	}
	if time.Now().After(v.ExpiresAt) {
		delete(s.tokenStore, token)
		return "", "", false
	}
	if v.Attempts >= MAX_ATTEMPTS {
		delete(s.tokenStore, token)
		return "", "", false
	}
	s.tokenStore[token] = TwoFACode{Code: v.Code, Email: v.Email, ExpiresAt: v.ExpiresAt, Attempts: v.Attempts + 1}
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
		Provider: providerType,
	})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	if err := s.send2FACode(email, s.config.FrontendUrl); err != nil {
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

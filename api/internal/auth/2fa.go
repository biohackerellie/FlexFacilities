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
)

type TwoFACode struct {
	Code      string
	Email     string
	ExpiresAt time.Time
}

func (s *AuthService) Verify2FACode(w http.ResponseWriter, r *http.Request) {
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
	err = s.db.CreateSession(r.Context(), session)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	s.SetSessionCookie(w, sessionID)
	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func (s *AuthService) Begin2FA(w http.ResponseWriter, r *http.Request) {
	type twoFARequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req twoFARequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := s.verifyCredentials(r.Context(), req.Email, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	token := uuid.NewString()
	code := utils.GenerateRandomSixDigitCode()

	s.setTempToken(token, code, req.Email, time.Minute*5)
	urlString := fmt.Sprintf("%s/login/2fa/verify", r.Host)
	url, err := url.Parse(urlString)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	q := url.Query()
	q.Set("token", token)
	url.RawQuery = q.Encode()
	go emails.Send(&emails.EmailData{
		To:       req.Email,
		Subject:  "Facilities Login Code",
		Template: "2fa.html",
		Data: map[string]any{
			"Code": code,
			"URL":  url,
		},
	})

	w.WriteHeader(http.StatusNoContent)
}

func (s *AuthService) verifyCredentials(ctx context.Context, email, password string) error {
	user, err := s.db.GetByEmail(ctx, email)
	if err != nil || user.Password == nil {
		return err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(password)); err != nil {
		return err
	}
	return nil
}
func (s *AuthService) setTempToken(token, code, email string, d time.Duration) {
	s.storeMu.Lock()
	defer s.storeMu.Unlock()
	s.tokenStore[token] = TwoFACode{Code: code, Email: email, ExpiresAt: time.Now().Add(d)}
}

func (s *AuthService) getTempToken(token string) (string, string, bool) {
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

func (s *AuthService) CleanupExpiredTokens() {
	s.storeMu.Lock()
	now := time.Now()
	for k, v := range s.tokenStore {
		if now.After(v.ExpiresAt) {
			delete(s.tokenStore, k)
		}
	}
	s.storeMu.Unlock()
}

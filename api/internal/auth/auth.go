package auth

import (
	"api/internal/lib/utils"
	"api/internal/models"
	"api/internal/ports"
	"context"
	"encoding/json"

	"fmt"
	"log/slog"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/biohackerellie/flexauth"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/argon2"
)

type AuthService struct {
	db           ports.DBService
	logger       *slog.Logger
	key          []byte
	providers    flexauth.ProviderRegistry
	providerMu   sync.RWMutex
	secure       bool
	cookiePrefix string
	tokenStore   map[string]TwoFACode
	storeMu      sync.RWMutex
}
type RefreshClaims struct {
	RefreshToken string `json:"refreshToken"`
	Provider     string `json:"provider"`
	Name         string `json:"name"`
	Email        string `json:"email,omitempty"`
	jwt.RegisteredClaims
}
type Claims struct {
	Name     string `json:"name"`
	Provider string `json:"provider"`
	Email    string `json:"email,omitempty"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

const (
	absoluteExpiration = 24 * 14 * time.Hour // 2 weeks
	sessionLife        = 8 * time.Hour

	jwtCookieName     = "%flexauth_token"
	sessionCookieName = "%flexauth_session"
	TwoProviderName   = "email"
)

func NewAuthService(db ports.DBService, logger *slog.Logger) *AuthService {
	authKey := []byte(os.Getenv("AUTH_SECRET"))
	salt := []byte(os.Getenv("AUTH_SALT"))
	encKey := generateEncryptionKey(authKey, salt)
	secure := os.Getenv("ENVIRONMENT") == "production"
	var cookiePrefix string
	if secure {
		cookiePrefix = "Secure__"
	} else {
		cookiePrefix = "__"
	}
	return &AuthService{
		db:           db,
		logger:       logger,
		key:          encKey,
		providers:    make(flexauth.ProviderRegistry),
		providerMu:   sync.RWMutex{},
		secure:       secure,
		cookiePrefix: cookiePrefix,
		tokenStore:   make(map[string]TwoFACode),
		storeMu:      sync.RWMutex{},
	}
}

func (a *AuthService) AuthCallback(w http.ResponseWriter, r *http.Request) {
	providerName := r.PathValue("provider")
	if errorMsg := r.URL.Query().Get("error"); errorMsg != "" {
		errorDesc := r.URL.Query().Get("error_description")
		a.logger.Error("Oauth error", "error", errorMsg, "description", errorDesc)
		http.Error(w, errorMsg, http.StatusInternalServerError)
		return
	}
	if providerName == "" {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	a.providerMu.RLock()
	provider, exists := a.providers[providerName]
	a.providerMu.RUnlock()
	if !exists {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	if code == "" {
		http.Error(w, "Auth code not found", http.StatusBadRequest)
	}

	err := a.verifyState(r, providerName, state)
	if err != nil {
		http.Error(w, "failed to verify request", http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	tokens, err := provider.ExchangeCodeForToken(ctx, code)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	userInfo, err := provider.GetUserInfo(ctx, tokens.AccessToken)

	userExists, err := a.db.UserExists(r.Context(), userInfo.ID)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
	}
	if !userExists {
		err := a.db.CreateUser(r.Context(), &models.Users{
			ID:       userInfo.ID,
			Name:     userInfo.Name,
			Email:    userInfo.Email,
			Provider: &providerName,
			Role:     models.UserRoleUSER,
			Tos:      true,
		})
		if err != nil {
			http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
			return
		}
	}
	user, err := a.db.GetUser(r.Context(), userInfo.ID)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	accessToken, err := createToken(user.ID, user.Name, user.Email, *user.Provider, user.Role, a.key)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	a.SetJWTCookie(w, accessToken)
	sessionID := utils.GenerateRandomID()
	session := &models.Session{
		ID:           sessionID,
		RefreshToken: &tokens.RefreshToken,
		UserID:       user.ID,
		CreatedAt:    utils.TimeToPgTimestamptz(time.Now()),
		ExpiresAt:    utils.TimeToPgTimestamptz(time.Now().Add(absoluteExpiration)),
	}
	err = a.db.CreateSession(r.Context(), session)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	a.SetSessionCookie(w, sessionID)

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func (a *AuthService) BeginOauth(w http.ResponseWriter, r *http.Request) {
	providerName := r.PathValue("provider")
	if providerName == "" {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	a.providerMu.RLock()
	provider, exists := a.providers[providerName]
	a.providerMu.RUnlock()
	if !exists {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	state := utils.GenerateRandomID()
	scopes := r.URL.Query()["scope"]
	authURL, err := provider.GetAuthURL(state, scopes...)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     fmt.Sprintf("oauth_state_%s", providerName),
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   a.secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   600,
	})
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

func (s *AuthService) RefreshToken(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Error(w, "Invalid session cookie", http.StatusUnauthorized)
		s.ClearJWTCookie(w)
		return
	}
	sessionID := cookie.Value
	session, err := s.db.GetSession(r.Context(), sessionID)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		s.ClearJWTCookie(w)
		return
	}
	providerName := session.Provider

	s.providerMu.RLock()
	p, exists := s.providers[providerName]
	s.providerMu.RUnlock()
	if !exists {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		s.ClearJWTCookie(w)
		return
	}
	newAuthToken, err := p.RefreshToken(r.Context(), *session.RefreshToken)
	if err != nil {
		s.logger.Error("Error refreshing token", "error", err, "provider", providerName)
		http.Error(w, "Unable to refresh token", http.StatusUnauthorized)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()

	u, err := p.GetUserInfo(ctx, newAuthToken.AccessToken)
	if err != nil {
		s.logger.Error("Error getting user info", "error", err, "provider", providerName)
		http.Error(w, "Unable to get user info", http.StatusInternalServerError)
		s.ClearJWTCookie(w)
		return
	}
	user, err := s.db.GetUser(r.Context(), u.ID)
	if err != nil {
		s.logger.Error("Error getting user", "error", err, "provider", providerName)
		http.Error(w, "Unable to get user", http.StatusInternalServerError)
		s.ClearJWTCookie(w)
		return
	}
	newToken, err := createToken(user.ID, user.Name, user.Email, providerName, user.Role, s.key)
	if err != nil {
		http.Error(w, "Unable to create new token", http.StatusInternalServerError)
		s.ClearJWTCookie(w)
		return
	}
	err = s.db.UpdateSession(r.Context(), &models.Session{
		ID:           session.ID,
		RefreshToken: &newAuthToken.RefreshToken,
		ExpiresAt:    utils.TimeToPgTimestamptz(time.Now().Add(absoluteExpiration)),
	})
	if err != nil {
		http.Error(w, "Unable to update session", http.StatusInternalServerError)
		s.ClearJWTCookie(w)
		return
	}
	s.SetJWTCookie(w, newToken)
	s.SetSessionCookie(w, sessionID)
	s.SetCSRFCookie(w)

	// Return JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]string{
		"status":  "success",
		"message": "Token refreshed successfully",
	}
	_ = json.NewEncoder(w).Encode(response)
}

func createToken(userId, userName, userEmail, provider string, role models.UserRole, key []byte) (string, error) {
	roleString := string(role)
	claims := Claims{
		userName,
		provider,
		userEmail,
		roleString,
		jwt.RegisteredClaims{
			Subject:   userId,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(absoluteExpiration)),
			ID:        utils.GenerateRandomID(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(key)
}

func (s *AuthService) createRefreshToken(userId, userName, userEmail, refreshToken, provider string, exp time.Duration) (string, error) {
	claims := RefreshClaims{
		refreshToken,
		provider,
		userName,
		userEmail,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(exp)),
			Subject:   userId,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ID:        utils.GenerateRandomID(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.key)
}

func generateEncryptionKey(secret, salt []byte) []byte {

	time := uint32(1)
	memory := uint32(64 * 1024)
	threads := uint8(4)
	keyLen := uint32(32)

	encKey := argon2.IDKey(secret, salt, time, memory, threads, keyLen)
	return encKey
}
func (a *AuthService) verifyState(r *http.Request, providerName, receivedState string) error {
	cookie, err := r.Cookie(fmt.Sprintf("oauth_state_%s", providerName))
	if err != nil {
		return fmt.Errorf("state cookie not found")
	}

	if cookie.Value != receivedState {
		return fmt.Errorf("state mismatch")
	}

	return nil
}

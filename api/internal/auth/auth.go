package auth

import (
	"api/internal/lib/utils"
	"api/internal/models"
	"api/internal/ports"
	"errors"

	"api/internal/config"
	"context"

	"fmt"
	"log/slog"
	"net/http"
	"os"
	"sync"
	"time"

	"connectrpc.com/connect"
	"github.com/biohackerellie/flexauth"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/argon2"
)

type Auth struct {
	db           ports.UserStore
	config       *config.Config
	logger       *slog.Logger
	key          []byte
	providers    flexauth.ProviderRegistry
	providerMu   sync.RWMutex
	secure       bool
	cookiePrefix string
	tokenStore   map[string]TwoFACode
	storeMu      sync.RWMutex
	ErrW         *connect.ErrorWriter
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

	jwtCookieName     = "%sflexauth_token"
	sessionCookieName = "%sflexauth_session"
	TwoProviderName   = "email"
)

func NewAuth(db ports.UserStore, logger *slog.Logger, config *config.Config) *Auth {
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
	return &Auth{
		db:           db,
		config:       config,
		logger:       logger,
		key:          encKey,
		providers:    make(flexauth.ProviderRegistry),
		providerMu:   sync.RWMutex{},
		secure:       secure,
		cookiePrefix: cookiePrefix,
		tokenStore:   make(map[string]TwoFACode),
		storeMu:      sync.RWMutex{},
		ErrW:         connect.NewErrorWriter(),
	}
}

func (a *Auth) AuthCallback(w http.ResponseWriter, r *http.Request) {
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

	user, err := a.GetOrCreateAuthUser(r.Context(), &models.Users{
		ID:       userInfo.ID,
		Name:     userInfo.Name,
		Email:    userInfo.Email,
		Provider: &providerName,
	})

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
	_, err = a.db.CreateSession(r.Context(), session)
	if err != nil {
		http.Error(w, "failed to get user info from auth provider", http.StatusBadRequest)
		return
	}
	a.SetSessionCookie(w, sessionID)

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func (a *Auth) BeginOauth(w http.ResponseWriter, r *http.Request) {
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

func (s *Auth) createRefreshToken(userId, userName, userEmail, refreshToken, provider string, exp time.Duration) (string, error) {
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
func (a *Auth) verifyState(r *http.Request, providerName, receivedState string) error {
	cookie, err := r.Cookie(fmt.Sprintf("oauth_state_%s", providerName))
	if err != nil {
		return fmt.Errorf("state cookie not found")
	}

	if cookie.Value != receivedState {
		return fmt.Errorf("state mismatch")
	}

	return nil
}

func (s *Auth) GetOrCreateAuthUser(ctx context.Context, authUser *models.Users) (*models.Users, error) {
	var user *models.Users

	user, err := s.db.Get(ctx, authUser.ID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		user, err = s.db.GetByEmail(ctx, authUser.Email)
		if err != nil {
			return nil, err
		}
		if user == nil {
			authUser.Tos = true
			authUser.Role = models.UserRoleUSER
			return s.db.Create(ctx, authUser)
		}
		updatedID, updatedOther := userNeedsUpdate(user, authUser)
		user.Name = authUser.Name
		user.Email = authUser.Email
		user.Provider = authUser.Provider
		if updatedID {
			user.ID = authUser.ID
			return s.db.UpdateByEmail(ctx, user)
		}
		if updatedOther {
			return s.db.Update(ctx, user)
		}
		return user, nil
	}
	_, updatedOther := userNeedsUpdate(user, authUser)
	if updatedOther {
		user.Name = authUser.Name
		user.Email = authUser.Email
		user.Provider = authUser.Provider
		return s.db.Update(ctx, user)
	}

	return user, nil
}

func userNeedsUpdate(dbUser, authUser *models.Users) (updatedID, updatedOther bool) {
	if dbUser.ID != authUser.ID {
		return true, false
	} else if dbUser.Name != authUser.Name ||
		dbUser.Email != authUser.Email ||
		dbUser.Provider != authUser.Provider {
		return false, true
	}
	return false, false
}

type RefreshTokenResponse struct {
	NewToken string
	Session  string
	User     *models.Users
}

func (s *Auth) RefreshToken(ctx context.Context, session *models.Session) (*RefreshTokenResponse, error) {
	token, err := VerifyToken(*session.RefreshToken, &RefreshClaims{}, s.key)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*RefreshClaims)
	if !ok {
		return nil, errors.New("Invalid Refresh Token")
	}
	providerName := claims.Provider
	s.providerMu.Lock()
	provider := s.providers[providerName]
	s.providerMu.Unlock()
	if provider == nil {
		return nil, errors.New("Invalid Refresh Token")
	}
	newAuthToken, err := provider.RefreshToken(ctx, claims.RefreshToken)
	if err != nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
	u, err := provider.GetUserInfo(ctx, newAuthToken.AccessToken)
	if err != nil {
		return nil, err
	}
	authUser := &models.Users{
		ID:       u.ID,
		Name:     u.Name,
		Email:    u.Email,
		Provider: &providerName,
	}
	user, err := s.GetOrCreateAuthUser(ctx, authUser)
	if err != nil {
		return nil, err
	}
	newToken, err := createToken(user.ID, user.Name, user.Email, *user.Provider, user.Role, s.key)
	if err != nil {
		return nil, err
	}
	newRefreshToken, err := s.createRefreshToken(user.ID, user.Name, user.Email, newAuthToken.RefreshToken, *user.Provider, absoluteExpiration)
	if err != nil {
		return nil, err
	}

	err = s.db.UpdateSession(ctx, &models.Session{
		ID:           session.ID,
		RefreshToken: &newRefreshToken,
		ExpiresAt:    utils.TimeToPgTimestamptz(time.Now().Add(absoluteExpiration)),
	})
	if err != nil {
		return nil, err
	}

	return &RefreshTokenResponse{
		NewToken: newToken,
		Session:  newRefreshToken,
		User:     user,
	}, nil
}

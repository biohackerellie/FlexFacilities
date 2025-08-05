package auth

import (
	"api/internal/lib/utils"
	"fmt"
	"net/http"

	"github.com/biohackerellie/flexauth"
	"github.com/golang-jwt/jwt/v5"
)

func VerifyToken[T jwt.Claims](token string, claims T, key []byte) (*jwt.Token, error) {
	return jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (any, error) {
		return key, nil
	})
}

func (a *AuthService) SetJWTCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     fmt.Sprintf("%s%s", a.cookiePrefix, jwtCookieName),
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   a.secure,
		SameSite: http.SameSiteLaxMode,
	})
}

func (s *AuthService) SetSessionCookie(w http.ResponseWriter, id string) {
	http.SetCookie(w, &http.Cookie{
		Name:     fmt.Sprintf("%s%s", s.cookiePrefix, sessionCookieName),
		Value:    id,
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(absoluteExpiration.Seconds()),
	})
}

func (s *AuthService) ClearJWTCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     fmt.Sprintf("%s%s", s.cookiePrefix, jwtCookieName),
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})
	http.SetCookie(w, &http.Cookie{
		Name: "session",

		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})
}

func (s *AuthService) SetCSRFCookie(w http.ResponseWriter) {
	token := utils.GenerateRandomID()
	cookie := &http.Cookie{
		Name:     "csrf-token",
		Value:    token,
		Path:     "/",
		HttpOnly: false,    // <--- not httpOnly
		Secure:   s.secure, // true in prod
		SameSite: http.SameSiteStrictMode,
		MaxAge:   int(sessionLife.Seconds()),
	}
	http.SetCookie(w, cookie)
}

func (s *AuthService) RegisterProvider(name string, provider flexauth.Provider) {
	s.providerMu.Lock()
	defer s.providerMu.Unlock()
	s.providers[name] = provider
}

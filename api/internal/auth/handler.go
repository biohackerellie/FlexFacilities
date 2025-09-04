package auth

import (
	"api/internal/lib/utils"
	"api/internal/models"
	service "api/internal/proto/auth"
	"context"
	"errors"
	"fmt"
	"net/http"

	"connectrpc.com/connect"
	"github.com/biohackerellie/flexauth"
	"github.com/golang-jwt/jwt/v5"
)

func VerifyToken[T jwt.Claims](token string, claims T, key []byte) (*jwt.Token, error) {
	return jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (any, error) {
		return key, nil
	})
}

func (a *Auth) SetJWTCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     fmt.Sprintf("%s%s", a.cookiePrefix, jwtCookieName),
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   a.secure,
		SameSite: http.SameSiteLaxMode,
	})
}

func (s *Auth) SetSessionCookie(w http.ResponseWriter, id string) {
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

func (s *Auth) ClearJWTCookie(w http.ResponseWriter) {
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

func (s *Auth) SetCSRFCookie(w http.ResponseWriter) {
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

func (s *Auth) RegisterProvider(name string, provider flexauth.Provider) {
	s.providerMu.Lock()
	defer s.providerMu.Unlock()
	s.providers[name] = provider
}

const AuthHeader = "%s-Bin"

func requiresAuth(procedure string) bool {
	publicProcedures := map[string]bool{
		FacilitiesServiceGetAllFacilitiesProcedure:      true,
		FacilitiesServiceGetFacilityProcedure:           true,
		FacilitiesServiceGetBuildingFacilitiesProcedure: true,
		FacilitiesServiceGetFacilityCategoriesProcedure: true,
		AuthLoginProcedure:                              true,
		AuthRegisterProcedure:                           true,
	}
	if _, ok := publicProcedures[procedure]; ok {
		return false
	} else {
		return true
	}
}

func (s *Auth) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		procedure, ok := InferProcedure(r.URL)
		if !ok {
			// Not a grpc request
			next.ServeHTTP(w, r)
			return
		}

		if !requiresAuth(procedure) {
			next.ServeHTTP(w, r)
			return
		}
		user := new(models.Users)
		jwtVal, jwtOk := s.readCookie(r, fmt.Sprintf("%s%s", s.cookiePrefix, jwtCookieName))
		sessVal, sessOk := s.readCookie(r, fmt.Sprintf("%s%s", s.cookiePrefix, sessionCookieName))
		if !jwtOk || !sessOk {
			_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
			return
		}

		session, err := s.db.GetSession(r.Context(), sessVal)
		if err != nil {
			_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
			return
		}
		token, err := VerifyToken(jwtVal, &Claims{}, s.key)
		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				res, err := s.RefreshToken(r.Context(), session)
				if err != nil {
					_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
					return
				}
				issueCookie(w, fmt.Sprintf(jwtCookieName, s.cookiePrefix), res.NewToken, s.secure, 0)
				issueCookie(w, fmt.Sprintf(sessionCookieName, s.cookiePrefix), res.Session, s.secure, 0)
				token, err = VerifyToken(res.NewToken, &Claims{}, s.key)
				if err != nil {
					_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
					return
				}

			} else {
				_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
				return
			}
		}
		user, err = userFromClaims(token)
		if err != nil {
			_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
			return
		}
		ctx := context.WithValue(r.Context(), utils.CtxKey("user"), user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Auth) readCookie(r *http.Request, name string) (string, bool) {
	c, err := r.Cookie(name)
	if err != nil || c == nil || c.Value == "" {
		return "", false
	}
	return c.Value, true
}

func issueCookie(w http.ResponseWriter, name, val string, secure bool, maxAge int) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    val,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   maxAge, // 0 => session cookie
	})
}

func (s *Auth) GetSession(ctx context.Context, req *connect.Request[service.GetSessionRequest]) (*connect.Response[service.GetSessionResponse], error) {
	sessionID := req.Header().Get(fmt.Sprintf(AuthHeader, sessionCookieName))
	user, ok := ctx.Value(utils.CtxKey("user")).(*models.Users)
	if !ok || user == nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated"))
	}
	return connect.NewResponse(&service.GetSessionResponse{
		SessionId: sessionID,
		UserId:    user.ID,
		UserEmail: user.Email,
		UserName:  user.Name,
		UserRole:  user.Role.String(),
	}), nil
}

func userFromClaims(t *jwt.Token) (*models.Users, error) {
	claims, ok := t.Claims.(*Claims)
	if !ok {
		return nil, errors.New("invalid token")
	}
	user := &models.Users{
		ID:    claims.Subject,
		Name:  claims.Name,
		Email: claims.Email,
		Role:  models.UserRole(claims.Role),
	}
	return user, nil
}

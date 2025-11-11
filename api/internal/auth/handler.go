package auth

import (
	"api/internal/lib/utils"
	"api/internal/models"
	service "api/internal/proto/auth"
	"context"
	"errors"
	"net/http"
	"strings"

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
		Name:     jwtCookieName,
		MaxAge:   int(sessionLife.Seconds()),
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   a.secure,
		SameSite: http.SameSiteLaxMode,
		Domain:   "",
	})
}

func (s *Auth) SetSessionCookie(w http.ResponseWriter, id string) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    id,
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(absoluteExpiration.Seconds()),
		Domain:   "",
	})
}

func (s *Auth) ClearJWTCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     jwtCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   s.secure,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
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
		Domain:   s.config.FrontendUrl,
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
		FacilitiesServiceGetAllCoordsProcedure:          true,
		FacilitiesServiceGetAllBuildingsProcedure:       true,
		FacilitiesServiceGetEventsByFacilityProcedure:   true,
		FacilitiesServiceGetEventsByBuildingProcedure:   true,
		FacilitiesServiceGetAllEventsProcedure:          true,
		FacilitiesServiceGetCategoryProcedure:           true,

		AuthLoginProcedure:                true,
		AuthRegisterProcedure:             true,
		AuthVerify2FACodeProcedure:        true,
		AuthRequestResetPasswordProcedure: true,
		AuthResetPasswordProcedure:        true,
		AuthVerifyResetPassword:           true,
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
		var user *models.Users
		authHeader := r.Header.Get("Authorization")
		sessVal := r.Header.Get("X-Session")
		if authHeader == "" && sessVal == "" {
			_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
			return
		}
		splitToken := strings.Split(authHeader, " ")
		if len(splitToken) != 2 {
			s.logger.Debug("AuthMiddleware", "procedure", procedure, "reason", "invalid auth header", "header", authHeader)
			_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
			return
		}
		jwtVal := splitToken[1]
		if sessVal == "" {
			s.logger.Debug("AuthMiddleware", "procedure", procedure, "reason", "no session header", "header", sessVal)
			_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
			return
		}

		session, err := s.db.GetSession(r.Context(), sessVal)
		if err != nil {
			s.logger.Debug("AuthMiddleware", "procedure", procedure, "reason", "invalid session", "header", sessVal)
			_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
			return
		}

		token, err := VerifyToken(jwtVal, &Claims{}, s.key)
		if err != nil {
			s.logger.Debug("AuthMiddleware", "coudn't verify token", "oops", "errors", err)
			if errors.Is(err, jwt.ErrTokenExpired) {
				res, err := s.RefreshToken(r.Context(), session)
				if err != nil {
					s.logger.Debug("AuthMiddleware", "error", err, "reason", "failed to refresh token")
					_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
					return
				}
				issueCookie(w, jwtCookieName, res.NewToken, s.secure, 0)
				issueCookie(w, sessionCookieName, res.Session, s.secure, 0)
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
		s.logger.Debug("user", "user", user, "session", session)

		ctx := WithAuthCTX(r.Context(), user, session.ID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
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
		Domain:   "",
	})
}

func (s *Auth) GetSessionHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	authCTX, ok := ctx.Value(utils.CtxKey("user")).(*AuthCTX)
	if !ok || authCTX == nil {
		_ = s.ErrW.Write(w, r, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated")))
		return
	}

	user := authCTX.User
	sessionID := authCTX.SessionID
	res := &service.GetSessionResponse{
		SessionId: sessionID,
		UserId:    user.ID,
		UserEmail: user.Email,
		UserName:  user.Name,
		UserRole:  user.Role.String(),
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(res.String()))
}

func (s *Auth) LogoutHandler(w http.ResponseWriter, r *http.Request) {

	authCTX, ok := r.Context().Value(utils.CtxKey("user")).(*AuthCTX)
	if !ok || authCTX == nil {
		http.Redirect(w, r, s.config.FrontendUrl, http.StatusTemporaryRedirect)
		return
	}

	err := s.db.DeleteSession(r.Context(), authCTX.SessionID)
	if err != nil {
		s.logger.Error("failed to delete session", "error", err)
		http.Redirect(w, r, s.config.FrontendUrl, http.StatusTemporaryRedirect)
		return

	}

	s.ClearJWTCookie(w)
	http.Redirect(w, r, s.config.FrontendUrl, http.StatusTemporaryRedirect)
}
func (s *Auth) GetSession(ctx context.Context, req *connect.Request[service.GetSessionRequest]) (*connect.Response[service.GetSessionResponse], error) {
	s.logger.Debug("GetSession", "ctx", ctx.Value(utils.CtxKey("user")))
	authCTX, ok := ctx.Value(utils.CtxKey("user")).(*AuthCTX)
	if !ok || authCTX == nil {
		return nil, connect.NewError(connect.CodeUnauthenticated, errors.New("unauthenticated"))
	}

	user := authCTX.User
	sessionID := authCTX.SessionID
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

type AuthCTX struct {
	User      *models.Users
	SessionID string
}

func WithAuthCTX(ctx context.Context, user *models.Users, sessionID string) context.Context {
	return context.WithValue(ctx, utils.CtxKey("user"), &AuthCTX{
		User:      user,
		SessionID: sessionID,
	})
}

func FromAuthCTX(ctx context.Context) *AuthCTX {
	return ctx.Value(utils.CtxKey("user")).(*AuthCTX)
}

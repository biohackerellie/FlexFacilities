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

func (s *Auth) AuthInterceptor() connect.UnaryInterceptorFunc {
	interceptor := func(next connect.UnaryFunc) connect.UnaryFunc {
		return connect.UnaryFunc(func(
			ctx context.Context,
			req connect.AnyRequest,
		) (connect.AnyResponse, error) {
			if req.Spec().IsClient {
				s.logger.Debug("skipping auth for client request")
				return next(ctx, req)
			}

			if !requiresAuth(req.Spec().Procedure) {
				s.logger.Debug("skipping auth for public procedure", "procedure", req.Spec().Procedure)
				return next(ctx, req)
			}
			user := new(models.Users)
			encoded := req.Header().Get(fmt.Sprintf(AuthHeader, jwtCookieName))
			tokenString, err := connect.DecodeBinaryHeader(encoded)
			if err != nil {
				return nil, connect.NewError(
					connect.CodeUnauthenticated,
					err,
				)
			}
			encodedSession := req.Header().Get(fmt.Sprintf(AuthHeader, sessionCookieName))
			sessionID, err := connect.DecodeBinaryHeader(encodedSession)
			if err != nil {
				return nil, connect.NewError(
					connect.CodeUnauthenticated,
					err,
				)
			}
			session, err := s.db.GetSession(ctx, string(sessionID))
			if err != nil {
				return nil, connect.NewError(
					connect.CodeUnauthenticated,
					err,
				)
			}

			token, err := VerifyToken(string(tokenString), &Claims{}, s.key)
			if err != nil {
				s.logger.Debug("invalid token", "error", err)
				if errors.Is(err, jwt.ErrTokenExpired) {
					response, err := s.RefreshToken(ctx, session)
					if err != nil {
						return nil, connect.NewError(
							connect.CodeUnauthenticated,
							err,
						)
					}
					jwtCookie := &http.Cookie{
						Name:     fmt.Sprintf("%s%s", s.cookiePrefix, jwtCookieName),
						Value:    response.NewToken,
						Path:     "/",
						HttpOnly: true,
						Secure:   s.secure,
						SameSite: http.SameSiteLaxMode,
					}
					sessionCookie := &http.Cookie{
						Name:     fmt.Sprintf("%s%s", s.cookiePrefix, sessionCookieName),
						Value:    response.Session,
						Path:     "/",
						HttpOnly: true,
						Secure:   s.secure,
						SameSite: http.SameSiteLaxMode,
						MaxAge:   int(absoluteExpiration.Seconds()),
					}
					req.Header().Set("Set-Cookie", jwtCookie.String())
					req.Header().Set("Set-Cookie", sessionCookie.String())
					token, err = VerifyToken(response.NewToken, &Claims{}, s.key)
					if err != nil {
						return nil, connect.NewError(
							connect.CodeUnauthenticated,
							err,
						)
					}
				} else {
					return nil, connect.NewError(
						connect.CodeUnauthenticated,
						err,
					)
				}
			}
			claims, ok := token.Claims.(*Claims)
			if !ok {
				s.logger.Debug("invalid token")
				return nil, connect.NewError(
					connect.CodeUnauthenticated,
					err,
				)
			}

			user.ID = claims.Subject
			user.Name = claims.Name
			user.Email = claims.Email
			user.Role = models.UserRole(claims.Role)
			ctx = context.WithValue(ctx, utils.CtxKey("user"), user)

			return next(ctx, req)
		})
	}
	return connect.UnaryInterceptorFunc(interceptor)
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

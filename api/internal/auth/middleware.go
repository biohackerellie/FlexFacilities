package auth

import (
	"context"
	"net/http"
	"net/url"
	"strings"
)

type AuthFunc func(ctx context.Context, req *http.Request) (any, error)

//	func InferProtocol(request *http.Request) (string, bool) {
//		const (
//			grpcContentTypeDefault             = "application/grpc"
//			grpcContentTypePrefix              = "application/grpc+"
//			grpcWebContentTypeDefault          = "application/grpc-web"
//			grpcWebContentTypePrefix           = "application/grpc-web+"
//			connectStreamingContentTypePrefix  = "application/connect+"
//			connectUnaryContentTypePrefix      = "application/"
//			connectUnaryMessageQueryParameter  = "message"
//			connectUnaryEncodingQueryParameter = "encoding"
//		)
//		ctype := canonicalizeContentType(request.Header.Get("Content-Type"))
//		isPost := request.Method == http.MethodPost
//		isGet := request.Method == http.MethodGet
//		switch {
//		case isPost && (ctype == grpcContentTypeDefault || strings.HasPrefix(ctype, grpcContentTypePrefix)):
//			return connect.ProtocolGRPC, true
//		case isPost && (ctype == grpcWebContentTypeDefault || strings.HasPrefix(ctype, grpcWebContentTypePrefix)):
//			return connect.ProtocolGRPCWeb, true
//		case isPost && strings.HasPrefix(ctype, connectStreamingContentTypePrefix):
//			return connect.ProtocolConnect, true
//		case isPost && strings.HasPrefix(ctype, connectUnaryContentTypePrefix):
//			return connect.ProtocolConnect, true
//		case isGet:
//			query := request.URL.Query()
//			hasMessage := query.Has(connectUnaryMessageQueryParameter)
//			hasEncoding := query.Has(connectUnaryEncodingQueryParameter)
//			if !hasMessage || !hasEncoding {
//				return "", false
//			}
//			return connect.ProtocolConnect, true
//		default:
//			return "", false
//		}
//	}
func InferProcedure(url *url.URL) (string, bool) {
	path := url.Path
	ultimate := strings.LastIndex(path, "/")
	if ultimate < 0 {
		return url.Path, false
	}
	penultimate := strings.LastIndex(path[:ultimate], "/")
	if penultimate < 0 {
		return url.Path, false
	}
	procedure := path[penultimate:]
	// Ensure that the service and method are non-empty.
	if ultimate == len(path)-1 || penultimate == ultimate-1 {
		return url.Path, false
	}
	return procedure, true
}

// func SessionToken(request *http.Request) (string, bool) {
// 	const prefix = "Session "
// 	auth := request.Header.Get("x-session-token")
// 	// Case insensitive prefix match. See RFC 9110 Section 11.1.
// 	if len(auth) < len(prefix) || !strings.EqualFold(auth[:len(prefix)], prefix) {
// 		return "", false
// 	}
// 	return auth[len(prefix):], true
// }

// type Middleware struct {
// 	auth AuthFunc
// 	errW *connect.ErrorWriter
// }

// func NewMiddleware(auth AuthFunc, opts ...connect.HandlerOption) *Middleware {
// 	return &Middleware{
// 		auth: auth,
// 		errW: connect.NewErrorWriter(opts...),
// 	}
// }

// func canonicalizeContentType(contentType string) string {
// 	var slashes int
// 	for _, r := range contentType {
// 		switch {
// 		case r >= 'a' && r <= 'z':
// 		case r == '.' || r == '+' || r == '-':
// 		case r == '/':
// 			slashes++
// 		default:
// 			return canonicalizeContentTypeSlow(contentType)
// 		}
// 	}
// 	if slashes == 1 {
// 		return contentType
// 	}
// 	return canonicalizeContentTypeSlow(contentType)
// }

// func canonicalizeContentTypeSlow(contentType string) string {
// 	base, params, err := mime.ParseMediaType(contentType)
// 	if err != nil {
// 		return contentType
// 	}
// 	if charset, ok := params["charset"]; ok {
// 		params["charset"] = strings.ToLower(charset)
// 	}
// 	return mime.FormatMediaType(base, params)
// }

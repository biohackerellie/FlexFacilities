package utils

import (
	"crypto/rand"
	"encoding/base64"
)

func GenerateRandomID() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		panic(err)
	}
	return base64.URLEncoding.EncodeToString(b)
}

func GenerateRandomSixDigitCode() string {
	b := make([]byte, 6)
	_, err := rand.Read(b)
	if err != nil {
		panic(err)
	}
	return base64.URLEncoding.EncodeToString(b)
}

type CtxKey string

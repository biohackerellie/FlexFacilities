package utils

import (
	"crypto/rand"
	"encoding/base64"
	"io"
)

func GenerateRandomID() string {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		panic(err)
	}
	return base64.RawURLEncoding.EncodeToString(b)
}

func GenerateRandomSixDigitCode() string {
	var table = [...]byte{'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'}
	b := make([]byte, 6)
	n, err := io.ReadAtLeast(rand.Reader, b, 6)
	if n != 6 {
		panic(err)
	}
	for i := range b {
		b[i] = table[int(b[i])%len(table)]
	}

	return string(b)
}

type CtxKey string

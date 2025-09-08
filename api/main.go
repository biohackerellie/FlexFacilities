package main

import (
	"context"
	"fmt"
	"os"
)

func main() {

	ctx := context.Background()

	if err := Run(ctx, os.Stdout, getEnv); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

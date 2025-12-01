FROM golang:1-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 go build -ldflags="-s -w -X 'main.AppEnv=production'" -o ./bin/api .

FROM gcr.io/distroless/static
ENV APP_ENV=production
COPY --from=builder /app/bin/api /api
EXPOSE 8080
ENTRYPOINT ["/api"]

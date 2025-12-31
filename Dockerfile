FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/fgo cmd/api/main.go

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/fgo /app/fgo
COPY config/ /app/config/
RUN mkdir -p /app/logs
EXPOSE 8080
ENTRYPOINT ["/app/fgo"]

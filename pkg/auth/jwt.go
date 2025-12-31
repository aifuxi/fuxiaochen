package auth

import (
	"time"

	"github.com/aifuxi/fgo/config"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID int64 `json:"userID"`
	jwt.RegisteredClaims
}

func GenerateToken(userID int64) (string, error) {
	now := time.Now()
	expireTime := time.Duration(config.AppConfig.JWT.Expire) * time.Hour
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(expireTime)),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "fgo",
		},
	}

	tokenClaims := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return tokenClaims.SignedString([]byte(config.AppConfig.JWT.Secret))
}

func ParseToken(token string) (*Claims, error) {
	tokenClaims, err := jwt.ParseWithClaims(token, &Claims{}, func(token *jwt.Token) (any, error) {
		return []byte(config.AppConfig.JWT.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := tokenClaims.Claims.(*Claims); ok && tokenClaims.Valid {
		return claims, nil
	}

	return nil, err
}

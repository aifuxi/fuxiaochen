package middleware

import (
	"strings"

	"github.com/aifuxi/fgo/internal/repository"
	"github.com/aifuxi/fgo/pkg/auth"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

func Auth(tokenRepo repository.TokenRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header is required")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.Unauthorized(c, "Authorization header format must be Bearer {token}")
			c.Abort()
			return
		}

		claims, err := auth.ParseToken(parts[1])
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token")
			c.Abort()
			return
		}

		tk, err := tokenRepo.FindByToken(c, parts[1])
		if err != nil {
			response.Unauthorized(c, "Token verification failed")
			c.Abort()
			return
		}
		if tk == nil || tk.UserID != claims.UserID {
			response.Unauthorized(c, "Token not found or mismatched user")
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Next()
	}
}

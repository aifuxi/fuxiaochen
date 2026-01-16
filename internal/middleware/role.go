package middleware

import (
	"github.com/aifuxi/fuxiaochen-api/internal/model"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/aifuxi/fuxiaochen-api/pkg/response"
	"github.com/gin-gonic/gin"
)

func RequireAdmin(userService service.UserService) gin.HandlerFunc {
	return func(c *gin.Context) {
		v, ok := c.Get("userID")
		if !ok {
			response.Unauthorized(c, "user not found")
			c.Abort()
			return
		}

		userID, ok := v.(int64)
		if !ok {
			response.Unauthorized(c, "invalid user id")
			c.Abort()
			return
		}

		user, err := userService.FindByID(c, userID)
		if err != nil {
			response.BusinessError(c, "failed to load user")
			c.Abort()
			return
		}

		if user.Role != model.RoleAdmin {
			response.Forbidden(c, "admin access required")
			c.Abort()
			return
		}

		c.Next()
	}
}

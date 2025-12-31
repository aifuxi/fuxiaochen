package middleware

import (
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/response"
	"github.com/gin-gonic/gin"
)

func RequirePermissions(userService service.UserService, permissions ...string) gin.HandlerFunc {
	permissionSet := make(map[string]struct{}, len(permissions))
	for _, p := range permissions {
		permissionSet[p] = struct{}{}
	}

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

		hasPermission := false
		for _, role := range user.Roles {
			for _, permission := range role.Permissions {
				if _, ok := permissionSet[permission.Code]; ok {
					hasPermission = true
					break
				}
			}
			if hasPermission {
				break
			}
		}

		if !hasPermission {
			response.Forbidden(c, "permission denied")
			c.Abort()
			return
		}

		c.Next()
	}
}

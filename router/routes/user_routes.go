package routes

import (
	"github.com/aifuxi/fgo/internal/handler"
	"github.com/aifuxi/fgo/internal/middleware"
	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/internal/repository"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(api *gin.RouterGroup, svc service.UserService, tokenRepo repository.TokenRepository) {
	h := handler.NewUserHandler(svc)

	routes := api.Group("/users")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.GET("", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionUserList), h.List)
		routes.POST("", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionUserCreate), h.Create)
		routes.POST("/logout", middleware.Auth(tokenRepo), h.Logout)

		routes.GET("/info", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionUserView), h.Info)

		routes.GET("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionUserView), h.FindByID)
		routes.PUT("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionUserUpdate), h.Update)
		routes.DELETE("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionUserDelete), h.Delete)

		routes.PATCH("/:id/ban", middleware.RequirePermissions(svc, model.PermissionAdminAll), h.Ban)
		routes.PATCH("/:id/password", middleware.RequirePermissions(svc, model.PermissionAdminAll), h.UpdatePassword)
	}
}

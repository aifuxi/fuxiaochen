package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/middleware"
	"github.com/aifuxi/fuxiaochen-api/internal/model"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/gin-gonic/gin"
)

func RegisterChangelogRoutes(api *gin.RouterGroup, h *handler.ChangelogHandler, svc service.UserService, tokenRepo repository.TokenRepository) {
	routes := api.Group("/changelogs")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.GET("", middleware.RequirePermissions(svc, model.PermissionAdminAll), h.List)
		routes.POST("", middleware.RequirePermissions(svc, model.PermissionAdminAll), h.Create)

		routes.GET("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll), h.FindByID)
		routes.PUT("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll), h.UpdateByID)
		routes.DELETE("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll), h.DeleteByID)
	}
}

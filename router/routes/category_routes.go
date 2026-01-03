package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/middleware"
	"github.com/aifuxi/fuxiaochen-api/internal/model"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/aifuxi/fuxiaochen-api/pkg/db"
	"github.com/gin-gonic/gin"
)

func RegisterCategoryRoutes(api *gin.RouterGroup, svc service.UserService, tokenRepo repository.TokenRepository) {
	h := handler.NewCategoryHandler(service.NewCategoryService(repository.NewCategoryRepository(db.GetDB())))

	routes := api.Group("/categories")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.GET("", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionCategoryList), h.List)
		routes.GET("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionCategoryView), h.FindByID)

		routes.POST("", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionCategoryCreate), h.Create)
		routes.PUT("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionCategoryUpdate), h.UpdateByID)
		routes.DELETE("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionCategoryDelete), h.DeleteByID)
	}
}

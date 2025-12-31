package routes

import (
	"github.com/aifuxi/fgo/internal/handler"
	"github.com/aifuxi/fgo/internal/middleware"
	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/internal/repository"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/db"
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

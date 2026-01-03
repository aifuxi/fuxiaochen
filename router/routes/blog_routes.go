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

func RegisterBlogRoutes(api *gin.RouterGroup, svc service.UserService, tokenRepo repository.TokenRepository) {
	h := handler.NewBlogHandler(service.NewBlogService(repository.NewBlogRepository(db.GetDB())))

	routes := api.Group("/blogs")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.GET("", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionBlogList), h.List)
		routes.POST("", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionBlogCreate), h.Create)

		routes.GET("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionBlogView), h.FindByID)
		routes.PUT("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionBlogUpdate), h.UpdateByID)
		routes.DELETE("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionBlogDelete), h.DeleteByID)
		routes.PATCH("/:id/published", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionBlogUpdate), h.PublishedByID)
		routes.PATCH("/:id/featured", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionBlogUpdate), h.FeaturedByID)
	}
}

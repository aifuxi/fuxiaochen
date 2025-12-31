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

func RegisterRoleRoutes(api *gin.RouterGroup, svc service.UserService, tokenRepo repository.TokenRepository) {
	h := handler.NewRoleHandler(service.NewRoleService(repository.NewRoleRepository(db.GetDB())))

	routes := api.Group("/roles")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.GET("", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionRoleList), h.List)
		routes.POST("", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionRoleCreate), h.Create)

		routes.GET("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionRoleView), h.FindByID)
		routes.PUT("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionRoleUpdate), h.Update)
		routes.DELETE("/:id", middleware.RequirePermissions(svc, model.PermissionAdminAll, model.PermissionRoleDelete), h.Delete)
	}
}

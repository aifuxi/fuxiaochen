package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/middleware"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/gin-gonic/gin"
)

func RegisterCategoryRoutes(api *gin.RouterGroup, h *handler.CategoryHandler, svc service.UserService, tokenRepo repository.TokenRepository) {
	routes := api.Group("/categories")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.GET("", h.List)
		routes.GET("/:id", h.FindByID)

		routes.POST("", middleware.RequireAdmin(svc), h.Create)
		routes.PUT("/:id", middleware.RequireAdmin(svc), h.UpdateByID)
		routes.DELETE("/:id", middleware.RequireAdmin(svc), h.DeleteByID)
	}
}

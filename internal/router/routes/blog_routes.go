package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/middleware"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/gin-gonic/gin"
)

func RegisterBlogRoutes(api *gin.RouterGroup, h *handler.BlogHandler, svc service.UserService, tokenRepo repository.TokenRepository) {
	routes := api.Group("/blogs")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.GET("", h.List)
		routes.POST("", middleware.RequireAdmin(svc), h.Create)

		routes.GET("/:id", h.FindByID)
		routes.PUT("/:id", middleware.RequireAdmin(svc), h.UpdateByID)
		routes.DELETE("/:id", middleware.RequireAdmin(svc), h.DeleteByID)
		routes.PATCH("/:id/published", middleware.RequireAdmin(svc), h.PublishedByID)
		routes.PATCH("/:id/featured", middleware.RequireAdmin(svc), h.FeaturedByID)
	}
}

package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/middleware"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/gin-gonic/gin"
)

func RegisterUserRoutes(api *gin.RouterGroup, h *handler.UserHandler, svc service.UserService, tokenRepo repository.TokenRepository) {
	routes := api.Group("/users")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.GET("", middleware.RequireAdmin(svc), h.List)
		routes.POST("", middleware.RequireAdmin(svc), h.Create)
		routes.POST("/logout", h.Logout)

		routes.GET("/info", h.Info)

		routes.GET("/:id", middleware.RequireAdmin(svc), h.FindByID)
		routes.PUT("/:id", middleware.RequireAdmin(svc), h.Update)
		routes.DELETE("/:id", middleware.RequireAdmin(svc), h.Delete)

		routes.PATCH("/:id/ban", middleware.RequireAdmin(svc), h.Ban)
		routes.PATCH("/:id/password", middleware.RequireAdmin(svc), h.UpdatePassword)
	}
}

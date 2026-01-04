package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(api *gin.RouterGroup, h *handler.UserHandler) {
	authRoutes := api.Group("/auth")
	{
		authRoutes.POST("/register", h.Register)
		authRoutes.POST("/login", h.Login)
	}
}

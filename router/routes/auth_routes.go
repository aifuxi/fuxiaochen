package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(api *gin.RouterGroup, svc service.UserService, tokenRepo repository.TokenRepository) {
	h := handler.NewUserHandler(svc)

	authRoutes := api.Group("/auth")
	{
		authRoutes.POST("/register", h.Register)
		authRoutes.POST("/login", h.Login)
	}
}

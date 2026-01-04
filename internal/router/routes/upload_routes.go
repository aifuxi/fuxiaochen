package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/middleware"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/gin-gonic/gin"
)

func RegisterUploadRoutes(api *gin.RouterGroup, h *handler.UploadHandler, tokenRepo repository.TokenRepository) {
	routes := api.Group("/upload")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.POST("/presign", h.UploadPresign)
	}
}

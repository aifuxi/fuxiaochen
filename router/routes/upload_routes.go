package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/middleware"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/gin-gonic/gin"
)

func RegisterUploadRoutes(api *gin.RouterGroup, tokenRepo repository.TokenRepository) {
	h := handler.NewUploadHandler(service.NewUploadService())

	routes := api.Group("/upload")
	routes.Use(middleware.Auth(tokenRepo))
	{
		routes.POST("/presign", h.UploadPresign)
	}
}

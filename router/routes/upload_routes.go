package routes

import (
	"github.com/aifuxi/fgo/internal/handler"
	"github.com/aifuxi/fgo/internal/middleware"
	"github.com/aifuxi/fgo/internal/repository"
	"github.com/aifuxi/fgo/internal/service"
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

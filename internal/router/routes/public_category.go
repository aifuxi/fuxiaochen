package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/gin-gonic/gin"
)

func RegisterPublicCategoryRoutes(api *gin.RouterGroup, h *handler.PublicCategoryHandler) {
	routes := api.Group("/categories")
	{
		routes.GET("", h.List)
		routes.GET("/:slug", h.FindBySlug)
	}
}

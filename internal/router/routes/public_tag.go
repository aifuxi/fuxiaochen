package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/gin-gonic/gin"
)

func RegisterPublicTagRoutes(api *gin.RouterGroup, h *handler.PublicTagHandler) {
	routes := api.Group("/tags")
	{
		routes.GET("", h.List)
		routes.GET("/:slug", h.FindBySlug)
	}
}

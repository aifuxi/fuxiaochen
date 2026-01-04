package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/gin-gonic/gin"
)

func RegisterPublicBlogRoutes(api *gin.RouterGroup, h *handler.PublicBlogHandler) {
	routes := api.Group("/blogs")
	{
		routes.GET("", h.List)
		routes.GET("/:slug", h.FindBySlug)
	}
}

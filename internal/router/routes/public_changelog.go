package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/gin-gonic/gin"
)

func RegisterPublicChangelogRoutes(api *gin.RouterGroup, h *handler.PublicChangelogHandler) {
	routes := api.Group("/changelogs")
	{
		routes.GET("", h.List)
	}
}

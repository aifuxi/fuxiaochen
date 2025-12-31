package routes

import (
	"github.com/aifuxi/fgo/internal/handler"
	"github.com/aifuxi/fgo/internal/repository"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/db"
	"github.com/gin-gonic/gin"
)

func RegisterPublicTagRoutes(api *gin.RouterGroup) {
	h := handler.NewPublicTagHandler(service.NewTagService(repository.NewTagRepository(db.GetDB())))

	routes := api.Group("/tags")
	{
		routes.GET("", h.List)
		routes.GET("/:slug", h.FindBySlug)
	}
}

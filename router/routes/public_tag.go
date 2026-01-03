package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/aifuxi/fuxiaochen-api/pkg/db"
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

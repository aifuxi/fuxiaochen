package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/aifuxi/fuxiaochen-api/pkg/db"
	"github.com/gin-gonic/gin"
)

func RegisterPublicCategoryRoutes(api *gin.RouterGroup) {
	h := handler.NewPublicCategoryHandler(service.NewCategoryService(repository.NewCategoryRepository(db.GetDB())))

	routes := api.Group("/categories")
	{
		routes.GET("", h.List)
		routes.GET("/:slug", h.FindBySlug)
	}
}

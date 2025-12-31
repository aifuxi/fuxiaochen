package routes

import (
	"github.com/aifuxi/fgo/internal/handler"
	"github.com/aifuxi/fgo/internal/repository"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/db"
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

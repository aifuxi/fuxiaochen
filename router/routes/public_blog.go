package routes

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/aifuxi/fuxiaochen-api/pkg/db"
	"github.com/gin-gonic/gin"
)

func RegisterPublicBlogRoutes(api *gin.RouterGroup) {
	h := handler.NewPublicBlogHandler(service.NewBlogService(repository.NewBlogRepository(db.GetDB())))

	routes := api.Group("/blogs")
	{
		routes.GET("", h.List)
		routes.GET("/:slug", h.FindBySlug)
	}
}

package routes

import (
	"github.com/aifuxi/fgo/internal/handler"
	"github.com/aifuxi/fgo/internal/repository"
	"github.com/aifuxi/fgo/internal/service"
	"github.com/aifuxi/fgo/pkg/db"
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

package router

import (
	"github.com/aifuxi/fuxiaochen-api/internal/app"
	"github.com/aifuxi/fuxiaochen-api/internal/router/routes"
	"github.com/aifuxi/fuxiaochen-api/pkg/response"
	"github.com/gin-gonic/gin"
)

func Init(version string, c *app.Container) *gin.Engine {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		response.Success(c, gin.H{
			"status":  "ok",
			"version": version,
		})
	})

	apiV1 := router.Group("/api/v1")

	routes.RegisterAuthRoutes(apiV1, c.AuthHandler)
	routes.RegisterUserRoutes(apiV1, c.UserHandler, c.UserService, c.TokenRepo)
	routes.RegisterRoleRoutes(apiV1, c.RoleHandler, c.UserService, c.TokenRepo)
	routes.RegisterTagRoutes(apiV1, c.TagHandler, c.UserService, c.TokenRepo)
	routes.RegisterBlogRoutes(apiV1, c.BlogHandler, c.UserService, c.TokenRepo)
	routes.RegisterCategoryRoutes(apiV1, c.CategoryHandler, c.UserService, c.TokenRepo)
	routes.RegisterUploadRoutes(apiV1, c.UploadHandler, c.TokenRepo)

	publicApiV1 := apiV1.Group("/public")

	routes.RegisterPublicBlogRoutes(publicApiV1, c.PublicBlogHandler)
	routes.RegisterPublicCategoryRoutes(publicApiV1, c.PublicCategoryHandler)
	routes.RegisterPublicTagRoutes(publicApiV1, c.PublicTagHandler)

	return router
}

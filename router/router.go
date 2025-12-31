package router

import (
    "github.com/aifuxi/fgo/internal/repository"
    "github.com/aifuxi/fgo/internal/service"
    "github.com/aifuxi/fgo/pkg/db"
    "github.com/aifuxi/fgo/pkg/response"
    "github.com/aifuxi/fgo/router/routes"
    "github.com/gin-gonic/gin"
)

func Init(version string) *gin.Engine {
	router := gin.Default()

	router.GET("/health", func(c *gin.Context) {
		response.Success(c, gin.H{
			"status":  "ok",
			"version": version,
		})
	})

	apiV1 := router.Group("/api/v1")

    userService := service.NewUserService(
        repository.NewUserRepository(db.GetDB()),
        repository.NewRoleRepository(db.GetDB()),
        repository.NewTokenRepository(db.GetDB()),
    )

		tokenRepo := repository.NewTokenRepository(db.GetDB())

	routes.RegisterAuthRoutes(apiV1, userService,tokenRepo)
	routes.RegisterUserRoutes(apiV1, userService,tokenRepo)
	routes.RegisterRoleRoutes(apiV1, userService,tokenRepo)
	routes.RegisterTagRoutes(apiV1, userService,tokenRepo)
	routes.RegisterBlogRoutes(apiV1, userService,tokenRepo)
	routes.RegisterCategoryRoutes(apiV1, userService,tokenRepo)
	routes.RegisterUploadRoutes(apiV1,tokenRepo)

	publicApiV1 := apiV1.Group("/public")

	routes.RegisterPublicBlogRoutes(publicApiV1)
	routes.RegisterPublicCategoryRoutes(publicApiV1)
	routes.RegisterPublicTagRoutes(publicApiV1)

	return router
}

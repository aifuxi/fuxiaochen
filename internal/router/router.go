package router

import (
	"time"

	"github.com/aifuxi/fuxiaochen-api/internal/app"
	"github.com/aifuxi/fuxiaochen-api/internal/router/routes"
	"github.com/aifuxi/fuxiaochen-api/pkg/response"
	ginzap "github.com/gin-contrib/zap"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func Init(version string, c *app.Container, logger *zap.Logger) *gin.Engine {
	router := gin.New()

	router.Use(ginzap.Ginzap(logger, time.RFC3339, true))

	// Logs all panic to error log
	//   - stack means whether output the stack info.
	router.Use(ginzap.RecoveryWithZap(logger, true))

	// 全局延迟中间件：所有接口都等待 x 秒后执行
	// router.Use(middleware.DelayMiddleware(5 * time.Second))

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
	routes.RegisterChangelogRoutes(apiV1, c.ChangelogHandler, c.UserService, c.TokenRepo)
	routes.RegisterBlogRoutes(apiV1, c.BlogHandler, c.UserService, c.TokenRepo)
	routes.RegisterCategoryRoutes(apiV1, c.CategoryHandler, c.UserService, c.TokenRepo)
	routes.RegisterUploadRoutes(apiV1, c.UploadHandler, c.TokenRepo)

	publicApiV1 := apiV1.Group("/public")

	routes.RegisterPublicBlogRoutes(publicApiV1, c.PublicBlogHandler)
	routes.RegisterPublicCategoryRoutes(publicApiV1, c.PublicCategoryHandler)
	routes.RegisterPublicTagRoutes(publicApiV1, c.PublicTagHandler)
	routes.RegisterPublicChangelogRoutes(publicApiV1, c.PublicChangelogHandler)

	return router
}

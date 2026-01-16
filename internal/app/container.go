package app

import (
	"github.com/aifuxi/fuxiaochen-api/internal/handler"
	"github.com/aifuxi/fuxiaochen-api/internal/repository"
	"github.com/aifuxi/fuxiaochen-api/internal/service"
	"github.com/aifuxi/fuxiaochen-api/pkg/db"
)

type Container struct {
	// Repositories
	TokenRepo     repository.TokenRepository
	ChangelogRepo repository.ChangelogRepository

	// Services
	UserService      service.UserService
	ChangelogService service.ChangelogService

	// Handlers
	AuthHandler            *handler.UserHandler
	UserHandler            *handler.UserHandler
	BlogHandler            *handler.BlogHandler
	CategoryHandler        *handler.CategoryHandler
	TagHandler             *handler.TagHandler
	ChangelogHandler       *handler.ChangelogHandler
	UploadHandler          *handler.UploadHandler
	PublicBlogHandler      *handler.PublicBlogHandler
	PublicCategoryHandler  *handler.PublicCategoryHandler
	PublicTagHandler       *handler.PublicTagHandler
	PublicChangelogHandler *handler.PublicChangelogHandler
}

func NewContainer() *Container {
	dbConn := db.GetDB()

	// Repositories
	userRepo := repository.NewUserRepository(dbConn)
	tokenRepo := repository.NewTokenRepository(dbConn)
	blogRepo := repository.NewBlogRepository(dbConn)
	categoryRepo := repository.NewCategoryRepository(dbConn)
	tagRepo := repository.NewTagRepository(dbConn)
	changelogRepo := repository.NewChangelogRepository(dbConn)

	// Services
	userService := service.NewUserService(userRepo, tokenRepo)
	blogService := service.NewBlogService(blogRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	tagService := service.NewTagService(tagRepo)
	changelogService := service.NewChangelogService(changelogRepo)
	uploadService := service.NewUploadService()

	// Handlers
	userHandler := handler.NewUserHandler(userService)
	blogHandler := handler.NewBlogHandler(blogService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	tagHandler := handler.NewTagHandler(tagService)
	changelogHandler := handler.NewChangelogHandler(changelogService)
	uploadHandler := handler.NewUploadHandler(uploadService)

	publicBlogHandler := handler.NewPublicBlogHandler(blogService)
	publicCategoryHandler := handler.NewPublicCategoryHandler(categoryService)
	publicTagHandler := handler.NewPublicTagHandler(tagService)
	publicChangelogHandler := handler.NewPublicChangelogHandler(changelogService)

	return &Container{
		TokenRepo:              tokenRepo,
		UserService:            userService,
		AuthHandler:            userHandler, // Auth uses UserHandler
		UserHandler:            userHandler,
		BlogHandler:            blogHandler,
		CategoryHandler:        categoryHandler,
		TagHandler:             tagHandler,
		ChangelogHandler:       changelogHandler,
		UploadHandler:          uploadHandler,
		PublicBlogHandler:      publicBlogHandler,
		PublicCategoryHandler:  publicCategoryHandler,
		PublicTagHandler:       publicTagHandler,
		PublicChangelogHandler: publicChangelogHandler,
	}
}

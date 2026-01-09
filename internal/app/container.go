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
	AuthHandler           *handler.UserHandler
	UserHandler           *handler.UserHandler
	RoleHandler           *handler.RoleHandler
	BlogHandler           *handler.BlogHandler
	CategoryHandler       *handler.CategoryHandler
	TagHandler            *handler.TagHandler
	ChangelogHandler      *handler.ChangelogHandler
	UploadHandler         *handler.UploadHandler
	PublicBlogHandler     *handler.PublicBlogHandler
	PublicCategoryHandler *handler.PublicCategoryHandler
	PublicTagHandler      *handler.PublicTagHandler
}

func NewContainer() *Container {
	dbConn := db.GetDB()

	// Repositories
	userRepo := repository.NewUserRepository(dbConn)
	roleRepo := repository.NewRoleRepository(dbConn)
	tokenRepo := repository.NewTokenRepository(dbConn)
	blogRepo := repository.NewBlogRepository(dbConn)
	categoryRepo := repository.NewCategoryRepository(dbConn)
	tagRepo := repository.NewTagRepository(dbConn)
	changelogRepo := repository.NewChangelogRepository(dbConn)

	// Services
	userService := service.NewUserService(userRepo, roleRepo, tokenRepo)
	blogService := service.NewBlogService(blogRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	tagService := service.NewTagService(tagRepo)
	changelogService := service.NewChangelogService(changelogRepo)
	roleService := service.NewRoleService(roleRepo)
	uploadService := service.NewUploadService()

	// Handlers
	userHandler := handler.NewUserHandler(userService)
	roleHandler := handler.NewRoleHandler(roleService)
	blogHandler := handler.NewBlogHandler(blogService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	tagHandler := handler.NewTagHandler(tagService)
	changelogHandler := handler.NewChangelogHandler(changelogService)
	uploadHandler := handler.NewUploadHandler(uploadService)

	publicBlogHandler := handler.NewPublicBlogHandler(blogService)
	publicCategoryHandler := handler.NewPublicCategoryHandler(categoryService)
	publicTagHandler := handler.NewPublicTagHandler(tagService)

	return &Container{
		TokenRepo:             tokenRepo,
		UserService:           userService,
		AuthHandler:           userHandler, // Auth uses UserHandler
		UserHandler:           userHandler,
		RoleHandler:           roleHandler,
		BlogHandler:           blogHandler,
		CategoryHandler:       categoryHandler,
		TagHandler:            tagHandler,
		ChangelogHandler:      changelogHandler,
		UploadHandler:         uploadHandler,
		PublicBlogHandler:     publicBlogHandler,
		PublicCategoryHandler: publicCategoryHandler,
		PublicTagHandler:      publicTagHandler,
	}
}

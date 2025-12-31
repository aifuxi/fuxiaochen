package main

import (
	"log"
	"slices"

	"github.com/aifuxi/fgo/config"
	"github.com/aifuxi/fgo/internal/model"
	"github.com/aifuxi/fgo/pkg/db"
	"github.com/aifuxi/fgo/pkg/logger"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := config.Init(); err != nil {
		log.Fatalf("Failed to initialize config: %v", err)
	}

	logger.Init(config.AppConfig.Log)
	logger.Log.Info("Configuration loaded successfully")

	if err := db.Init(config.AppConfig.Database); err != nil {
		logger.Sugar.Fatalf("Failed to initialize database: %v", err)
	}

	database := db.GetDB()

	database.AutoMigrate(
		&model.Tag{},
		&model.Blog{},
		&model.Category{},
		&model.User{},
		&model.Role{},
		&model.Permission{},
		&model.Token{},
	)

	permissions := []model.Permission{
		{Name: model.PermissionAdminAll, Code: model.PermissionAdminAll, Description: "超级管理员权限"},

		{Name: model.PermissionBlogList, Code: model.PermissionBlogList, Description: "博客列表权限"},
		{Name: model.PermissionBlogView, Code: model.PermissionBlogView, Description: "查看博客权限"},
		{Name: model.PermissionBlogCreate, Code: model.PermissionBlogCreate, Description: "创建博客权限"},
		{Name: model.PermissionBlogUpdate, Code: model.PermissionBlogUpdate, Description: "更新博客权限"},
		{Name: model.PermissionBlogDelete, Code: model.PermissionBlogDelete, Description: "删除博客权限"},

		{Name: model.PermissionCategoryList, Code: model.PermissionCategoryList, Description: "分类列表权限"},
		{Name: model.PermissionCategoryView, Code: model.PermissionCategoryView, Description: "查看分类权限"},
		{Name: model.PermissionCategoryCreate, Code: model.PermissionCategoryCreate, Description: "创建分类权限"},
		{Name: model.PermissionCategoryUpdate, Code: model.PermissionCategoryUpdate, Description: "更新分类权限"},
		{Name: model.PermissionCategoryDelete, Code: model.PermissionCategoryDelete, Description: "删除分类权限"},

		{Name: model.PermissionRoleList, Code: model.PermissionRoleList, Description: "角色列表权限"},
		{Name: model.PermissionRoleView, Code: model.PermissionRoleView, Description: "查看角色权限"},
		{Name: model.PermissionRoleCreate, Code: model.PermissionRoleCreate, Description: "创建角色权限"},
		{Name: model.PermissionRoleUpdate, Code: model.PermissionRoleUpdate, Description: "更新角色权限"},
		{Name: model.PermissionRoleDelete, Code: model.PermissionRoleDelete, Description: "删除角色权限"},

		{Name: model.PermissionUserList, Code: model.PermissionUserList, Description: "用户列表权限"},
		{Name: model.PermissionUserView, Code: model.PermissionUserView, Description: "查看用户权限"},
		{Name: model.PermissionUserCreate, Code: model.PermissionUserCreate, Description: "创建用户权限"},
		{Name: model.PermissionUserUpdate, Code: model.PermissionUserUpdate, Description: "更新用户权限"},
		{Name: model.PermissionUserDelete, Code: model.PermissionUserDelete, Description: "删除用户权限"},

		{Name: model.PermissionTagList, Code: model.PermissionTagList, Description: "标签列表权限"},
		{Name: model.PermissionTagView, Code: model.PermissionTagView, Description: "查看标签权限"},
		{Name: model.PermissionTagCreate, Code: model.PermissionTagCreate, Description: "创建标签权限"},
		{Name: model.PermissionTagUpdate, Code: model.PermissionTagUpdate, Description: "更新标签权限"},
		{Name: model.PermissionTagDelete, Code: model.PermissionTagDelete, Description: "删除标签权限"},
	}

	var allPermissions []model.Permission
	var visitorPermissions []model.Permission

	visitorPermissionCodes := []string{
		model.PermissionBlogList, model.PermissionBlogView,
		model.PermissionCategoryList, model.PermissionCategoryView,
		model.PermissionTagList, model.PermissionTagView,
	}

	for _, p := range permissions {
		perm := p
		database.Where("code = ?", perm.Code).FirstOrCreate(&perm)

		if perm.Code == model.PermissionAdminAll {
			allPermissions = append(allPermissions, perm)
			continue
		}

		if slices.Contains(visitorPermissionCodes, perm.Code) {
			visitorPermissions = append(visitorPermissions, perm)
		}
	}

	var adminRole model.Role
	database.Where("code = ?", model.RoleCodeAdmin).FirstOrCreate(&adminRole, model.Role{
		Name:        model.RoleCodeAdmin,
		Code:        model.RoleCodeAdmin,
		Description: "管理员角色",
	})

	var visitorRole model.Role
	database.Where("code = ?", model.RoleCodeVisitor).FirstOrCreate(&visitorRole, model.Role{
		Name:        model.RoleCodeVisitor,
		Code:        model.RoleCodeVisitor,
		Description: "访客角色",
	})

	if err := database.Model(&adminRole).Association("Permissions").Replace(allPermissions); err != nil {
		logger.Sugar.Fatalf("Failed to replace admin role permissions: %v", err)
	}

	if err := database.Model(&visitorRole).Association("Permissions").Replace(visitorPermissions); err != nil {
		logger.Sugar.Fatalf("Failed to replace visitor role permissions: %v", err)
	}

	// 默认新建admin用户
	defaultAdmin := &model.User{
		Nickname: "超级管理员",
		Email:    "admin@example.com",
		Password: "123456",
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(defaultAdmin.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Sugar.Fatalf("Failed to hash default admin password: %v", err)
	}
	defaultAdmin.Password = string(hashedPassword)

	if err := database.Where("email = ?", defaultAdmin.Email).FirstOrCreate(defaultAdmin).Error; err != nil {
		logger.Sugar.Fatalf("Failed to create default admin user: %v", err)
	}

	// 关联admin角色
	if err := database.Model(defaultAdmin).Association("Roles").Replace(&adminRole); err != nil {
		logger.Sugar.Fatalf("Failed to append admin role to default admin user: %v", err)
	}

	logger.Log.Info("Database migration completed successfully")
}

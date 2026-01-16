package main

import (
	"log"

	"github.com/aifuxi/fuxiaochen-api/config"
	"github.com/aifuxi/fuxiaochen-api/internal/model"
	"github.com/aifuxi/fuxiaochen-api/pkg/db"
	"github.com/aifuxi/fuxiaochen-api/pkg/logger"
	"github.com/aifuxi/fuxiaochen-api/pkg/password"
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
		&model.Token{},
		&model.Changelog{},
	)

	// 默认新建admin用户
	defaultAdmin := &model.User{
		Nickname: "超级管理员",
		Email:    "admin@example.com",
		Password: "123456",
		Role:     model.RoleAdmin,
	}

	hashedPassword, err := password.Hash(defaultAdmin.Password)
	if err != nil {
		logger.Sugar.Fatalf("Failed to hash default admin password: %v", err)
	}
	defaultAdmin.Password = string(hashedPassword)

	if err := database.Where("email = ?", defaultAdmin.Email).FirstOrCreate(defaultAdmin).Error; err != nil {
		logger.Sugar.Fatalf("Failed to create default admin user: %v", err)
	}

	logger.Log.Info("Database migration completed successfully")
}

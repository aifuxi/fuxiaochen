package db

import (
	"fmt"

	"github.com/aifuxi/fuxiaochen-api/config"
	"github.com/aifuxi/fuxiaochen-api/pkg/logger"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

func Init(cfg config.DatabaseConfig) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.DBName,
	)

	var err error

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("failed to connect to MySQL: %w", err)
	}

	logger.Log.Info("Connected to MySQL successfully")
	return nil
}

func GetDB() *gorm.DB {
	return db
}

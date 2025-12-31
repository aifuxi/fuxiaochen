package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aifuxi/fgo/config"
	"github.com/aifuxi/fgo/pkg/logger"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	glogger "gorm.io/gorm/logger"
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

	newLogger := glogger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // 日志输出到控制台
		glogger.Config{
			SlowThreshold: time.Millisecond * 100, // 慢SQL阈值（超过100ms打印警告）
			LogLevel:      glogger.Info,           // 日志级别：Info（打印所有SQL）
			Colorful:      true,                   // 彩色输出（开发环境友好）
		},
	)

	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return fmt.Errorf("failed to connect to MySQL: %w", err)
	}

	logger.Log.Info("Connected to MySQL successfully")
	return nil
}

func GetDB() *gorm.DB {
	return db
}

package main

import (
	"fmt"
	"log"

	"github.com/aifuxi/fgo/config"
	"github.com/aifuxi/fgo/pkg/db"
	"github.com/aifuxi/fgo/pkg/logger"
	"github.com/aifuxi/fgo/pkg/upload"
	"github.com/aifuxi/fgo/router"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := config.Init(); err != nil {
		log.Fatalf("Failed to initialize config: %v", err)
	}

	logger.Init(config.AppConfig.Log)
	logger.Log.Info("Configuration loaded successfully")

	gin.SetMode(config.AppConfig.Server.Mode)

	if err := db.Init(config.AppConfig.Database); err != nil {
		logger.Sugar.Fatalf("Failed to initialize database: %v", err)
	}

	upload.Init(config.AppConfig.OSS)

	router := router.Init(config.AppConfig.Server.Version)

	addr := fmt.Sprintf("%s:%d", config.AppConfig.Server.Host, config.AppConfig.Server.Port)

	// 打印应用版本号
	logger.Sugar.Infof("FGO API Server v%s is running on %s \n", config.AppConfig.Server.Version, addr)

	if err := router.Run(addr); err != nil {
		logger.Sugar.Fatalf("Failed to run server: %v", err)
	}
}

package config

import (
	"fmt"
	"os"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig   `mapstructure:",squash"`
	Database DatabaseConfig `mapstructure:",squash"`
	JWT      JWTConfig      `mapstructure:",squash"`
	Log      LogConfig      `mapstructure:",squash"`
	OSS      OSSConfig      `mapstructure:",squash"`
}

type ServerConfig struct {
	Port    int    `mapstructure:"SERVER_PORT"`
	Mode    string `mapstructure:"SERVER_MODE"`
	Version string `mapstructure:"SERVER_VERSION"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"DATABASE_HOST"`
	Port     int    `mapstructure:"DATABASE_PORT"`
	User     string `mapstructure:"DATABASE_USER"`
	Password string `mapstructure:"DATABASE_PASSWORD"`
	DBName   string `mapstructure:"DATABASE_DBNAME"`
}

type JWTConfig struct {
	Secret string `mapstructure:"JWT_SECRET"`
	Expire int    `mapstructure:"JWT_EXPIRE"`
}

type LogConfig struct {
	Level      string `mapstructure:"LOG_LEVEL"`
	Filename   string `mapstructure:"LOG_FILENAME"`
	MaxSize    int    `mapstructure:"LOG_MAX_SIZE"`
	MaxAge     int    `mapstructure:"LOG_MAX_AGE"`
	MaxBackups int    `mapstructure:"LOG_MAX_BACKUPS"`
	Compress   bool   `mapstructure:"LOG_COMPRESS"`
}

type OSSConfig struct {
	AccessKeyID     string `mapstructure:"OSS_ACCESS_KEY_ID"`
	AccessKeySecret string `mapstructure:"OSS_ACCESS_KEY_SECRET"`
	Region          string `mapstructure:"OSS_REGION"`
	Bucket          string `mapstructure:"OSS_BUCKET"`
	UploadDir       string `mapstructure:"OSS_UPLOAD_DIR"`
}

var AppConfig *Config

func Init() error {
	viper.SetConfigType("env")
	// Allow reading from environment variables (important if .env is missing or overridden)
	viper.AutomaticEnv()

	configFiles := []string{".env", "stack.env"}
	for _, file := range configFiles {
		if _, err := os.Stat(file); err == nil {
			viper.SetConfigFile(file)
			if err := viper.MergeInConfig(); err != nil {
				return fmt.Errorf("error reading config file %s: %w", file, err)
			}
		}
	}

	if err := viper.Unmarshal(&AppConfig); err != nil {
		return fmt.Errorf("unable to decode into struct: %w", err)
	}

	return nil
}

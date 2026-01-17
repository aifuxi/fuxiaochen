package config

import (
	"fmt"

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
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")

	// Allow reading from environment variables (important if .env is missing or overridden)
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		// It's okay if config file doesn't exist, we might be relying on env vars
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return fmt.Errorf("error reading config file: %w", err)
		}
	}

	if err := viper.Unmarshal(&AppConfig); err != nil {
		return fmt.Errorf("unable to decode into struct: %w", err)
	}

	return nil
}

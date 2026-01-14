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
	Port    int    `mapstructure:"server_port"`
	Mode    string `mapstructure:"server_mode"`
	Version string `mapstructure:"server_version"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"database_host"`
	Port     int    `mapstructure:"database_port"`
	User     string `mapstructure:"database_user"`
	Password string `mapstructure:"database_password"`
	DBName   string `mapstructure:"database_dbname"`
}

type JWTConfig struct {
	Secret string `mapstructure:"jwt_secret"`
	Expire int    `mapstructure:"jwt_expire"`
}

type LogConfig struct {
	Level      string `mapstructure:"log_level"`
	Filename   string `mapstructure:"log_filename"`
	MaxSize    int    `mapstructure:"log_max_size"`
	MaxAge     int    `mapstructure:"log_max_age"`
	MaxBackups int    `mapstructure:"log_max_backups"`
	Compress   bool   `mapstructure:"log_compress"`
}

type OSSConfig struct {
	AccessKeyID     string `mapstructure:"oss_access_key_id"`
	AccessKeySecret string `mapstructure:"oss_access_key_secret"`
	Region          string `mapstructure:"oss_region"`
	Bucket          string `mapstructure:"oss_bucket"`
	UploadDir       string `mapstructure:"oss_upload_dir"`
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

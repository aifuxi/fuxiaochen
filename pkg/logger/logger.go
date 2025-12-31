package logger

import (
	"os"

	"github.com/aifuxi/fgo/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var (
	Log   *zap.Logger
	Sugar *zap.SugaredLogger
)

func Init(cfg config.LogConfig) {
	writeSyncer := getLogWriter(cfg)
	encoder := getEncoder()

	var l = new(zapcore.Level)
	err := l.UnmarshalText([]byte(cfg.Level))
	if err != nil {
		// Default to info if parsing fails
		*l = zapcore.InfoLevel
	}

	core := zapcore.NewCore(encoder, writeSyncer, l)

	Log = zap.New(core, zap.AddCaller())
	Sugar = Log.Sugar()

	// Replace global logger
	zap.ReplaceGlobals(Log)
}

func GetLoggerWithSkip(skip int) *zap.SugaredLogger {
	return Log.WithOptions(zap.AddCallerSkip(skip)).Sugar()
}

func getEncoder() zapcore.Encoder {
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	return zapcore.NewConsoleEncoder(encoderConfig)
}

func getLogWriter(cfg config.LogConfig) zapcore.WriteSyncer {
	lumberJackLogger := &lumberjack.Logger{
		Filename:   cfg.Filename,
		MaxSize:    cfg.MaxSize,
		MaxBackups: cfg.MaxBackups,
		MaxAge:     cfg.MaxAge,
		Compress:   cfg.Compress,
	}
	return zapcore.NewMultiWriteSyncer(zapcore.AddSync(lumberJackLogger), zapcore.AddSync(os.Stdout))
}

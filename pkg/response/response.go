package response

import (
	"net/http"
	"time"

	"github.com/aifuxi/fgo/pkg/logger"
	"github.com/gin-gonic/gin"
)

type Response struct {
	Code      int       `json:"code"`
	Message   string    `json:"message"`
	Data      any       `json:"data,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// Success 成功
func Success(ctx *gin.Context, data any) {
	logger.GetLoggerWithSkip(1).Infof("Success: %v", data)
	ctx.JSON(http.StatusOK, Response{
		Code:      0,
		Message:   "ok",
		Data:      data,
		Timestamp: time.Now(),
	})
}

// ParamError 校验参数错误
func ParamError(ctx *gin.Context, msg string) {
	logger.GetLoggerWithSkip(1).Errorf("ParamError: %s", msg)
	ctx.JSON(http.StatusBadRequest, Response{
		Code:      1001,
		Message:   msg,
		Data:      nil,
		Timestamp: time.Now(),
	})
}

// BusinessError 业务逻辑错误
func BusinessError(ctx *gin.Context, msg string) {
	logger.GetLoggerWithSkip(1).Errorf("BusinessError: %s", msg)
	ctx.JSON(http.StatusOK, Response{
		Code:      -1,
		Message:   msg,
		Data:      nil,
		Timestamp: time.Now(),
	})
}

// Unauthorized 未授权
func Unauthorized(ctx *gin.Context, msg string) {
	logger.GetLoggerWithSkip(1).Errorf("Unauthorized: %s", msg)
	ctx.JSON(http.StatusUnauthorized, Response{
		Code:      401,
		Message:   msg,
		Data:      nil,
		Timestamp: time.Now(),
	})
}

// Forbidden 拒绝访问
func Forbidden(ctx *gin.Context, msg string) {
	logger.GetLoggerWithSkip(1).Errorf("Forbidden: %s", msg)
	ctx.JSON(http.StatusForbidden, Response{
		Code:      403,
		Message:   msg,
		Data:      nil,
		Timestamp: time.Now(),
	})
}

package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
)

// 自定义全局延迟中间件：让所有接口等待指定时间后执行后续逻辑
func DelayMiddleware(d time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 核心：在这里设置等待时间，先 sleep 再放行执行接口逻辑
		time.Sleep(d)
		// 放行，继续执行后续的接口 handler 业务逻辑
		c.Next()
	}
}

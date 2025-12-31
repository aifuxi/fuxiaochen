# 启动开发环境
dev:
	go run cmd/api/main.go

# 运行数据库迁移
migrate:
	go run cmd/migrate/main.go

.PHONY: dev migrate

# 启动开发环境
dev:
	go run cmd/api/main.go

# 运行数据库迁移
migrate:
	go run cmd/migrate/main.go

# 启动 MySQL
mysql:
	docker run -d \
	--name fgo-mysql \
	--restart always \
	-p 8306:3306 \
	-v fgo-mysql-data:/var/lib/mysql \
	-e MYSQL_ROOT_PASSWORD="123456" \
	-e MYSQL_DATABASE="fgo" \
	-e TZ="Asia/Shanghai" \
	mysql:8.0 \
	--character-set-server=utf8mb4 \
	--collation-server=utf8mb4_unicode_ci \
	--default-authentication-plugin=mysql_native_password

.PHONY: dev migrate

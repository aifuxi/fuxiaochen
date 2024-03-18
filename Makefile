.PHONY: run_all run_mysql8 db_dump db_dump_data

# MySQL 容器名称，使用 docker compose启动的时候，这个【容器名称会变动】
# 使用 docker container ls 查看
MYSQL_CONTAINER_NAME="fuxiaochen-mysql8-1"
# MySQL root用户密码
MYSQL_ROOT_PASSWORD="123456"
# MySQL 初始化时创建的数据库名称
MYSQL_DB_NAME="fuxiaochen"

# Docker Compose 启动全部服务
run_all:
	docker-compose up -d

# Docker Compose 只启动 MySQL
run_mysql8:
	docker-compose up -d mysql8

# 导出 MySQL 的数据和Schema
db_dump:
	docker exec -it ${MYSQL_CONTAINER_NAME} mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DB_NAME} > ./sql/${MYSQL_DB_NAME}_dump_data.sql

# 只导出 MySQL 的数据
db_dump_data:
	docker exec -it ${MYSQL_CONTAINER_NAME} mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} --no-create-info --no-create-db --single-transaction ${MYSQL_DB_NAME} > ./sql/${MYSQL_DB_NAME}_dump_data.sql

# 在后台启动Caddy，并配置反向代理
run_caddy:
	caddy start --config ./Caddyfile

# 重新加载Caddy配置
reload_caddy:
	caddy reload --config ./Caddyfile
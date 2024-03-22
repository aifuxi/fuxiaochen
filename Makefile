.PHONY: run_all run_mysql8 pm2_start pm2_reload pm2_stop

# Docker Compose 启动全部服务
run_all:
	docker-compose up -d

# Docker Compose 只启动 MySQL
run_mysql8:
	docker-compose up -d mysql8

# 在后台启动Caddy，并配置反向代理
start:
	caddy start --config ./Caddyfile

# 重新加载Caddy配置
reload:
	caddy reload --config ./Caddyfile

# 停止在后台启动的Caddy
stop:
	caddy stop --config ./Caddyfile

# pm2 启动 next.js 项目，服务的进程名为 next
pm2_start:
	pm2 start npm --name "next" -- start

# pm2 重新加载服务 next
pm2_reload:
	pm2 reload next

# pm2 停止上面启动的服务 next
pm2_stop:
	pm2 stop next
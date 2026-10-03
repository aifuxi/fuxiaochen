#!/bin/sh
set -eu
umask 077

if [ "${1:-}" = "serve" ]; then
  # 迁移或结构验证失败时退出，不启动使用错误 schema 的 Web 服务。
  npm run db:migrate
  set -- node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port 3000
fi

# Node.js 直接接收容器的停止信号。
exec "$@"

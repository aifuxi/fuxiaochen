#!/bin/sh
set -eu
umask 077

if [ "${1:-}" = "serve" ]; then
  # 迁移和结构验证由 Compose 的一次性 tools 服务完成。
  set -- node server.js
fi

# Node.js 直接接收容器的停止信号。
exec "$@"

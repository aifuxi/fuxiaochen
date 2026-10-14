#!/bin/sh
set -eu
umask 077

fail() {
  printf '%s\n' "$1" >&2
  exit "${2:-1}"
}

[ "$#" -gt 0 ] || fail "没有指定容器启动命令。" 64
# 容器使用绝对路径，保证 Web、启动检查和一次性运维命令锁定同一文件。
case "${DATABASE_PATH:-}" in
  /*) ;;
  *) fail "请设置绝对路径 DATABASE_PATH，并挂载持久数据目录。" 64 ;;
esac

# flock 持有打开的文件描述符，exec 后继续生效；锁文件不删除，进程结束自动释放锁。
# 以追加方式打开，避免异常路径别名被截断；私有卷只允许服务账号写入。
exec 9>>"${DATABASE_PATH}.maintenance.lock"

if [ "$1" = "serve" ]; then
  [ "$#" -eq 1 ] || fail "serve 不接受额外参数。" 64
  # 实例锁贯穿 Web 生命周期，拒绝滚动部署或第二个容器同时使用同一 SQLite。
  exec 8>>"${DATABASE_PATH}.serve.lock"
  flock --nonblock --exclusive 8 || fail "同一数据库已有 Web 实例，请先停止旧容器。" 5
  flock --nonblock --exclusive 9 || fail "数据库正在使用或维护，启动已停止。" 5
  case "${SQLITE_INITIALIZE:-0}" in
    0) set -- ;;
    1) set -- --initialize-if-missing ;;
    *) fail "SQLITE_INITIALIZE 只接受 0 或 1。" 64 ;;
  esac
  # 每次已有库启动均先备份，再迁移和完整校验；任一步失败都不启动 Web。
  node --conditions=react-server --import tsx scripts/startup-database.ts "$@" || exit 2
  flock --nonblock --shared 9 || fail "迁移后维护锁变化，请重试完整启动流程。" 5
  # EXCL→SHARED 转换存在竞争窗口；持共享锁再次核对，避免启动与其他版本不匹配的 Web。
  node --conditions=react-server --import tsx scripts/sqlite-database.ts verify || exit 4
  set -- node server.js
else
  # 标准初始化/迁移入口独占；在线备份、账号等日常命令可与 Web 共享维护锁。
  case " $* " in
    *" db:init "*|*" db:migrate "*|*" db:startup "*|*"scripts/sqlite-database.ts init "*|*"scripts/sqlite-database.ts migrate "*|*"scripts/startup-database.ts "*)
      flock --nonblock --exclusive 9 || fail "请停止 Web 和调度后再初始化或迁移数据库。" 5 ;;
    *)
      flock --nonblock --shared 9 || fail "数据库正在启动维护，请稍后重试运维命令。" 5 ;;
  esac
fi

# Node.js 直接接收容器的停止信号，并持有实例/维护锁至退出。
exec "$@"

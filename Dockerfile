# syntax=docker/dockerfile:1
FROM node:24.21.0-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
# 原生依赖没有预编译产物时允许源码构建，编译工具不进入运行镜像。
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked npm ci --include=dev

FROM dependencies AS build
ARG TARGETOS
ARG TARGETARCH
COPY . .
# 构建不接入数据库，迁移 SQL 随镜像一起打包。
# Next 文件追踪缓存包含原生依赖路径，按实际目标平台自动隔离。
RUN --mount=type=cache,id=fuxiaochen-next-${TARGETOS}-${TARGETARCH},target=/app/.next/cache,sharing=locked npm run build
RUN node scripts/package-runtime.mjs

FROM base AS runtime
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/app/data/database.sqlite \
    BACKUP_DIRECTORY=/app/data/backups \
    SQLITE_INITIALIZE=0 \
    PORT=3000
# flock 串行化共享数据目录的启动/维护命令；CA 用于 OSS 等 HTTPS 连接。
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates util-linux \
    && rm -rf /var/lib/apt/lists/*
# Web standalone 与追踪后的维护 CLI 共用一个运行镜像；没有 PostgreSQL 服务或工具链。
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --chmod=755 deploy/docker-entrypoint.sh /usr/local/bin/fuxiaochen-entrypoint
RUN mkdir -p /app/data /app/.next/cache \
    && chown node:node /app/data /app/.next/cache
USER node
# 使用最终运行用户执行真实原生功能与 TS loader，缺少目标平台文件时阻止发布。
RUN node --import tsx -e "const db = new (require('better-sqlite3'))(':memory:'); db.exec('CREATE TABLE probe (value INTEGER)'); db.close(); const a = require('argon2'); Promise.all([a.hash('standalone-build-check').then(h => a.verify(h, 'standalone-build-check')).then(ok => { if (!ok) throw new Error('Argon2 verify failed'); }), require('sharp')({ create: { width: 1, height: 1, channels: 3, background: 'white' } }).png().toBuffer()]).catch(e => { console.error(e); process.exit(1); })"

EXPOSE 3000
ENTRYPOINT ["fuxiaochen-entrypoint"]
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/login', { signal: AbortSignal.timeout(8000), redirect: 'manual' }).then(r => process.exit(r.status === 200 ? 0 : 1)).catch(() => process.exit(1))"
CMD ["serve"]

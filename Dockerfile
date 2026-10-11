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
COPY . .
# 构建不接入生产数据库；contract 由现有 prebuild 生成。
RUN --mount=type=cache,target=/app/.next/cache,sharing=locked npm run build

FROM dependencies AS production-dependencies
# 保留已安装的原生模块与运维依赖；开发工具在复制进运行镜像之前裁剪。
RUN --mount=type=cache,target=/root/.npm,sharing=locked npm prune --omit=dev --ignore-scripts --no-audit --no-fund

FROM base AS runtime
ENV NODE_ENV=production \
    BACKUP_DIRECTORY=/app/data/backups

# 使用 PostgreSQL 官方仓库的 18 系列客户端，支持应用内备份及 CLI 恢复。
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/keyrings/postgresql.asc \
    && echo "deb [signed-by=/usr/share/keyrings/postgresql.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/postgresql.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-18 \
    && rm -rf /var/lib/apt/lists/*

# 运行依赖包含 Prisma CLI、tsx 和交互式管理员命令，不携带纯开发工具。
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/generated ./generated
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/lib ./lib
COPY --from=build --chown=node:node /app/scripts ./scripts
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json /app/tsconfig.json /app/prisma.config.ts /app/next.config.ts ./
COPY --chmod=755 deploy/docker-entrypoint.sh /usr/local/bin/fuxiaochen-entrypoint
RUN mkdir -p /app/data /app/.next/cache && chown -R node:node /app/data /app/.next/cache

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/login', { signal: AbortSignal.timeout(8000), redirect: 'manual' }).then(r => process.exit(r.status === 200 ? 0 : 1)).catch(() => process.exit(1))"
ENTRYPOINT ["fuxiaochen-entrypoint"]
CMD ["serve"]

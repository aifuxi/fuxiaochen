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
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev

FROM dependencies AS build
COPY . .
# 构建不接入生产数据库；contract 由现有 prebuild 生成。
RUN npm run build && rm -rf .next/cache

FROM base AS runtime
ENV NODE_ENV=production \
    DATABASE_PATH=/app/data/admin.sqlite \
    BACKUP_DIRECTORY=/app/data/backups

# Prisma CLI、tsx 和交互式管理员命令仍需 devDependencies，不能只复制 Web 的依赖。
COPY --from=build --chown=node:node /app/node_modules ./node_modules
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

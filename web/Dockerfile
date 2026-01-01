# syntax=docker/dockerfile:1.6

FROM node:20-slim AS deps
WORKDIR /work
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Workspace manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
# App manifest for better install cache
COPY apps/fuxiaochen-portal/package.json apps/fuxiaochen-portal/package.json

# Install only the portal's dependencies
RUN pnpm --filter "fuxiaochen-portal" install --frozen-lockfile

# ----------------------------
# Build
# ----------------------------
FROM deps AS builder
WORKDIR /work
COPY apps/fuxiaochen-portal/ apps/fuxiaochen-portal/

# umami js 文件地址
ENV NEXT_PUBLIC_UMAMI_URL="umami-js-src"

# umami 需要统计的website id
ENV NEXT_PUBLIC_UMAMI_WEBSIT_ID="umami-website-id"

# api 接口地址
ENV NEXT_PUBLIC_API_URL="http://host.docker.internal:8080"

# Build Next.js (standalone output is enabled in next.config.mjs)
RUN pnpm --filter "fuxiaochen-portal" build

# ----------------------------
# Runtime image
# ----------------------------
FROM node:20-slim AS runner
ENV NODE_ENV=production
ENV PORT=3000

# Use a non-root directory
WORKDIR /app

# Copy the minimal standalone server produced by Next.js
COPY --from=builder /work/apps/fuxiaochen-portal/.next/standalone ./
COPY --from=builder /work/apps/fuxiaochen-portal/.next/static ./apps/fuxiaochen-portal/.next/static
COPY --from=builder /work/apps/fuxiaochen-portal/public ./apps/fuxiaochen-portal/public

# Expose port and run the server
EXPOSE 3000
WORKDIR /app/apps/fuxiaochen-portal
CMD ["node", "server.js"]


# 构建阶段
FROM node:24-alpine AS builder

WORKDIR /app

# 定义构建参数 (仅构建阶段需要的)
ARG DATABASE_URL
ARG NEXT_PUBLIC_UMAMI_URL
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ARG NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT
ARG NEXT_PUBLIC_SITE_URL

# 设置构建阶段环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_UMAMI_URL=$NEXT_PUBLIC_UMAMI_URL
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=$NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ENV NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT=$NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_CONTENT
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# 禁用husky
ENV HUSKY=0

# 复制源代码
COPY . .

# 安装依赖
RUN corepack enable && \
    corepack prepare pnpm@10 --activate && \
    pnpm install --frozen-lockfile

# 生成 Prisma 文件
RUN pnpm db:gen


# 构建应用
RUN pnpm build

# 生产阶段
FROM node:24-alpine AS runner

WORKDIR /app

# 设置运行阶段环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 standalone 输出
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 复制静态资源
COPY --from=builder /app/public/images ./public/images

# 设置权限
RUN chown -R nextjs:nodejs /app

USER nextjs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]

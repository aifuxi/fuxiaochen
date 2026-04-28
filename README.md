# fuxiaochen

基于 Next.js 16 App Router 的个人站点与后台管理系统。项目同时包含公开站点、认证页面、后台 CRUD、数据库配置化站点信息、内容导入脚本，以及 Docker standalone 部署配置。

## 技术栈

- Framework: Next.js 16, React 19, TypeScript strict
- UI: Tailwind CSS v4, shadcn/ui `new-york`, Radix UI, Lucide, Sonner, NiceModal
- Data: PostgreSQL, Drizzle ORM, Drizzle Kit, Redis
- Auth: Better Auth, GitHub OAuth
- Content: ByteMD Markdown preview/rendering, Highlight.js
- Tooling: Bun, Oxlint, Oxfmt, Husky, lint-staged, commitlint
- Deploy: Next `output: "standalone"`, Docker, `next-sitemap`

## 功能概览

- 公开站点：主页、博客、项目、友链、更新日志、关于页。
- 博客体验：分类/标签筛选、详情页、目录、代码高亮、阅读统计、点赞、相似文章、评论。
- 后台管理：分析看板、文章、项目、分类、标签、友链、更新日志、评论、用户、站点设置。
- 认证与权限：Better Auth 负责登录注册与会话，`proxy.ts` 保护 `/admin/**` 与 `/api/admin/**`。
- 站点配置：站点名称、SEO、个人资料、社交链接、备案与分析配置存储在 `site_settings`，默认值在 `lib/settings/defaults.ts`。
- 数据接口：公开接口位于 `/api/public/**`，后台接口位于 `/api/admin/**`，统一通过 `lib/server/**` 分层实现。

## 快速开始

### 环境要求

- Node.js `>= 20`，推荐使用仓库 `.nvmrc` 中的 Node `24`
- Bun `>= 1.3.11`
- Docker / Docker Compose，用于本地 PostgreSQL 与 Redis

### 安装依赖

```bash
bun install
```

### 配置环境变量

```bash
cp .env.example .env
```

至少需要配置：

- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_SITE_URL`
- GitHub OAuth 与 OSS 相关变量按需配置

本地依赖服务默认可以用 Docker 启动：

```bash
docker compose up -d postgresql redis
```

`.env.example` 中 PostgreSQL 端口为 `5400`，和 `docker-compose.yml` 的本地映射一致。密码、库名等值需要与本地 `.env` 保持一致。

### 初始化数据库

```bash
bun run db:migrate
```

如需导入 `data/` 下的博客、分类、标签示例内容：

```bash
bun run db:import:blog-content
```

### 启动开发服务器

```bash
bun run dev
```

默认访问：

- 公开站点：http://localhost:3000
- 后台入口：http://localhost:3000/admin

## 常用命令

| 命令                             | 说明                                           |
| -------------------------------- | ---------------------------------------------- |
| `bun run dev`                    | 启动 Next.js 开发服务器                        |
| `bun run build`                  | 生产构建，并在 `postbuild` 生成 sitemap        |
| `bun run start`                  | 启动生产构建产物                               |
| `bun run build:analyzer`         | 启用 bundle analyzer 执行构建                  |
| `bun run lint`                   | 运行 Oxlint                                    |
| `bun run lint:fix`               | 运行 Oxlint 自动修复                           |
| `bun run format`                 | 运行 Oxfmt 格式化                              |
| `bun run format:check`           | 检查格式                                       |
| `bun run db:generate`            | 根据 `lib/db/schema.ts` 生成 Drizzle migration |
| `bun run db:migrate`             | 执行 Drizzle migration                         |
| `bun run db:push`                | 直接推送 schema 到数据库                       |
| `bun run db:reset`               | 清空已存在表数据，不重建 schema                |
| `bun run db:studio`              | 打开 Drizzle Studio                            |
| `bun run db:import:blog-content` | 导入 `data/` 下的博客内容                      |
| `bun run commit`                 | 使用 Commitizen 生成提交信息                   |

## 目录结构

```text
app/
  (site)/             公开站点页面
  (auth)/             登录、注册页面
  (admin)/admin/      后台管理页面
  api/                Route Handlers
components/           业务组件与 shadcn/ui 组件
constants/            路由、展示文案、基础信息常量
data/                 内容导入用示例数据
drizzle/              Drizzle migration
hooks/                React hooks
lib/
  api/                前端 API fetcher
  db/                 Drizzle schema 与数据库连接
  server/             服务端 dto/handler/service/repository 分层
  settings/           站点配置类型与默认值
scripts/              数据库辅助脚本
public/               静态资源
```

## 数据与 API 约定

服务端资源通常按以下结构组织：

```text
lib/server/<resource>/
  dto.ts
  handler.ts
  service.ts
  repository.ts
  mappers.ts
```

- `dto` 使用 Zod 校验输入。
- `handler` 解析请求并返回统一 API envelope。
- `service` 承载业务规则和错误归一化。
- `repository` 承载 Drizzle 查询。
- `mappers` 将数据库行、聚合结果或第三方返回值归一化成 API DTO。

前端请求优先复用 `lib/api/fetcher.ts` 中的 `apiRequest`、`fetchApiData` 和 `buildApiUrl`。通用错误提示通过客户端事件总线集中分发，需要页面自行展示错误状态时可关闭 `toastOnError`。

## 数据库

Schema 唯一来源是 `lib/db/schema.ts`，migration 输出到 `drizzle/`。主要业务表包括：

- `blogs`, `categories`, `tags`, `blog_tags`
- `blog_daily_stats`
- `projects`, `friends`, `changelogs`
- `comments`, `notifications`
- `site_settings`
- Better Auth 相关的 `users`, `sessions`, `accounts`, `verifications`

修改 schema 后应执行：

```bash
bun run db:generate
bun run db:migrate
```

`bun run db:reset` 只清空当前 schema 下已经存在的表数据。如果目标数据库还没有建表，先运行 migration 或 `db:push`。

## 质量检查

提交前至少运行：

```bash
bun run lint
bun run format:check
```

涉及路由、构建配置、数据库 schema、服务端 API 或生产行为时，额外运行：

```bash
bun run build
```

仓库当前没有 `test` 脚本。Husky 会在提交时运行 lint-staged 与 commitlint，但本地钩子不应替代手动验证。

## Docker

构建镜像：

```bash
make build_image
```

或直接：

```bash
docker build -t fuxiaochen:latest .
```

运行依赖服务与应用容器：

```bash
docker compose up -d
```

Docker 构建与运行需要 `.env` 中提供数据库、Redis、Better Auth、OSS、GitHub OAuth、站点 URL 等环境变量。生产构建输出使用 Next standalone，运行入口为 `node server.js`。

Nginx 反向代理与缓存模板见 [`deployments/README.md`](deployments/README.md)。

## 提交规范

提交信息遵循 Conventional Commits，例如：

```text
feat(blog): improve list filtering
fix(api): handle invalid payload
```

可以使用：

```bash
bun run commit
```

PR 描述建议包含变更摘要、验证方式、UI 截图或录屏，以及 schema、认证或环境变量相关的升级说明。

## License

MIT

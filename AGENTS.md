# 仓库指南

## 项目概览

- 这是一个基于 Next.js 16 App Router、React 19 和 TypeScript strict 模式的个人站点项目。
- UI 使用 Tailwind CSS v4、shadcn/ui（`components.json` 为 `new-york` 风格）、Radix UI、Lucide 图标，并启用了 `tw-animate-css`；仓库中也安装了 `framer-motion`。
- 服务端数据层使用 Drizzle ORM + PostgreSQL，认证使用 Better Auth，部署产物通过 Next `output: "standalone"` 输出。
- 当前仓库同时存在两套数据来源：
  - 前台大部分页面和部分后台演示页面仍直接读取 `lib/blog-data.ts`、`lib/projects-data.ts`、`lib/changelog-data.ts` 等本地静态数据。
  - 真正的服务端 CRUD API 位于 `app/api/**`，具体实现按 `dto` / `handler` / `service` / `repository` 分层放在 `lib/server/**`。
- 修改功能前先确认你要改的是“静态展示数据”还是“真实 API / 数据库链路”，不要混用。

## 构建、检查与开发命令

- `pnpm dev`：启动本地 Next.js 开发服务器。
- `pnpm build`：生成生产构建；`postbuild` 会继续执行 sitemap 生成。
- `pnpm start`：运行生产构建产物。
- `pnpm build:analyzer`：带 bundle analyzer 执行生产构建。
- `pnpm lint` / `pnpm lint:fix`：运行 Oxlint 检查，或自动修复可安全修复的问题。
- `pnpm lint:inspect`：打印当前生效的 Oxlint 配置。
- `pnpm format` / `pnpm format:check`：使用 Oxfmt 格式化，或检查格式是否符合约定。
- `pnpm db:generate`：根据 `lib/db/schema.ts` 生成 Drizzle migration。
- `pnpm db:import:blog-content`：将 `data/` 下的博客、分类和标签内容导入当前数据库。
- `pnpm db:migrate`：执行 Drizzle migration。
- `pnpm db:push`：直接将 schema 推到数据库。
- `pnpm db:reset`：使用 `drizzle-seed` 的 `reset` 清空当前 schema 下的表数据，不会重新生成 migration 或重建 schema。
- `pnpm db:studio`：打开 Drizzle Studio。
- `pnpm commit` / `pnpm commit:retry`：使用 Commitizen 辅助生成提交信息。
- `make build_image`：读取 `.env` 中变量构建 Docker 镜像。

## 验证要求

- 仓库当前没有 `pnpm test`，不要凭空补测试命令说明。
- 提交前至少运行 `pnpm lint` 和 `pnpm format:check`。
- 如果改动涉及路由、构建配置、数据库 schema、服务端 API 或生产行为，额外运行 `pnpm build`。
- Husky + lint-staged 会在 `pre-commit` 阶段运行 Oxlint/Oxfmt，`commit-msg` 阶段运行 commitlint，但不要依赖钩子替代手动验证。

## 目录与架构约定

- `app/`：Next App Router 页面、布局和 Route Handler。
  - `app/api/**`：REST 风格接口入口。
  - `app/admin/**`：后台页面；当前不少页面仍是本地状态 + 静态数据驱动。
  - `app/blog/**`、`app/projects/**`、`app/changelog/**` 等：站点页面。
- `components/`：业务组件。
  - `components/ui/`：shadcn/ui 基础组件。
  - `components/admin/`：后台导航和布局组件。
- `lib/server/**`：服务端业务分层，按资源拆分为 `blogs`、`categories`、`tags`、`changelogs`，每个目录包含 `dto.ts`、`handler.ts`、`service.ts`、`repository.ts`。
- `lib/db/`：Drizzle 数据库接入与 schema。
  - `lib/db/schema.ts`：唯一 schema 来源。
  - `lib/db/index.ts`：数据库连接与开发环境全局复用逻辑。
- `lib/auth.ts` / `app/api/auth/[...all]/route.ts`：Better Auth 服务端配置与 Next 路由接入。
- `lib/*-data.ts`：静态内容数据源，当前前台页面大量依赖这些文件。
- `drizzle/`：migration 输出目录。
- `data/`：初始化样例数据和 SQL 参考，不是运行时主数据源。
- `scripts/`：数据库辅助脚本等命令入口，目前包含 `reset-db.ts` 与 `import-blog-content.ts`。
- `app/globals.css` 与 `styles/global.css`：全局样式入口目前是双文件并行；`components.json` 指向 `app/globals.css`，改样式时先确认目标文件。

## 代码风格与命名约定

- 使用 TypeScript，开启 `strict`，通过 `@/*` 引用仓库根目录模块。
- Oxfmt 负责 2 空格缩进、双引号、尾随逗号、导入排序，以及 Tailwind 类名排序。
- Oxlint 启用了 `typescript`、`react`、`nextjs`、`unicorn`、`oxc` 插件。
- `app/`、`components/`、`hooks/`、`lib/`、`constants/`、`styles/` 等目录下的文件名要求使用 kebab-case。
- 优先使用 inline `type` imports，避免无用变量；以 `_` 开头的未使用参数会被忽略。
- `no-console` 是 `warn`，面向生产的改动不要遗留调试 `console`。
- React 组件默认遵循 App Router / RSC 语义；只有确实需要交互时才添加 `"use client"`。
- 图片当前配置为 `images.unoptimized = true`，涉及 `next/image` 行为调整时要注意这一点。

## 数据与接口约定

- 如果在改真实数据链路，优先沿用现有模式：
  - `dto`：Zod 校验输入
  - `handler`：解析请求、返回统一响应
  - `service`：承载业务规则和错误归一化
  - `repository`：承载 Drizzle 查询
- 统一错误处理在 `lib/server/http/**`，不要在各 Route Handler 里随意拼装错误响应。
- 现有数据库表主要包括 `blogs`、`categories`、`tags`、`blog_tags`、`changelogs`。
- 修改 schema 后，应同步更新 Drizzle migration，而不是只改 TypeScript 类型。
- `pnpm db:reset` 只会清空已存在表中的数据；如果目标库还没建表，先运行 `pnpm db:migrate` 或 `pnpm db:push`。
- `pnpm db:import:blog-content` 面向真实数据库内容导入，不会自动修改 `lib/*-data.ts` 这些静态展示数据。
- 若只是改页面展示文案或演示内容，优先检查 `lib/blog-data.ts`、`lib/projects-data.ts`、`lib/changelog-data.ts` 等静态数据文件是否才是真正来源。

## 提交与 Pull Request 规范

- 提交信息遵循 Conventional Commits，例如 `feat(blog): improve list filtering`、`fix(api): handle invalid payload`。
- commitlint 使用 `@commitlint/config-conventional`，本地 `commit-msg` hook 会校验提交信息。
- 可以使用 `pnpm commit` 走 Commitizen 流程。
- PR 描述应包含：
  - 变更摘要
  - 验证方式
  - 若涉及 UI，附截图或录屏
  - 若涉及 schema、认证或 `.env` 变量，明确说明升级/配置步骤
- 重构、样式调整、行为修改尽量分开提交，避免混在同一个 PR 里。

## 环境、部署与安全提示

- 使用 Node `>=20`、pnpm `>=9`；仓库内 `.nvmrc` 当前为 Node 24。
- `.env.example` 中包含数据库、OSS、GitHub OAuth、Better Auth、Umami、Google Analytics、站点 URL 等变量；新增变量时同步更新示例文件和说明。
- 敏感信息只放在 `.env` 或 CI secret，不要提交密钥。
- Docker 构建依赖 `.env` / build args；GitHub Actions 在 tag push 和手动触发时都会构建并推送镜像。
- `next.config.ts` 当前开启了 `typescript.ignoreBuildErrors = true`。这意味着类型错误不一定会阻塞生产构建，改动后要主动关注 `tsc` / IDE 报错，而不是只看 `pnpm build` 是否通过。

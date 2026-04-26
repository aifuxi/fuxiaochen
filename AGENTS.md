# 仓库指南

## 项目概览

- 这是一个基于 Next.js 16 App Router、React 19 和 TypeScript strict 模式的个人站点项目。
- UI 使用 Tailwind CSS v4、shadcn/ui（`components.json` 为 `new-york` 风格）、Radix UI、Lucide 图标，并启用了 `tw-animate-css`；仓库中也安装了 `framer-motion`。
- 服务端数据层使用 Drizzle ORM + PostgreSQL，认证使用 Better Auth，部署产物通过 Next `output: "standalone"` 输出。
- Redis 用于部分服务端统计/交互状态（例如博客浏览、点赞相关链路），本地环境可通过 `docker-compose.yml` 同时启动 PostgreSQL 与 Redis。
- 当前仓库以前同时存在静态数据文件和真实 API 两套数据来源，但 `lib/*-data.ts` 这类前台静态数据文件已经移除。
- 当前站点页面与后台 CRUD 数据链路统一以 `app/api/**` + `lib/server/**` 为准，前端数据请求优先复用 `lib/api/fetcher.ts` 的 `fetchApiData` / `apiRequest`，具体服务端实现按 `dto` / `handler` / `service` / `repository` 分层组织。
- 站点级配置已经迁移到数据库 `site_settings`，默认兜底在 `lib/settings/defaults.ts`；站点 shell、metadata、导航、页脚等运行时配置应优先走 settings 链路，而不是继续散落新增常量。
- 修改功能前先确认你要改的是页面文案 / 常量配置，还是“真实 API / 数据库链路”，不要混用。

## 构建、检查与开发命令

- `bun run dev`：启动本地 Next.js 开发服务器。
- `bun run build`：生成生产构建；`postbuild` 会继续执行 sitemap 生成。
- `bun run start`：运行生产构建产物。
- `bun run build:analyzer`：带 bundle analyzer 执行生产构建。
- `bun run lint` / `bun run lint:fix`：运行 Oxlint 检查，或自动修复可安全修复的问题。
- `bun run lint:inspect`：打印当前生效的 Oxlint 配置。
- `bun run format` / `bun run format:check`：使用 Oxfmt 格式化，或检查格式是否符合约定。
- `bun run db:generate`：根据 `lib/db/schema.ts` 生成 Drizzle migration。
- `bun run db:import:blog-content`：将 `data/` 下的博客、分类和标签内容导入当前数据库。
- `bun run db:migrate`：执行 Drizzle migration。
- `bun run db:push`：直接将 schema 推到数据库。
- `bun run db:reset`：使用 `drizzle-seed` 的 `reset` 清空当前 schema 下的表数据，不会重新生成 migration 或重建 schema。
- `bun run db:studio`：打开 Drizzle Studio。
- `bun run commit` / `bun run commit:retry`：使用 Commitizen 辅助生成提交信息。
- `make build_image`：读取 `.env` 中变量构建 Docker 镜像。
- `docker compose up -d postgresql redis`：启动本地 PostgreSQL 与 Redis 依赖；应用容器也定义在 compose 文件中，但日常开发通常只需要依赖服务。

## 验证要求

- 仓库当前没有 `test` 脚本，不要凭空补测试命令说明。
- 提交前至少运行 `bun run lint` 和 `bun run format:check`。
- 如果改动涉及路由、构建配置、数据库 schema、服务端 API 或生产行为，额外运行 `bun run build`。
- 当前 `next.config.ts` 没有启用 `typescript.ignoreBuildErrors`；如果未来重新打开该开关，应同步更新本文件并补充独立类型检查要求。
- 如果改动涉及 Drizzle 聚合查询、子查询字段映射，除了 `bun run build` 以外，尽量再做一次真实运行链路验证（直接调用 repository / handler，或用真实接口请求），不要只看静态构建是否通过。
- Husky + lint-staged 会在 `pre-commit` 阶段运行 Oxlint/Oxfmt，`commit-msg` 阶段运行 commitlint，但不要依赖钩子替代手动验证。

## 目录与架构约定

- `app/`：Next App Router 页面、布局和 Route Handler。
  - `app/api/**`：REST 风格接口入口。
  - `app/(site)/**`：公开站点页面，URL 仍保持 `/`、`/blog`、`/projects`、`/friends`、`/changelog` 等，不要因为 route group 改动改变公开 URL。
  - `app/(auth)/**`：登录、注册等认证页面。
  - `app/(admin)/admin/**`：后台页面，URL 仍保持 `/admin/**`；`proxy.ts` 同时保护 `/admin/:path*` 与 `/api/admin/:path*`。
- `components/`：业务组件。
  - `components/ui/`：shadcn/ui 基础组件。
  - `components/admin/`：后台导航、布局和后台业务组件。
- `lib/api/fetcher.ts`：前端请求统一解析 API envelope 的客户端工具，站点和后台 SWR 请求优先复用它。
- `lib/server/**`：服务端业务分层，按资源拆分为 `analytics`、`blogs`、`categories`、`changelogs`、`comments`、`friends`、`notifications`、`projects`、`settings`、`tags`、`users` 等目录；常规资源目录通常包含 `dto.ts`、`handler.ts`、`service.ts`、`repository.ts`，需要序列化时再配 `mappers.ts`。
- `lib/db/`：Drizzle 数据库接入与 schema。
  - `lib/db/schema.ts`：唯一 schema 来源。
  - `lib/db/index.ts`：数据库连接与开发环境全局复用逻辑。
- `lib/auth.ts` / `app/api/auth/[...all]/route.ts`：Better Auth 服务端配置与 Next 路由接入。
- `lib/settings/**`：站点配置类型和默认值兜底，和数据库 `site_settings` / public settings API 配套使用。
- `constants/routes.ts`：页面路由常量，只放真实页面 URL 和动态页面 builder，不要把 `/api/**` 路径或未落地占位路由放进去。
- `constants/site-copy.ts`：公开站点展示文案集中入口；纯文案调整优先查这里。
- `drizzle/`：migration 输出目录。
- `data/`：初始化样例数据和 SQL 参考，不是运行时主数据源。
- `scripts/`：数据库辅助脚本等命令入口，目前包含 `reset-db.ts` 与 `import-blog-content.ts`。
- `app/globals.css`：全局样式入口；`components.json` 与 `.oxfmtrc.json` 的 Tailwind 类名排序都指向该文件。当前没有 `styles/global.css`，不要再新增或引用旧路径，除非是有意识的样式结构调整。

## 代码风格与命名约定

- 使用 TypeScript，开启 `strict`，通过 `@/*` 引用仓库根目录模块。
- Oxfmt 负责 2 空格缩进、双引号、尾随逗号、导入排序，以及 Tailwind 类名排序。
- Oxlint 启用了 `typescript`、`react`、`nextjs`、`unicorn`、`oxc` 插件。
- `.oxlintrc.json` 当前对 `app/`、`components/`、`pages/`、`constants/`、`utils/`、`hooks/`、`types/`、`lib/` 下的文件名启用 kebab-case 检查。
- 优先使用 inline `type` imports，避免无用变量；以 `_` 开头的未使用参数会被忽略。
- `no-console` 是 `warn`，面向生产的改动不要遗留调试 `console`。
- React 组件默认遵循 App Router / RSC 语义；只有确实需要交互时才添加 `"use client"`。
- 图片当前配置为 `images.unoptimized = true`，涉及 `next/image` 行为调整时要注意这一点。

### 交互组件规范 (NiceModal)

Dialog、Alert、Drawer 组件必须统一通过 NiceModal 管理：

```tsx
// 定义组件
export const ExampleDialog = NiceModal.create(({ data, onSuccess }) => {
  const modal = NiceModal.useModal();

  return (
    <Dialog open={modal.visible} onOpenChange={modal.remove}>
      <DialogContent>
        <Button onClick={() => modal.remove()}>取消</Button>
      </DialogContent>
    </Dialog>
  );
});

// 使用组件
NiceModal.show(ExampleDialog, { data, onSuccess: () => mutate() });
```

## 数据与接口约定

- 如果在改真实数据链路，优先沿用现有模式：
  - `dto`：Zod 校验输入
  - `handler`：解析请求、返回统一响应
  - `service`：承载业务规则和错误归一化
  - `repository`：承载 Drizzle 查询
  - `mappers`：把数据库行、聚合结果或第三方返回值归一化成 API DTO
- 统一错误处理在 `lib/server/http/**`，不要在各 Route Handler 里随意拼装错误响应。
- 现有数据库表主要包括 `blogs`、`categories`、`tags`、`blog_tags`、`blog_daily_stats`、`projects`、`friends`、`changelogs`、`comments`、`notifications`、`site_settings`，以及 Better Auth 相关的 `users`、`sessions`、`accounts`、`verifications`。
- 公开接口主要位于 `/api/public/**`，后台接口主要位于 `/api/admin/**`；后台接口即使已经被 `proxy.ts` 保护，涉及敏感资源时仍应在 handler/service 层保留必要的权限与业务校验。
- 评论链路约定为公开创建默认 `pending`，公开列表只返回 `approved`，后台接口负责审核、回复和状态管理。
- 站点配置接口为 `/api/public/settings` 与 `/api/admin/settings`；`next-sitemap` 仍读取 `NEXT_PUBLIC_SITE_URL`，不会自动读取数据库 settings。
- 修改 schema 后，应同步更新 Drizzle migration，而不是只改 TypeScript 类型。
- 在 Drizzle 里只要 `sql\`\``字段会进入子查询、聚合结果或被外层查询复用，必须显式`.as("...")` 起别名；不要依赖属性名推断，否则构建或运行时可能报 “raw SQL field doesn't have an alias”。
- PostgreSQL 的聚合时间字段（例如 `max(timestamp with time zone)`）在运行时可能返回字符串，不要只按 TypeScript 注解把它当 `Date` 用；在 mapper/serializer 层统一按 `Date | string | null` 归一化后再调用 `toISOString()`。
- `bun run db:reset` 只会清空已存在表中的数据；如果目标库还没建表，先运行 `bun run db:migrate` 或 `bun run db:push`。
- `bun run db:import:blog-content` 面向真实数据库内容导入，不会自动修改页面文案、站点常量或其他非数据库配置。
- 若只是改页面展示文案或说明性内容，优先检查 `constants/`、页面组件和相关文案来源，不要误以为 `lib/*-data.ts` 仍是运行时数据入口。

## 提交与 Pull Request 规范

- 提交信息遵循 Conventional Commits，例如 `feat(blog): improve list filtering`、`fix(api): handle invalid payload`。
- commitlint 使用 `@commitlint/config-conventional`，本地 `commit-msg` hook 会校验提交信息。
- 可以使用 `bun run commit` 走 Commitizen 流程。
- PR 描述应包含：
  - 变更摘要
  - 验证方式
  - 若涉及 UI，附截图或录屏
  - 若涉及 schema、认证或 `.env` 变量，明确说明升级/配置步骤
- 重构、样式调整、行为修改尽量分开提交，避免混在同一个 PR 里。

## 环境、部署与安全提示

- 使用 Node `>=20`、Bun `>=1.3.11`；仓库内 `.nvmrc` 当前为 Node 24。
- `.env.example` 中包含 PostgreSQL、Redis、OSS、GitHub OAuth、Better Auth 和站点 URL 变量；站点分析类开关目前属于数据库 `site_settings.analytics`，新增真实环境变量时同步更新示例文件和说明。
- 敏感信息只放在 `.env` 或 CI secret，不要提交密钥。
- Docker 构建依赖 `.env` / build args，至少需要 `DATABASE_URL` 和 `NEXT_PUBLIC_SITE_URL`；生产运行时仍需提供 Better Auth、OSS、GitHub OAuth、PostgreSQL、Redis 等服务端环境变量。GitHub Actions 在 tag push 和手动触发时都会构建并推送镜像。
- `next.config.ts` 当前保留 `images.unoptimized = true` 和 `output: "standalone"`；涉及图片优化、Docker 运行方式或 standalone 输出结构时要同步检查该配置。

# 仓库指南

## 项目结构与模块组织

`app/` 存放 Next.js App Router 代码：前台页面在 `app/(site)`，后台页面在 `app/(admin)`，接口路由在 `app/api`，服务端 actions 在 `app/actions`。可复用 UI 组件集中在 `components/`，包括 `ui/`、`layout/`、`blog/`、`admin/`、`portal/`。通用逻辑放在 `lib/`、`hooks/`、`stores/`、`constants/` 和 `types/`。数据库 schema、迁移和种子数据位于 `prisma/`，生成的 Prisma 客户端输出在 `generated/prisma/`。静态资源放在 `public/`，全局 Tailwind 样式入口是 `styles/global.css`。

## 构建、测试与开发命令

- `pnpm dev`：启动本地 Next.js 开发服务器。
- `pnpm build`：生成生产构建；`postbuild` 会额外生成 sitemap 文件。
- `pnpm start`：本地启动生产构建产物。
- `pnpm lint` / `pnpm lint:fix`：运行 ESLint 检查，或自动修复可安全处理的问题。
- `pnpm format`：使用 Prettier 和导入排序规则格式化整个仓库。
- `pnpm db:prepare` 或 `pnpm db:dev`：执行 Prisma 迁移并重新生成客户端。
- `pnpm db:studio`：打开 Prisma Studio 查看本地数据库内容。
- `make build_image`：读取 `.env` 中的变量构建 Docker 镜像。

## 代码风格与命名约定

项目使用 TypeScript，启用 `strict` 模式，并通过 `@/*` 引用根目录路径。Prettier 统一 2 空格缩进、分号、尾随逗号和双引号。ESLint 要求应用代码文件名使用 kebab-case，并优先使用内联 `type` imports。路由相关代码放在 `app/...`，共享工具函数放在 `lib/`，通用基础组件放在 `components/ui/`。除非确有必要，不要保留面向生产环境的 `console` 输出。

## 测试指南

仓库当前没有提交 Jest、Vitest 或 Playwright 测试套件，也没有配置覆盖率门槛。提交 PR 前，至少运行 `pnpm lint` 和 `pnpm build`。如果改动涉及 Prisma、认证、上传或后台流程，还应在本地手动冒烟验证对应页面或接口。后续若新增自动化测试，优先使用就近放置的 `*.test.ts(x)` 文件，或新增镜像目录结构的顶层 `tests/` 目录。

## 提交与 Pull Request 规范

提交信息遵循 Conventional Commits，例如 `feat(blog): improve card layout` 或 `fix: remove debug log`。`commitlint` 会校验提交消息；如果需要交互式提交流程，可使用 `pnpm commit` 启动 Commitizen。PR 应包含简短变更说明；涉及界面改动时附截图；涉及 schema 或 `.env` 变更时补充说明；有对应 issue 时一并关联。重构与行为修改尽量分开提交。

## 安全与配置提示

使用 Node `>=20` 和 pnpm `>=9`。敏感信息仅存放在 `.env` 中，不要提交任何密钥或凭据。Docker、认证、分析埋点和数据库配置都依赖环境变量；新增变量时，请在 PR 描述中明确说明用途与配置方式。

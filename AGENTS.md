# AGENT

我是一个 AI 助手，旨在帮助您开发和维护 fuxiaochen.com 项目。我了解项目的技术栈、编码规范和工作流程。

## 核心技术

- **框架**: Next.js 15, React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **数据库**: Prisma, SQLite
- **认证**: better-auth
- **Markdown**: Bytemd
- **部署**: Docker

## 开发工作流

我可以通过 `pnpm` 执行以下常见开发任务：

- **`pnpm dev`**: 启动开发服务器。
- **`pnpm build`**: 构建生产版本。
- **`pnpm start`**: 启动生产服务器。
- **`pnpm lint`**: 检查代码风格。
- **`pnpm format`**: 格式化代码。

## 数据库管理

我可以使用 Prisma 执行以下数据库操作：

- **`pnpm db:push`**: 将 Prisma schema 同步到数据库。
- **`pnpm db:gen`**: 生成 Prisma Client。
- **`pnpm db:studio`**: 启动 Prisma Studio 以查看和编辑数据。
- **`pnpm db:dev`**: 创建并应用新的数据库迁移。

## 代码风格与检查

本项目使用 ESLint 和 Prettier 保证代码风格统一。在提交代码前，请确保已运行 `pnpm lint` 和 `pnpm format`。

## Commit 规范

本项目遵循 Conventional Commits 规范。请使用 `pnpm commit` 命令生成符合规范的 commit message。

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

### 开发
- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm build:analyzer` - 分析构建包大小

### 代码质量
- `pnpm lint` - ESLint 检查
- `pnpm lint:fix` - ESLint 检查并自动修复
- `pnpm format` - Prettier 格式化代码

### 数据库
- `pnpm db:gen` - 生成 Prisma Client
- `pnpm db:push` - 推送 schema 变更到数据库
- `pnpm db:dev` - 运行 Prisma 迁移（开发环境）
- `pnpm db:reset` - 重置数据库
- `pnpm db:studio` - 打开 Prisma Studio
- `pnpm db:seed` - 填充种子数据

### 部署
- `pnpm pm2:start` - 使用 PM2 启动应用
- `pnpm pm2:stop` / `pnpm pm2:restart` - PM2 管理命令

### Git 提交
- `pnpm commit` - 使用 Commitizen 提交（遵循 Conventional Commits）
- `pnpm commit:retry` - 重试失败的提交

## 技术栈

- **框架**: Next.js 16.1.1 (App Router) + React 19.2.3
- **语言**: TypeScript 5.9.3（严格模式）
- **数据库**: MySQL/MariaDB + Prisma ORM
- **样式**: Tailwind CSS 4 + Radix UI
- **认证**: Better Auth（支持 GitHub OAuth 和邮箱密码登录）
- **包管理器**: pnpm

## 架构模式

### Interface-First 数据流架构

```
Client Component
    ↓
Server Action ('use server')
    ↓
Store Interface (stores/*/interface.ts)
    ↓
Store Implementation (stores/*/store.ts)
    ↓
Prisma ORM
    ↓
MySQL/MariaDB
```

1. **Interface 定义** (`stores/*/interface.ts`)：定义 Store 接口契约
2. **Implementation 实现** (`stores/*/store.ts`)：实现具体业务逻辑
3. **Server Action** (`app/actions/*.ts`)：统一入口，处理错误和缓存（`revalidatePath`）

### 模块结构

每个业务模块包含：
- `types/[module].ts` - TypeScript 类型定义
- `stores/[module]/interface.ts` - Store 接口
- `stores/[module]/store.ts` - Store 实现
- `app/actions/[module].ts` - Server Actions
- `components/[module]/*` - 业务组件

## 代码规范

### 命名约定
- 文件: `kebab-case` (如 `blog-list.tsx`)
- 组件: `PascalCase` (如 `BlogList`)
- 变量/函数: `lowerCamelCase` (如 `fetchBlogData`)
- 类型/接口: `PascalCase` (如 `IBlogStore`)
- Store 接口前缀: `I` (如 `IBlogStore`)

### NiceModal 管理（重要）

Dialog、Alert、Drawer 组件**必须**通过 NiceModal 统一管理，避免本地 `open` 状态造成状态分裂：

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

**禁止**：
- 使用 `open`/`onOpenChange` 作为外部状态控制
- 使用 `DialogTrigger` 直接触发

### ESLint 配置要点

- 使用 flat config 格式
- 启用 TypeScript 项目服务 (`projectService: true`)
- Tailwind CSS 类检查 (`@/styles/global.css` 作为入口点)
- 文件命名强制 `KEBAB_CASE`
- 类型导入使用 `type` 关键字 (`import type { ... }`)

### 认证权限

使用 `checkAdmin()` 函数保护需要管理员权限的 Server Action：

```ts
"use server";
import { checkAdmin } from "@/lib/auth-guard";

export async function createBlogAction(data: BlogCreateReq) {
  await checkAdmin(); // 未登录或非管理员会抛出错误
  // ...
}
```

首个注册的用户会自动获得 admin 权限。

### 数据库软删除

大多数模型使用软删除（`deletedAt` 字段）。查询时需要过滤已删除记录：

```ts
const where: Prisma.BlogWhereInput = { deletedAt: null };
```

### Prisma Client

Prisma Client 生成到 `generated/prisma/` 目录（已在 `.gitignore` 中）。

## 设计系统：Liquid Glass

核心特性：
- 配色：Light `#f2f4f7` / Dark `#121212` 背景
- 视觉：`backdrop-blur`、大圆角 (`24px`)、药丸状按钮
- 字体：Inter (Sans) 和 JetBrains Mono (Mono)

## 重要文件路径

- `styles/global.css` - Tailwind CSS 4 配置入口
- `lib/auth.ts` - Better Auth 配置
- `lib/auth-guard.ts` - 权限守卫
- `prisma/schema.prisma` - 数据库模型
- `generated/prisma/` - Prisma Client 生成目录（忽略）

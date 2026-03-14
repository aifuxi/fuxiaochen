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
- **Markdown**: ByteMD（博客编辑器）
- **存储**: OSS（文件上传）
- **包管理器**: pnpm

## 项目目录结构

```
├── app/                    # Next.js App Router
│   ├── (admin)/           # 管理后台路由组
│   │   ├── admin/         # 后台页面（blogs, categories, tags, users, changelogs）
│   │   ├── layout.tsx     # 后台布局
│   │   └── admin-sidebar.tsx
│   ├── (site)/            # 前台路由组（blog, about, changelog, login, ui-preview）
│   ├── actions/           # Server Actions
│   ├── api/               # API 路由
│   └── layout.tsx         # 根布局
├── components/
│   ├── ui/                # 基础 UI 组件（shadcn/ui）
│   ├── admin/             # 后台业务组件
│   ├── blog/              # 博客相关组件
│   ├── layout/            # 布局组件（header, footer）
│   └── portal/            # 传送门组件
├── stores/                # 状态管理（Interface-First 架构）
├── types/                 # TypeScript 类型定义
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具函数
├── styles/                # 全局样式
└── prisma/                # 数据库相关
```

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

### 业务模块

每个业务模块包含：
- `types/[module].ts` - TypeScript 类型定义
- `stores/[module]/interface.ts` - Store 接口
- `stores/[module]/store.ts` - Store 实现
- `app/actions/[module].ts` - Server Actions
- `components/[module]/*` - 业务组件

**现有模块**：blog, category, tag, changelog, user, upload, dashboard

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
- Tailwind CSS 类检查（`@/styles/global.css` 作为入口点）
- 文件命名强制 `KEBAB_CASE`
- 类型导入使用 `type` 关键字 (`import type { ... }`)
- 遇到 ESLint 问题时，可执行 `pnpm lint:fix` 尝试自动修复

## 认证权限

**用户角色**：`role` 为整数类型，`1` = 管理员 (admin)，`2` = 普通用户 (normal)，默认为 `2`。

使用 `checkAdmin()` 函数保护需要管理员权限的 Server Action：

```ts
"use server";
import { checkAdmin } from "@/lib/auth-guard";

export async function createBlogAction(data: BlogCreateReq) {
  await checkAdmin(); // 未登录或 role !== 1 会抛出错误
  // ...
}
```

首个注册的用户会自动获得 admin 权限 (`role = 1`)。

### 数据库软删除

大多数模型使用软删除（`deletedAt` 字段）。查询时需要过滤已删除记录：

```ts
const where: Prisma.BlogWhereInput = { deletedAt: null };
```

### Prisma Client

Prisma Client 生成到 `generated/prisma/` 目录（已在 `.gitignore` 中）。

## 数据库模型

### 业务模型
- **Blog** - 博客文章（title, slug, description, cover, content, published）
- **Category** - 分类（name, slug），与 Blog 一对多
- **Tag** - 标签（name, slug），与 Blog 多对多
- **Changelog** - 更新日志（version, content, date）

### 认证模型（Better Auth）
- **User** - 用户（name, email, image, role）
- **Session** - 会话
- **Account** - 第三方账户
- **Verification** - 验证码

## 设计系统：shadcn/ui

项目使用 shadcn/ui new-york 风格，Zinc 配色预设。

### 颜色 Token 规范

- 页面背景：`bg-background`
- 主文字：`text-foreground`
- 次级文字：`text-muted-foreground`
- 卡片/面板背景：`bg-card` 或 `bg-muted`
- 悬停背景：`hover:bg-accent`
- 主操作色：`bg-primary` / `text-primary`
- 主操作反色（按钮文字）：`text-primary-foreground`
- 危险/错误色：`bg-destructive` / `text-destructive`
- 边框：`border-border`
- 博客内容区：`blog-prose` 类（原 `apple-prose`）
- 禁止使用 Tailwind 原生色（`blue-500`、`green-600` 等）用于语义色
- 禁止使用已移除的 Apple HIG token（`bg-surface`、`text-text`、`bg-accent`（旧含义）等）

### 组件规范

- 优先使用 shadcn/ui 原生 variant，不自造 utility class
- 组件颜色通过 variant 控制，不通过 className 覆盖颜色

## UI 组件库

### 基础组件 (`components/ui/`)
| 组件 | 说明 |
|------|------|
| button | 按钮（primary, secondary, ghost, outline） |
| input / textarea | 输入框 |
| select | 选择器 |
| checkbox / switch | 复选框/开关 |
| radio-group | 单选组 |
| label | 表单标签 |
| card / glass-card | 卡片 / 玻璃卡片 |
| badge | 徽章 |
| avatar | 头像 |
| skeleton | 骨架屏 |
| empty | 空状态 |
| separator | 分隔线 |
| table | 表格 |
| data-table | 数据表格（带排序、分页） |
| dropdown-menu | 下拉菜单 |

### 弹层组件
| 组件 | 说明 |
|------|------|
| dialog | 对话框 |
| alert-dialog | 警告对话框 |
| sheet | 侧边面板（支持 top/right/bottom/left） |
| drawer | 抽屉（底部弹出） |
| popover | 弹出框 |
| tooltip | 提示框 |

### 布局组件
| 组件 | 说明 |
|------|------|
| scroll-area | 滚动区域 |
| pagination | 分页 |
| back-to-top | 返回顶部 |
| button-group | 按钮组 |

## 重要文件路径

- `styles/global.css` - Tailwind CSS 4 配置入口和全局样式
- `lib/auth.ts` - Better Auth 配置
- `lib/auth-guard.ts` - 权限守卫
- `lib/oss.ts` - OSS 存储工具
- `prisma/schema.prisma` - 数据库模型
- `generated/prisma/` - Prisma Client 生成目录（忽略）

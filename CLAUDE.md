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
│   ├── ui/                # 基础 UI 组件（Chen Serif 设计系统）
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

## UI 组件库

> **重要**: 所有 UI 组件**必须**遵循 Chen Serif 设计系统（Variant-driven Design）。

### 基础组件 (`components/ui/`)
| 组件 | 说明 |
|------|------|
| button | 按钮（primary, secondary, ghost, outline） |
| input / textarea | 输入框 |
| select | 选择器 |
| checkbox / switch | 复选框/开关 |
| radio-group | 单选组 |
| label | 表单标签 |
| card / glass-card | 卡片 |
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

### 排版组件 (`components/ui/typography/`)
| 组件 | 说明 |
|------|------|
| title | 标题（level 1-6） |
| text | 文本（primary, secondary, success, warning, danger） |
| paragraph | 段落 |
| link | 链接 |

### 布局组件
| 组件 | 说明 |
|------|------|
| scroll-area | 滚动区域 |
| pagination | 分页 |
| back-to-top | 返回顶部 |
| button-group | 按钮组 |

## 设计系统：Chen Serif

项目遵循 **Chen Serif 设计系统**（Variant-driven Design 方案），基于 Tailwind CSS v4 + shadcn/ui 理念构建。

### 核心理念

**Variant-driven Design**（变体驱动设计）：
- 组件通过 props 管理变体（`variant`、`size`），而非全局 CSS 类名
- `<Button variant="primary">` 而非 `<button className="btn btn-primary">`
- 样式定义在组件内部，使用 `class-variance-authority` (cva)

### 依赖安装

```bash
pnpm add class-variance-authority clsx tailwind-merge
```

### 样式合并工具

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 配色方案

在 `styles/global.css` 的 `@theme` 块中定义：

| 类别 | Token | 值 | 用途 |
|------|-------|-----|------|
| 背景 | `--color-bg` | `#050505` | 页面背景 |
| 文字 | `--color-fg` | `#ebebeb` | 主文字 |
| 品牌 | `--color-primary` | `#10b981` | 主强调色（翡翠绿） |
| | `--color-primary-h` | `#059669` | 主色 hover |
| | `--color-primary-fg` | `#050505` | 主色上的文字 |
| 卡片 | `--color-card` | `rgba(255,255,255,0.02)` | 卡片背景 |
| | `--color-card-hover` | `rgba(255,255,255,0.04)` | 卡片 hover |
| 表面 | `--color-surface` | `rgba(255,255,255,0.08)` | 次级背景 |
| | `--color-surface-h` | `rgba(255,255,255,0.12)` | 次级 hover |
| 次级文字 | `--color-muted` | `rgba(255,255,255,0.4)` | 次级文字 |
| | `--color-muted-h` | `rgba(255,255,255,0.6)` | 次级文字 hover |
| 边框 | `--color-border` | `rgba(255,255,255,0.08)` | 边框 |
| | `--color-border-h` | `rgba(255,255,255,0.15)` | 边框 hover |
| 语义-成功 | `--color-success` | `#10b981` | 成功状态 |
| 语义-警告 | `--color-warning` | `#f59e0b` | 警告状态 |
| 语义-错误 | `--color-error` | `#ef4444` | 错误状态 |
| 语义-信息 | `--color-info` | `#3b82f6` | 信息状态 |

### 字体体系

字体使用 jsDelivr CDN @fontsource，通过 `@font-face` 定义可变字体。

#### 字体 CSS 定义

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/inter-latin-wght-normal.woff2)
    format("woff2-variations");
}

@font-face {
  font-family: "Newsreader";
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/newsreader:vf@latest/newsreader-latin-wght-normal.woff2)
    format("woff2-variations");
}

@font-face {
  font-family: "Newsreader";
  font-style: italic;
  font-weight: 200 800;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/newsreader:vf@latest/newsreader-latin-wght-italic.woff2)
    format("woff2-variations");
}

@font-face {
  font-family: "Space Grotesk";
  font-style: normal;
  font-display: swap;
  font-weight: 300 700;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk:vf@latest/space-grotesk-latin-wght-normal.woff2)
    format("woff2-variations");
}
```

#### 字体 Token 定义

在 `styles/global.css` 的 `@theme` 块中注册：

```css
@theme {
  --font-serif: 'Newsreader', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-mono: 'Space Grotesk', monospace;
}
```

#### 字体用途

| 用途 | 字体 | Token | 字重范围 |
|------|------|-------|---------|
| 标题/强调 | Newsreader | `--font-serif` | 200-800 (可变) |
| 正文/UI | Inter | `--font-sans` | 100-900 (可变) |
| 代码/技术 | Space Grotesk | `--font-mono` | 300-700 (可变) |

#### 字体使用方式

```tsx
// 使用 Tailwind 类
<h1 className="font-serif text-h1">Newsreader 标题</h1>
<p className="font-sans text-base">Inter 正文字体</p>
<code className="font-mono text-sm">Space Grotesk 等宽</code>

// 使用字重和斜体
<p className="font-serif font-light italic">细体斜体 Newsreader</p>
<p className="font-sans font-medium">中等 Inter (500)</p>
```

### 圆角系统

| Tailwind 类 | 值 | 用途 |
|-------------|-----|------|
| `rounded-sm` | 8px | 小圆角 |
| `rounded-md` | 12px | 标准圆角 |
| `rounded-lg` | 16px | 大圆角 |
| `rounded-xl` | 20px | 特大圆角 |
| `rounded-full` | 9999px | 圆形 |

### 动效体系

| Token | 值 | 用途 |
|-------|-----|------|
| `--ease-smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` | 缓动函数 |
| `--duration-fast` | 150ms | 快 |
| `--duration-base` | 200ms | 标准 |
| `--duration-slow` | 300ms | 慢 |
| `--duration-slower` | 400ms | 更慢 |
| `--duration-slowest` | 600ms | 最慢 |

### 核心组件变体

#### Button

```typescript
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-[var(--duration-base)] ease-[var(--ease-smooth)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:    'bg-primary text-primary-fg hover:bg-primary-h hover:-translate-y-px active:scale-[0.98]',
        secondary:  'bg-surface text-fg border border-border hover:bg-surface-h',
        ghost:      'bg-transparent text-fg hover:bg-surface',
        outline:    'bg-transparent border border-border text-fg hover:border-border-h hover:bg-surface',
        destructive:'bg-error text-white hover:brightness-110 active:scale-[0.98]',
        link:       'bg-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm:   'h-8 px-3 text-xs',
        md:   'h-10 px-4',
        lg:   'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

**使用示例：**
```tsx
<Button variant="primary">新建文章</Button>
<Button variant="secondary">取消</Button>
<Button variant="ghost">了解更多</Button>
<Button variant="destructive">删除</Button>
<Button variant="primary" size="sm">小按钮</Button>
<Button variant="primary" loading>加载中</Button>
```

#### Badge

```typescript
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap border',
  {
    variants: {
      variant: {
        default:   'bg-surface text-fg border-border',
        primary:   'bg-primary/15 text-primary border-primary/30',
        success:   'bg-success/15 text-success border-success/30',
        warning:   'bg-warning/15 text-warning border-warning/30',
        error:     'bg-error/15 text-error border-error/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

### NiceModal 集成

Dialog、Alert、Drawer 组件通过 NiceModal 统一管理：

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

详细设计规范请参考 [docs/chen-serif-design-system.md](./docs/chen-serif-design-system.md)。

## 重要文件路径

- `styles/global.css` - Tailwind CSS 4 配置入口和全局样式
- `lib/auth.ts` - Better Auth 配置
- `lib/auth-guard.ts` - 权限守卫
- `lib/oss.ts` - OSS 存储工具
- `prisma/schema.prisma` - 数据库模型
- `generated/prisma/` - Prisma Client 生成目录（忽略）

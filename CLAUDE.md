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
│   ├── ui/                # 基础 UI 组件（遵循 Apple Human Interface）
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

> **重要**: 所有 UI 组件**必须**遵循 Apple Human Interface Guidelines 设计规范。

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

## 设计系统：Apple Human Interface

### 配色方案

**Light Mode**:
- `--bg-color`: #ffffff
- `--surface-color`: #f5f5f7
- `--surface-hover-color`: #e8e8ed
- `--border-color`: #d2d2d7
- `--accent-color`: #0071e3
- `--accent-hover-color`: #0077ed
- `--text-color`: #1d1d1f
- `--text-color-secondary`: #6e6e73
- `--text-color-tertiary`: #86868b

**Dark Mode**:
- `--bg-color`: #000000
- `--surface-color`: #1c1c1e
- `--surface-hover-color`: #2c2c2e
- `--border-color`: #38383a
- `--accent-color`: #0a84ff
- `--accent-hover-color`: #409cff
- `--text-color`: #f5f5f7
- `--text-color-secondary`: #98989d
- `--text-color-tertiary`: #86868b

### 语意化颜色

每种语意化颜色包含：主色 (`-color`)、hover色 (`-hover-color`)、背景色 (`-bg-color`)、边框色 (`-border-color`)

| 语义 | Light 主色 | Dark 主色 | 用途 |
|------|-----------|----------|------|
| success | #34c759 | #30d158 | 成功状态 |
| warning | #ff9500 | #ff9f0a | 警告状态 |
| error | #ff3b30 | #ff453a | 错误状态 |
| info | #007aff | #0a84ff | 信息状态 |

**使用示例**：
```tsx
// 文本颜色
<span className="text-success">成功</span>
<span className="text-warning">警告</span>
<span className="text-error">错误</span>
<span className="text-info">信息</span>

// 背景颜色
<div className="bg-success-bg border-success-border">成功提示</div>

// 按钮样式
<button className="bg-success hover:bg-success-hover">确认</button>
```

### 圆角系统
- `--radius-sm`: 8px
- `--radius-md`: 12px
- `--radius-lg`: 16px
- `--radius-xl`: 20px
- `--radius-full`: 9999px

### 阴影系统
- `--shadow-xs`: 0 1px 2px rgba(0, 0, 0, 0.04)
- `--shadow-sm`: 0 1px 3px rgba(0, 0, 0, 0.06)
- `--shadow-md`: 0 4px 6px rgba(0, 0, 0, 0.07)
- `--shadow-lg`: 0 10px 20px rgba(0, 0, 0, 0.08)
- `--shadow-xl`: 0 20px 40px rgba(0, 0, 0, 0.1)

### 过渡动画
- `--ease-apple`: cubic-bezier(0.25, 0.1, 0.25, 1) - Apple 标准缓动函数
- 标准过渡时长: `duration-200`

### 字体
- **Sans**: Inter / SF Pro Text / Helvetica Neue
- **Mono**: JetBrains Mono / SF Mono

### 组件样式指南

#### Button (按钮)
- 使用 `rounded-lg` (12px)
- `variant="primary"`: `bg-accent text-white`
- `variant="secondary"`: `border border-border bg-surface text-text`
- `variant="ghost"`: `bg-transparent text-text hover:bg-surface`
- `variant="outline"`: `border border-border bg-transparent text-text`
- Hover: `bg-accent-hover-color`
- Active: `scale-[0.98]`

#### Input (输入框)
- 使用 `rounded-lg` (12px)
- 背景: `bg-surface`
- 边框: `border border-border`
- Focus: `border-accent ring-2 ring-accent/20`
- Placeholder: `text-text-tertiary`
- Hover: `border-[var(--border-color)]`

#### Card (卡片)
- 使用 `rounded-xl` (20px)
- 背景: `bg-surface`
- 边框: `border border-border`
- 阴影: `shadow-sm`

#### Dialog (对话框)
- 使用 `rounded-xl` (20px)
- 背景: `bg-surface`
- 边框: `border border-border`
- 阴影: `shadow-xl`
- 遮罩: `bg-black/20 backdrop-blur-sm`

#### Table (表格)
- Header 边框: `border-b border-border`
- Row 边框: `border-b border-border`
- Row Hover: `bg-surface-hover`
- 单元格内边距: `p-2`

### 代码高亮 (Syntax Highlighting)

使用 `apple-prose` 类应用 Markdown 样式：

```tsx
<div className="apple-prose">
  {children}
</div>
```

代码块样式（在 `styles/global.css` 中）：
- Light: `--hljs-color: #24292f`, `--hljs-bg: #f6f8fa`
- Dark: `--hljs-color: #c9d1d9`, `--hljs-bg: #0d1117`

## 重要文件路径

- `styles/global.css` - Tailwind CSS 4 配置入口和全局样式
- `lib/auth.ts` - Better Auth 配置
- `lib/auth-guard.ts` - 权限守卫
- `lib/oss.ts` - OSS 存储工具
- `prisma/schema.prisma` - 数据库模型
- `generated/prisma/` - Prisma Client 生成目录（忽略）

# 前端 Monorepo 架构指南 (Frontend Monorepo Guide)

本文档旨在为 AI Agent 和开发者提供 `web/` 目录下前端 Monorepo 的详细架构说明。

## 1. 项目概览 (Overview)

本项目采用 **pnpm workspace** 管理前端应用和共享包。

- **根目录**: `web/`
- **包管理器**: `pnpm`
- **Node 版本**: `>= 20`

### 目录结构

```
web/
├── apps/
│   ├── fuxiaochen-admin/   # 后台管理系统 (React SPA)
│   └── fuxiaochen-portal/  # 门户网站 (Next.js SSR)
├── packages/
│   └── fuxiaochen-types/   # 共享 TypeScript 类型定义
├── package.json            # Workspace 脚本
└── pnpm-workspace.yaml     # Workspace 配置
```

---

## 2. 应用详解 (Applications)

### 2.1 Admin (`apps/fuxiaochen-admin`)

内容管理后台，用于管理博客、标签、分类、用户和更新日志。

- **技术栈**:
  - **核心**: React 19, Vite, TypeScript
  - **路由**: React Router v7
  - **UI 库**: Semi UI (`@douyinfe/semi-ui-19`)
  - **样式**: Tailwind CSS v4, Sass
  - **状态管理**: Zustand
  - **编辑器**: Bytemd (Markdown)
  - **HTTP**: Axios
- **架构模式**: Feature-based Architecture

#### 关键目录 (`apps/fuxiaochen-admin/src/`)

- **`api/`**: 后端 API 接口定义层，封装 Axios 请求。
  - `auth.ts`, `blog.ts`, `user.ts` 等。
- **`components/`**: 通用组件。
  - `bytemd-field/`: Markdown 编辑器封装。
  - `protect-route/`: 路由权限守卫。
- **`features/`**: **核心业务模块**。每个功能模块包含其独有的组件。
  - `blog/`: 博客管理 (发布、编辑、列表)。
  - `user/`: 用户管理。
  - 这使得业务逻辑高度内聚。
- **`stores/`**: Zustand 状态存储。
  - `use-user-store.ts`: 用户登录态管理。
- **`routes/`**: 页面级组件 (Page Components)，通常由 Router 引用。
- **`router.tsx`**: 路由配置文件。

#### 开发命令

- 启动：`pnpm dev:admin` (在 `web/` 目录下)
- 构建：`pnpm build:admin`

---

### 2.2 Portal (`apps/fuxiaochen-portal`)

面向公众的个人门户网站，展示博客文章、更新日志和个人介绍。

- **技术栈**:
  - **核心**: Next.js 16 (App Router), React 19
  - **样式**: Tailwind CSS v4 (配合 CSS Variables 实现主题)
  - **UI 库**: Shadcn UI (Radix UI + Tailwind), HugeIcons
  - **部署**: PM2, Next-Sitemap
- **设计风格**: **Cyberpunk / Futuristic**
  - 特色：霓虹光效 (Neon Glow)、故障艺术 (Glitch Effects)、毛玻璃 (Glassmorphism)。

#### 关键目录 (`apps/fuxiaochen-portal/`)

- **`app/`**: Next.js App Router 路由。
  - `blog/[slug]/`: 博客详情页。
  - `about/`: 关于我页面。
  - `layout.tsx`: 全局布局。
- **`components/`**:
  - **`cyberpunk/`**: **核心视觉组件**。
    - `glitch-hero.tsx`: 首页故障风 Hero 区域。
    - `neon-blog-card.tsx`: 霓虹风格博客卡片。
    - `neon-header.tsx`: 顶部导航。
  - **`ui/`**: Shadcn UI 基础组件 (Button, Card, Dialog 等)。
  - **`blog/`**: 博客内容渲染组件 (TableOfContents, BlogContent)。
- **`lib/`**: 工具库。
  - `request.ts`: Fetch 封装。
- **`styles/`**:
  - `global.css`: 定义了 Tailwind v4 的 CSS 变量和自定义动画 (`@theme`).

#### 开发命令

- 启动：`pnpm dev:portal` (在 `web/` 目录下)
- 构建：`pnpm build:portal`

---

## 3. 共享包 (Shared Packages)

### `packages/fuxiaochen-types`

存放前后端通用的 TypeScript 类型定义（DTOs, Models）。

- **引用方式**: `workspace:*`
- **主要文件**:
  - `blog.ts`: 博客文章结构定义。
  - `user.ts`: 用户信息结构定义。
  - `api/`: API 响应结构 (Response Wrappers)。

---

## 4. 常用任务指南 (Task Guide)

### 如果你要修改 API

1.  首先检查 `packages/fuxiaochen-types`，更新类型定义。
2.  更新 `apps/fuxiaochen-admin/src/api` 中的请求函数。
3.  如果涉及 Portal，更新 `apps/fuxiaochen-portal/lib/request.ts` 或相关 server actions。

### 如果你要添加新页面

- **Admin**:
  1.  在 `src/routes` 下创建页面组件。
  2.  在 `src/router.tsx` 中注册路由。
  3.  如果是新业务领域，考虑在 `src/features` 下创建新目录。
- **Portal**:
  1.  在 `app/` 下创建新目录和 `page.tsx`。
  2.  使用 `components/cyberpunk` 中的组件保持风格统一。

### 如果你要修改样式

- **Admin**: 主要修改 Tailwind 类或 `index.css`。UI 组件样式受 Semi UI 主题控制。
- **Portal**:
  - 全局主题变量在 `apps/fuxiaochen-portal/styles/global.css`。
  - Cyberpunk 特效通常在组件内部通过 Tailwind 类实现 (如 `shadow-[...]`, `animate-pulse` 等)。

## 5. 提交规范

项目强制执行 Conventional Commits 规范。

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式调整
- `refactor`: 重构
- `chore`: 构建/工具链变动

提交前会自动运行 ESLint 和 Prettier 检查。

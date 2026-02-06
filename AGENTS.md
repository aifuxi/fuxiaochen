# AGENTS.md

## 项目概览 (Project Overview)

`fuxiaochen` 是一个基于 Next.js 16.1 (App Router) 的个人博客/门户系统。
该项目集成了现代化的前端技术栈和后端 API 服务，旨在提供一个高性能、美观且易于管理的个人展示平台。

**主要技术栈：**

- **Framework**: Next.js 16.1.1 (React 19)
- **Database**: MySQL/MariaDB (via Prisma ORM)
- **Styling**: Tailwind CSS 4, Radix UI, Lucide React
- **Editor**: Bytemd (Markdown 编辑器)
- **State/Utils**: ahooks, date-fns, zod, react-hook-form, sonner
- **Data Fetching**: swr
- **Package Manager**: pnpm
- **Deployment**: PM2, Docker (Support implied)

## 构建与命令 (Build & Commands)

| 命令             | 说明                                           |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | 启动开发服务器                                 |
| `pnpm build`     | 构建生产版本 (standalone output)               |
| `pnpm start`     | 启动生产服务器                                 |
| `pnpm lint:fix`  | 运行 ESLint 检查并自动修复 ESLint 问题         |
| `pnpm format`    | 使用 Prettier 格式化代码                       |
| `pnpm db:dev`    | 运行 Prisma 迁移 (Dev)                         |
| `pnpm db:gen`    | 生成 Prisma Client (输出至 `generated/prisma`) |
| `pnpm db:seed`   | 填充数据库种子数据                             |
| `pnpm pm2:start` | 使用 PM2 启动应用                              |

## 代码规范 (Code Style)

项目遵循严格的代码规范，确保代码质量和一致性。

- **TypeScript**: 启用 `strict` 模式，目标版本 `ES2022`。
- **Linting**: ESLint 配置 (`eslint.config.mjs`) 集成了 Next.js, Prettier, TypeScript 规则。
- **Formatting**: Prettier (`.prettierrc.cjs`) 用于代码格式化。
- **Commits**: 使用 Commitlint 和 Conventional Commits 规范 (feat, fix, docs, style, refactor, etc.)。
- **Imports**: 使用绝对路径别名 `@/*` 引用项目根目录文件。
- **Styling**: Tailwind CSS 类名排序 (via `prettier-plugin-tailwindcss`)。
- **Naming Conventions**:
  - **Files**: Kebab Case (e.g., `my-file.ts`, `user-profile.tsx`).
  - **Components**: Pascal Case (e.g., `MyComponent`, `UserProfile`).
  - **Variables/Functions**: lowerCamelCase (e.g., `myVariable`, `fetchUserData`).

## 架构与目录 (Architecture & Directory)

### 核心目录结构

- **app/**: Next.js App Router 路由。
  - `(portal)/`: 前台页面 (Blog, About, Changelog)。
  - `(admin)/`: 后台管理页面 (优先使用 Client Components)。
- **components/**: UI 组件库。
  - `ui/`: 基础 UI 组件 (封装 Radix UI)。
  - `blog/`: 博客相关业务组件。
- **lib/**: 核心工具库。
  - `prisma.ts`: Prisma 数据库实例配置。
  - `utils.ts`: 通用工具函数。
- **prisma/**: 数据库 Schema (`schema.prisma`) 和迁移文件。
- **types/**: 全局 TypeScript 类型定义。

### Server Action 设计规范 (Interface-First)

项目采用接口优先 (Interface-First) 模式设计 Server Actions，以解耦业务逻辑与数据访问层。

1.  **Interface (`stores/<module>/interface.ts`)**:
    - 定义 Store 接口 (e.g., `IChangelogStore`)。
    - 声明 CRUD 及业务方法。
2.  **Implementation (`stores/<module>/store.ts`)**:
    - 实现 Store 接口。
    - 处理 Prisma 调用及数据转换。
    - 导出单例实例 (e.g., `changelogStore`)。
3.  **Action (`app/actions/<module>.ts`)**:
    - 标记 `'use server'`。
    - 调用 Store 实例方法。
    - 统一错误处理 (`try/catch`) 和返回格式 (`{ success, data, error }`)。
    - 负责缓存更新 (`revalidatePath`)。

### 数据流

- **General**: 发送请求优先使用 **Server Actions** (替代 API Routes)。
- **Portal**: 优先使用 Server Components，直接调用 Server Actions。
- **Admin**: Client Components 直接调用 Server Actions 进行数据交互。
- **Backend**: Server Actions 通过 Store Interface (`stores/**`) 访问数据库。
- **Validation**: 请求和表单提交使用 `zod` 进行数据校验。

## 安全 (Security)

- **认证与授权**: 使用 Better Auth 进行用户认证和会话管理 (`User`, `Session`, `Account` tables)。
- **环境变量**: 敏感信息 (数据库凭证，API Keys, Auth Secrets) 通过 `.env` 管理，禁止提交到版本控制。
- **API 安全**:
  - 所有写操作 API/Actions 应包含权限验证。
  - 文件上传使用预签名 URL (`upload/presign`) 模式，避免服务器直接处理大文件。
- **输入验证**: 使用 `zod` 对所有用户输入进行严格校验，防止注入攻击。
- **ORM 安全**: Prisma 自动处理 SQL 注入防护。

## 配置 (Configuration)

- **Environment**: 依赖 `.env` 文件配置数据库连接 (`DATABASE_URL`) 和其他服务密钥。
- **Next.js**: `next.config.mjs` 配置了 `standalone` 输出和图片域名白名单。
- **Tailwind**: `postcss.config.mjs` 和 Tailwind v4 配置。

## UI/UX 规范 (Liquid Glass Design System)

项目采用现代化 "Liquid Glass" (液态玻璃) 设计语言，强调通透感、层级深度和流动的交互体验。

### 核心设计理念

- **Glassmorphism**: 大量使用背景模糊 (`backdrop-blur`) 和半透明色彩，模拟玻璃质感。
- **Depth**: 通过柔和的阴影和多层背景叠加，创造自然的视觉深度。
- **Fluidity**: 所有的交互（如主题切换、悬停、导航）都应具备流畅的过渡效果。

### 核心配色 (Color Palette)

| 角色 | 变量名称 | Light Mode | Dark Mode |
| :--- | :--- | :--- | :--- |
| **Background** | `--bg-color` | `#f2f4f7` | `#121212` |
| **Accent** | `--accent-color` | `#0056b3` | `#1a6dbf` |
| **Primary Text** | `--text-color` | `#1d1d1f` | `#f5f5f7` |
| **Secondary Text** | `--text-color-secondary` | `#6e6e73` | `#8e8e93` |
| **Glass Background** | `--glass-bg` | `rgba(255, 255, 255, 0.95)` | `rgba(30, 30, 30, 0.9)` |
| **Glass Border** | `--glass-border` | `rgba(0, 0, 0, 0.05)` | `rgba(255, 255, 255, 0.1)` |

### 字体排印 (Typography)

- **Font Family**: 采用 Apple 风格的系统字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`。
- **Weights**: 正文使用 `Regular (400)`，重要标签使用 `Semibold (600)`，标题使用 `Bold (700)`。
- **Optimization**: 启用 `antialiased` 以获得更平滑的字体渲染。

### 组件设计准则

1.  **圆角 (Border Radius)**:
    *   卡片与大型容器: `1.5rem` (24px)。
    *   按钮与药丸标签: `9999px` (Full Circle)。
2.  **玻璃效 (Effects)**:
    *   悬浮面板必须包含 `backdrop-blur: 10px` 和 `saturate: 150%`。
    *   边框应使用极低透明度的配色 (`var(--glass-border)`)。
3.  **动画与过渡**:
    *   全局切换过度时间为 `0.3s ease-out`。
    *   卡片悬停效果：向上平移 `2px` 并增强阴影。
    *   页面入场效果：支持 `fade-in` 和 `slide-up (20px)` 动画。

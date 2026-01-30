# AGENTS.md

## 1. 项目概览 (Project Overview)

`fuxiaochen-portal` 是一个基于 Next.js 16.1 (App Router) 的个人博客/门户系统。
该项目集成了现代化的前端技术栈和后端 API 服务，旨在提供一个高性能、美观且易于管理的个人展示平台。

**主要技术栈:**

- **Framework**: Next.js 16.1.1 (React 19)
- **Database**: MySQL/MariaDB (via Prisma ORM)
- **Styling**: Tailwind CSS 4, Radix UI, Lucide React
- **Editor**: Bytemd (Markdown 编辑器)
- **State/Utils**: ahooks, date-fns, zod, react-hook-form, sonner
- **Deployment**: PM2, Docker (Support implied)

## 2. 构建与命令 (Build & Commands)

| 命令                | 说明                                           |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | 启动开发服务器                                 |
| `npm run build`     | 构建生产版本 (standalone output)               |
| `npm run start`     | 启动生产服务器                                 |
| `npm run lint`      | 运行 ESLint 检查                               |
| `npm run lint:fix`  | 自动修复 ESLint 问题                           |
| `npm run format`    | 使用 Prettier 格式化代码                       |
| `npm run db:dev`    | 运行 Prisma 迁移 (Dev)                         |
| `npm run db:gen`    | 生成 Prisma Client (输出至 `generated/prisma`) |
| `npm run db:seed`   | 填充数据库种子数据                             |
| `npm run pm2:start` | 使用 PM2 启动应用                              |

## 3. 代码规范 (Code Style)

项目遵循严格的代码规范，确保代码质量和一致性。

- **TypeScript**: 启用 `strict` 模式，目标版本 `ES2022`。
- **Linting**: ESLint 配置 (`eslint.config.mjs`) 集成了 Next.js, Prettier, TypeScript 规则。
- **Formatting**: Prettier (`.prettierrc.cjs`) 用于代码格式化。
- **Commits**: 使用 Commitlint 和 Conventional Commits 规范 (feat, fix, docs, style, refactor, etc.)。
- **Imports**: 使用绝对路径别名 `@/*` 引用项目根目录文件。
- **Styling**: Tailwind CSS 类名排序 (via `prettier-plugin-tailwindcss`)。

## 4. 架构与目录 (Architecture & Directory)

### 核心目录结构

- **app/**: Next.js App Router 路由。
  - `(portal)/`: 前台页面 (Blog, About, Changelog)。
  - `admin/`: 后台管理页面。
  - `api/v1/`: RESTful API 路由 (Blogs, Categories, Tags, Upload)。
- **components/**: UI 组件库。
  - `ui/`: 基础 UI 组件 (封装 Radix UI)。
  - `blog/`: 博客相关业务组件。
  - `cyberpunk/`: 特色主题组件。
- **lib/**: 核心工具库。
  - `api-client.ts`: 统一的 API 请求客户端 (Fetch wrapper with error handling)。
  - `prisma.ts`: Prisma 数据库实例配置。
  - `utils.ts`: 通用工具函数。
- **prisma/**: 数据库 Schema (`schema.prisma`) 和迁移文件。
- **types/**: 全局 TypeScript 类型定义。

### 数据流

- **Frontend**: 组件通过 `lib/api-client.ts` 发起请求 -> `app/api/**` 路由处理。
- **Backend**: API 路由通过 Prisma Client (`lib/prisma.ts`) 访问数据库。
- **Validation**: API 请求和表单提交使用 `zod` 进行数据校验。

## 5. 测试 (Testing)

_目前项目尚未集成自动化测试框架 (Jest/Vitest)。_

建议的测试实践:

- **Unit Testing**: 对 `lib/utils.ts` 和纯逻辑 hooks 添加单元测试。
- **Integration Testing**: 对关键 API 路由 (`app/api/**`) 进行集成测试。

## 6. 安全 (Security)

- **环境变量**: 敏感信息 (数据库凭证, API Keys) 通过 `.env` 管理，禁止提交到版本控制。
- **API 安全**:
  - 所有写操作 API 应包含权限验证 (Admin middleware 待确认/完善)。
  - 文件上传使用预签名 URL (`upload/presign`) 模式，避免服务器直接处理大文件。
- **输入验证**: 使用 `zod` 对所有用户输入进行严格校验，防止注入攻击。
- **ORM 安全**: Prisma 自动处理 SQL 注入防护。

## 7. 配置 (Configuration)

- **Environment**: 依赖 `.env` 文件配置数据库连接 (`DATABASE_URL`) 和其他服务密钥。
- **Next.js**: `next.config.mjs` 配置了 `standalone` 输出和图片域名白名单。
- **Tailwind**: `postcss.config.mjs` 和 Tailwind v4 配置。

## 8. UI/UX 规范 (Cyberpunk Design System)

项目采用沉浸式 Cyberpunk 风格，遵循以下设计规范。

### 核心配色 (Color Palette)

| 角色             | 变量名称               | HEX       | 用途                     |
| ---------------- | ---------------------- | --------- | ------------------------ |
| **Neon Cyan**    | `--color-neon-cyan`    | `#00ffff` | 主强调色，链接，按钮高亮 |
| **Neon Purple**  | `--color-neon-purple`  | `#7b61ff` | 次级强调色，引用，边框   |
| **Neon Magenta** | `--color-neon-magenta` | `#ff00ff` | 强调文本，代码块         |
| **Cyber Black**  | `--color-cyber-black`  | `#050510` | 页面背景                 |
| **Cyber Dark**   | `--color-cyber-dark`   | `#0d0d0d` | 面板深色背景             |
| **Cyber Gray**   | `--color-cyber-gray`   | `#1a1a2e` | 卡片背景，次级背景       |
| **Cyber Text**   | `--color-cyber-text`   | `#e0e0ff` | 正文文本                 |

### 字体排印 (Typography)

- **Display Font**: `Orbitron` (用于标题 h1-h6) - 科技感，几何风格。
- **Body Font**: `Exo 2` (用于正文) - 易读性与未来感兼备。
- **Letter Spacing**: 标题和按钮常使用宽字间距 (`tracking-widest`, `tracking-[0.5em]`)。
- **Uppercase**: 关键标签和按钮文字通常使用全大写 (`uppercase`)。

### 组件样式 (Component Styles)

#### 1. 玻璃拟态 (Glassmorphism)

使用深色玻璃效果构建面板和卡片：

```css
.glass-panel {
  background: rgba(13, 13, 13, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### 2. 霓虹光效 (Neon Glow)

通过 `text-shadow` 和 `box-shadow` 模拟发光：

- **Text Glow**: `text-shadow: 0 0 5px var(--color-neon-cyan), 0 0 10px var(--color-neon-cyan);`
- **Box Glow**: `box-shadow: 0 0 5px var(--color-neon-cyan), inset 0 0 5px var(--color-neon-cyan);`
- **Hover Effect**: 悬停时增强光晕扩散范围 (e.g., `shadow-[0_0_40px_rgba(0,255,255,0.6)]`)。

#### 3. 装饰元素

- **网格背景**: 使用线性渐变创建赛博空间网格背景。
- **Glitch 效果**: 关键标题使用 CSS 动画实现故障抖动效果。
- **边框**: 细微的半透明边框 (`border-white/5`)，悬停时变亮 (`border-neon-cyan/50`)。

### 交互规范 (Interaction)

- **Hover States**: 所有可交互元素必须有光效或颜色变化反馈，过渡时间 `duration-300` 或 `duration-500`。
- **Buttons**:
  - 主要按钮: 霓虹边框 + 背景，悬停填充霓虹色。
  - 次要按钮: 半透明边框，悬停变亮。
- **Cursor**: 保持默认光标或使用自定义准星光标 (如有)。

### 交付检查 (Pre-Delivery Checklist)

1. [ ] **Theme**: 确保背景色为 `#050510` (Cyber Black)，而非纯黑。
2. [ ] **Fonts**: 标题必须使用 `Orbitron`，正文使用 `Exo 2`。
3. [ ] **Contrast**: 检查霓虹色文字在深色背景上的可读性。
4. [ ] **Effects**: 确保 Glitch 和光晕动画不影响页面性能 (使用 `transform`, `opacity`)。
5. [ ] **Responsive**: 移动端适配时注意大号标题 (`text-9xl`) 的缩放。

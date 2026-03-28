# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人技术博客（付小晨的个人博客），展示前端开发技术探索与学习心得。

## 常用命令

### 开发
- `bun dev` - 启动开发服务器
- `bun run build` - 构建生产版本
- `bun start` - 启动生产服务器

### PM2 生产部署
- `bun pm2:start` - 启动生产服务器
- `bun pm2:stop` - 停止生产服务器
- `bun pm2:restart` - 重启生产服务器
- `bun pm2:logs` - 查看日志
- `bun pm2:status` - 查看状态

### 代码质量
- `bun lint` - ESLint 检查
- `bun lint:fix` - ESLint 检查并自动修复
- `bun format` - Prettier 格式化代码

### Git 提交
- `bun commit` - 使用 Commitizen 提交（遵循 Conventional Commits）
- `bun commit:retry` - 重试失败的提交

## 技术栈

- **框架**: Next.js 16.2.1 (App Router) + React 19.2.4
- **语言**: TypeScript 5.9.3（严格模式）
- **样式**: Tailwind CSS 4 + `@base-ui/react` + shadcn 风格组件
- **组件库文档**: https://base-ui.com/llms.txt
- **包管理器**: bun
- **设计系统**: Chen Serif（深色模式 + 翡翠绿强调色 #10b981）

### 字体系统

- `--font-sans` (Inter) - 正文
- `--font-mono` (Space Grotesk) - 技术标签/代码
- `--font-serif` (Newsreader) - 标题

## 目录结构

```
├── app/
│   ├── layout.tsx              # 根布局（CmsLayout）
│   ├── (public)/               # 公开页面（Navbar + Footer）
│   │   ├── layout.tsx          # 公开布局
│   │   ├── page.tsx            # 首页
│   │   ├── articles/           # 文章列表
│   │   ├── article/[slug]/     # 文章详情
│   │   ├── about/              # 关于页面
│   │   ├── changelog/          # 更新日志
│   │   ├── friends/            # 友链页面
│   │   └── design-system/      # 设计系统文档
│   └── cms/                    # CMS 管理后台（Sidebar 布局）
│       ├── layout.tsx          # CMS 布局
│       ├── dashboard/          # 仪表盘
│       ├── articles/          # 文章管理
│       ├── categories/        # 分类管理
│       ├── tags/              # 标签管理
│       ├── users/             # 用户管理
│       └── settings/          # 系统设置
├── components/ui/              # shadcn 风格 UI 组件（kebab-case）
├── components/dashboard/        # CMS 专用组件
├── components/navbar.tsx       # 公开导航栏
├── constants/                  # 站点元信息
├── hooks/                      # React hooks（如 useIsMobile）
├── lib/utils.ts                # cn() 工具函数
├── styles/
│   └── global.css              # Tailwind 4 CSS 配置入口
└── public/                     # 静态资源
```

## 路由架构

- `app/(public)/` - 公开页面，使用 Navbar + Footer 布局
- `app/cms/` - CMS 管理后台，使用固定 Sidebar 布局
- 根 `app/layout.tsx` 将所有路由包裹在 `CmsLayout` 中

## 代码规范

### 命名约定
- 文件: `kebab-case`
- 组件: `PascalCase`
- 变量/函数: `lowerCamelCase`

### 类型导入
- 必须使用 `type` 关键字: `import type { SomeType } from '...'`
- 风格: `inline-type-imports`

### ESLint 配置
- Flat config 格式 (`eslint.config.mjs`)
- 文件命名强制 `KEBAB_CASE`（在 app/、components/、constants/ 等目录）
- Tailwind 类检查通过 `styles/global.css` 入口
- 运行 `bun lint` 检查问题

## 样式系统

### Tailwind CSS 4
- CSS-based 配置（`@tailwindcss/postcss`）
- 主题定义在 [styles/global.css](styles/global.css)
- 深色模式默认启用（`.dark` 类始终存在于 html 元素）

### 设计系统组件变体
- **Card**: `default` | `glass` | `shimmer` | `spotlight`
- **Avatar**: `sm` | `md` | `lg` | `xl`
- **Input**: `default` | `search` | `error`
- **Button**: 支持 `variant`（如 `primary-glow`）和 `size` 属性

### shadcn 组件
- 位于 [components/ui/](components/ui/)
- 使用 `cn()` 合并类名
- 接受 `className` prop 自定义样式

## Commit 规范

遵循 [Angular Conventional Commits](https://www.conventionalcommits.org/)，优先使用中文。

格式: `<type>(<scope>): <description>`

**常用 type:**
- `feat` - 新功能
- `fix` - 修复 bug
- `docs` - 文档更改
- `refactor` - 重构
- `chore` - 构建/工具变动


<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

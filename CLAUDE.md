# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个个人技术博客网站（付小晨的个人博客），展示前端开发技术探索与学习心得。

## 常用命令

### 开发
- `bun dev` - 启动开发服务器
- `bun run build` - 构建生产版本
- `bun start` - 启动生产服务器

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
- **设计系统**: Chen Serif（深色模式 + 翡翠绿强调色）

### 字体系统

项目使用三种字体变量：
- `--font-sans` (Inter) - 正文
- `--font-mono` (Space Grotesk) - 技术标签/代码
- `--font-serif` (Newsreader) - 标题

## 目录结构

```
├── app/
│   ├── layout.tsx          # 根布局（字体配置、TooltipProvider）
│   └── design-system/     # 设计系统文档页面
├── components/ui/          # shadcn 风格 UI 组件（kebab-case 命名）
├── constants/              # 站点元信息（邮箱、社交链接等）
├── hooks/                  # React hooks
├── lib/utils.ts            # cn() 工具函数
├── styles/
│   └── global.css          # Tailwind 4 CSS 配置入口（设计系统变量定义）
└── public/                 # 静态资源
```

## 代码规范

### 命名约定
- 文件: `kebab-case` (如 `blog-list.tsx`)
- 组件: `PascalCase` (如 `BlogList`)
- 变量/函数: `lowerCamelCase` (如 `fetchBlogData`)

### 类型导入
- 类型定义必须使用 `type` 关键字: `import type { SomeType } from '...'`
- 启用 `inline-type-imports` 风格修复

### ESLint 配置要点
- 使用 flat config 格式 (`eslint.config.mjs`)
- 启用 TypeScript 项目服务 (`projectService: true`)
- Tailwind CSS 类检查通过 `@/styles/global.css` 入口
- 文件命名强制 `KEBAB_CASE`
- 运行 `bun lint` 检查问题

## 样式系统

### Tailwind CSS 4
- 使用 CSS-based 配置（`@tailwindcss/postcss`）
- 主题定义在 [styles/global.css](styles/global.css)
- **深色模式默认启用**（`.dark` 类始终存在于 html 元素）

### 设计系统组件变体
- **Card**: `default` | `glass` | `shimmer` | `spotlight`
- **Avatar**: `sm` | `md` | `lg` | `xl`（支持 `ring` 属性）
- **Input**: `default` | `search` | `error`

### shadcn 组件
- 组件位于 [components/ui/](components/ui/)
- 使用 `cn()` 工具函数合并类名
- 组件接受 `className` prop 自定义样式

## Commit 规范

所有 commit 必须遵循 [Angular Conventional Commits](https://www.conventionalcommits.org/) 规范，**优先使用中文**描述。

格式: `<type>(<scope>): <description>`

**常用 type:**
- `feat` - 新功能
- `fix` - 修复 bug
- `docs` - 文档更改
- `style` - 代码格式（不影响功能）
- `refactor` - 重构
- `perf` - 性能优化
- `test` - 测试
- `chore` - 构建/工具变动

**示例:**
```
feat(images): 允许加载任意来源的图片
fix(auth): 修复令牌过期问题
docs(readme): 更新项目说明
```

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
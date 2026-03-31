# AGENTS.md

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
/* inter-latin-wght-normal */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url(https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5.2.8/files/inter-latin-wght-normal.woff2) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}

/* newsreader-latin-wght-normal */
@font-face {
  font-family: 'Newsreader';
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url(https://cdn.jsdelivr.net/npm/@fontsource-variable/newsreader@5.2.10/files/newsreader-latin-wght-normal.woff2) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}

/* space-grotesk-latin-wght-normal */
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-display: swap;
  font-weight: 300 700;
  src: url(https://cdn.jsdelivr.net/npm/@fontsource-variable/space-grotesk@5.2.10/files/space-grotesk-latin-wght-normal.woff2) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
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

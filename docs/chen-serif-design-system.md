# Chen Serif 设计系统 — Variant-driven Design 方案

> 基于 Tailwind CSS v4 + shadcn/ui 理念的设计系统
> 版本: v1.0 | 更新日期: 2026-03-29

---

## 核心理念

**Variant-driven Design**（变体驱动设计）是 shadcn/ui 的核心思想：

| 对比维度 | Utility-class 方案 | Variant-driven 方案 |
|----------|-------------------|-------------------|
| **抽象单元** | `.btn`, `.card` 是 CSS 类 | `<Button>`, `<Card>` 是 React 组件 |
| **变体管理** | 类名组合 `btn btn-primary` | 组件 props: `variant="primary"` |
| **样式定义位置** | 全局 CSS `@utility` | 组件文件内部（cva） |
| **复用方式** | 复制类名 | 继承组件 + 扩展变体 |
| **维护方式** | 改 CSS，全局生效 | 改组件，影响所有调用点 |

---

## 1. 设计 Token 体系

### 1.1 Token 注册

在 `styles/global.css` 的 `@theme` 块中注册所有设计 token：

```css
@import "tailwindcss";

@theme {
  /* === 颜色 === */
  --color-bg:             #050505;
  --color-fg:             #ebebeb;
  --color-primary:        #10b981;
  --color-primary-h:      #059669;
  --color-primary-fg:     #050505;

  --color-card:           rgba(255,255,255,0.02);
  --color-card-hover:     rgba(255,255,255,0.04);
  --color-surface:        rgba(255,255,255,0.08);
  --color-surface-h:      rgba(255,255,255,0.12);
  --color-muted:          rgba(255,255,255,0.4);
  --color-muted-h:        rgba(255,255,255,0.6);
  --color-border:         rgba(255,255,255,0.08);
  --color-border-h:       rgba(255,255,255,0.15);

  --color-success:        #10b981;
  --color-warning:        #f59e0b;
  --color-error:          #ef4444;
  --color-info:           #3b82f6;

  /* === 字体 === */
  --font-serif:           'Newsreader', Georgia, serif;
  --font-sans:            'Inter', -apple-system, sans-serif;
  --font-mono:            'Space Grotesk', monospace;

  /* === 字号 === */
  --text-hero:            100px;
  --text-h1:              64px;
  --text-h2:              48px;
  --text-h3:              24px;
  --text-lg:              18px;
  --text-base:            16px;
  --text-sm:              14px;
  --text-xs:              12px;

  /* === 圆角 === */
  --radius-sm:            8px;
  --radius:               12px;
  --radius-lg:            16px;
  --radius-xl:            20px;
  --radius-full:          9999px;

  /* === 阴影 === */
  --shadow-xs:            0 1px 2px rgba(0,0,0,0.3);
  --shadow-sm:            0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:            0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg:            0 10px 15px rgba(0,0,0,0.5);
  --shadow-xl:            0 20px 25px rgba(0,0,0,0.5);

  /* === 动效 === */
  --ease-smooth:          cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast:        150ms;
  --duration-base:        200ms;
  --duration-slow:        300ms;
  --duration-slower:      400ms;
  --duration-slowest:     600ms;
}
```

### 1.2 颜色体系

| 类别 | Token | Hex / 值 | 用途 |
|------|-------|---------|------|
| **背景** | `--color-bg` | `#050505` | 页面背景 |
| **文字** | `--color-fg` | `#ebebeb` | 主文字 |
| **品牌** | `--color-primary` | `#10b981` | 主强调色（翡翠绿） |
| | `--color-primary-h` | `#059669` | 主色 hover |
| | `--color-primary-fg` | `#050505` | 主色上的文字 |
| **卡片** | `--color-card` | `rgba(255,255,255,0.02)` | 卡片背景 |
| | `--color-card-hover` | `rgba(255,255,255,0.04)` | 卡片 hover |
| **表面** | `--color-surface` | `rgba(255,255,255,0.08)` | 次级背景 |
| | `--color-surface-h` | `rgba(255,255,255,0.12)` | 次级 hover |
| **次级文字** | `--color-muted` | `rgba(255,255,255,0.4)` | 次级文字 |
| | `--color-muted-h` | `rgba(255,255,255,0.6)` | 次级文字 hover |
| **边框** | `--color-border` | `rgba(255,255,255,0.08)` | 边框 |
| | `--color-border-h` | `rgba(255,255,255,0.15)` | 边框 hover |
| **语义-成功** | `--color-success` | `#10b981` | 成功状态 |
| **语义-警告** | `--color-warning` | `#f59e0b` | 警告状态 |
| **语义-错误** | `--color-error` | `#ef4444` | 错误状态 |
| **语义-信息** | `--color-info` | `#3b82f6` | 信息状态 |

### 1.3 字体体系

字体使用 jsDelivr CDN 的 @fontsource 包，通过 `@font-face` 定义可变字体。

#### 字体 CSS 定义

```css
/* ======================================
   Font Faces (CDN Variable Fonts)
   ====================================== */
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/inter-latin-wght-normal.woff2)
    format("woff2-variations");
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
    U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212,
    U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "Newsreader";
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/newsreader:vf@latest/newsreader-latin-wght-normal.woff2)
    format("woff2-variations");
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
    U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212,
    U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "Newsreader";
  font-style: italic;
  font-display: swap;
  font-weight: 200 800;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/newsreader:vf@latest/newsreader-latin-wght-italic.woff2)
    format("woff2-variations");
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
    U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212,
    U+2215, U+FEFF, U+FFFD;
}

@font-face {
  font-family: "Space Grotesk";
  font-style: normal;
  font-display: swap;
  font-weight: 300 700;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk:vf@latest/space-grotesk-latin-wght-normal.woff2)
    format("woff2-variations");
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
    U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212,
    U+2215, U+FEFF, U+FFFD;
}
```

#### 字体 Token 定义

在 `styles/global.css` 的 `@theme` 块中注册：

```css
@theme {
  /* === 字体 === */
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

// 单独使用字重（通过 CSS 字重范围）
<p className="font-serif font-light">细体 Newsreader (200)</p>
<p className="font-serif font-extrabold">特粗体 Newsreader (800)</p>
<p className="font-sans font-medium">中等 Inter (500)</p>
<p className="font-mono font-normal">常规 Space Grotesk (400)</p>

// 使用斜体（仅 Newsreader 支持）
<p className="font-serif italic">Newsreader 斜体</p>
```

#### 字体安装方式对比

| 方式 | 命令 | 适用场景 |
|------|------|---------|
| **CDN @fontsource**（推荐） | 无需安装，使用 CDN URL | 快速启动、生产环境 |
| npm 包 | `pnpm add @fontsource-variable/newsreader` | 需要本地化字体、离线使用 |

### 1.4 间距与圆角体系

> 直接使用 Tailwind CSS 原生类名，无需自定义 token。

**间距**

| Tailwind 类 | 值 | 用途 |
|-------------|-----|------|
| `gap-1` / `p-1` / `m-1` | 4px | 紧凑间距 |
| `gap-2` / `p-2` / `m-2` | 8px | 小间距 |
| `gap-3` / `p-3` / `m-3` | 12px | 中间距 |
| `gap-4` / `p-4` / `m-4` | 16px | 标准间距 |
| `gap-6` / `p-6` / `m-6` | 24px | 大间距 |
| `gap-8` / `p-8` / `m-8` | 32px | 更大间距 |
| `gap-12` / `p-12` / `m-12` | 48px | 最大间距 |

**圆角**

| Tailwind 类 | 值 | 用途 |
|-------------|-----|------|
| `rounded-sm` | 8px | 小圆角 |
| `rounded-md` | 12px | 标准圆角 |
| `rounded-lg` | 16px | 大圆角 |
| `rounded-xl` | 20px | 特大圆角 |
| `rounded-full` | 9999px | 圆形 |

**组件示例映射**（曾用自定义类名 → 现用 Tailwind 类名）：

| 曾用类名 | Tailwind 类名 | 值 |
|----------|---------------|-----|
| `px-md` | `px-3` | 12px |
| `px-lg` | `px-4` | 16px |
| `px-xl` | `px-6` | 24px |
| `px-sm` | `px-2` | 8px |
| `gap-md` | `gap-3` | 12px |
| `gap-lg` | `gap-4` | 16px |
| `gap-sm` | `gap-2` | 8px |
| `py-md` | `py-3` | 12px |
| `p-xl` | `p-6` | 24px |
| `pb-xl` / `pt-xl` | `pb-6` / `pt-6` | 24px |
| `left-md` | `left-3` | 12px |
| `rounded-[var(--radius)]` | `rounded-md` | 12px |
| `rounded-[var(--radius-sm)]` | `rounded-sm` | 8px |
| `rounded-[var(--radius-lg)]` | `rounded-lg` | 16px |
| `rounded-[var(--radius-xl)]` | `rounded-xl` | 20px |

### 1.5 动效体系

| 类别 | Token | 值 |
|------|-------|-----|
| **缓动** | `--ease-smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **时长-快** | `--duration-fast` | 150ms |
| **时长-标准** | `--duration-base` | 200ms |
| **时长-慢** | `--duration-slow` | 300ms |
| **时长-更慢** | `--duration-slower` | 400ms |
| **时长-最慢** | `--duration-slowest` | 600ms |

---

## 2. Variant 定义模式

### 2.1 依赖安装

```bash
pnpm add class-variance-authority clsx tailwind-merge
pnpm add -D @types/node
```

### 2.2 样式合并工具

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2.3 变体分类

| 类型 | 说明 | 示例 |
|------|------|------|
| `variant` | 视觉样式变体 | `primary`, `secondary`, `ghost` |
| `size` | 尺寸变体 | `sm`, `md`, `lg`, `icon` |
| `state` | 状态变体 | `loading`, `disabled`（通常用原生属性） |

---

## 3. 核心组件 Variant 矩阵

### 3.1 Button

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

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
      variant: 'md',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**使用示例：**

```tsx
<Button variant="primary">新建文章</Button>
<Button variant="secondary">取消</Button>
<Button variant="ghost">了解更多</Button>
<Button variant="outline">查看全部</Button>
<Button variant="destructive">删除</Button>
<Button variant="link">查看详情</Button>
<Button variant="primary" size="sm">小按钮</Button>
<Button variant="primary" size="icon"><Plus className="w-4 h-4" /></Button>
<Button variant="primary" loading>加载中</Button>
<Button variant="primary" disabled>禁用</Button>
```

### 3.2 Input

```typescript
// components/ui/input.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full bg-surface border border-border rounded-md px-3 py-[10px] text-sm text-fg placeholder:text-muted transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)] focus:outline-none',
  {
    variants: {
      variant: {
        default: 'focus:border-primary focus:ring-2 focus:ring-primary/20',
        error:   'border-error focus:border-error focus:ring-error/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <input
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
```

**使用示例：**

```tsx
<Input placeholder="输入文章标题" />
<Input variant="error" placeholder="错误输入" />
<Input disabled placeholder="禁用状态" />

{/* 带图标的 Input */}
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
  <Input className="pl-10" placeholder="搜索..." />
</div>
```

### 3.3 Card

```typescript
// components/ui/card.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg border border-border bg-card p-6 transition-all duration-[var(--duration-base)] ease-[var(--ease-smooth)]',
  {
    variants: {
      variant: {
        default:   'hover:border-border-h hover:-translate-y-0.5 hover:shadow-lg',
        glass:      'bg-card/80 backdrop-blur-md hover:border-border-h',
        shimmer:    'relative overflow-hidden',
        spotlight:  'relative overflow-hidden',
      },
      interactive: {
        true: 'cursor-pointer',
      }
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, interactive, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6 border-b border-border', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-serif text-h3 leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-6', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent, cardVariants };
```

**使用示例：**

```tsx
<Card>
  <CardHeader>
    <CardTitle>文章标题</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted">这是卡片内容描述。</p>
  </CardContent>
</Card>

<Card variant="glass">玻璃卡片</Card>

<Card variant="shimmer" className="[&::after]:opacity-0 hover:[&::after]:opacity-100">
  流光卡片
</Card>

<Card variant="spotlight" style={{ '--x': '50%', '--y': '50%' } as React.CSSProperties}>
  聚光灯卡片
</Card>
```

### 3.4 Badge

```typescript
// components/ui/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

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

// 状态徽章（带点）
const statusBadgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium',
  {
    variants: {
      status: {
        published: 'bg-success/15 text-success',
        draft:     'bg-warning/15 text-warning',
        deleted:   'bg-error/15 text-error',
      }
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

// 状态徽章组件
export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, ...props }, ref) => {
    return (
      <span
        className={cn(statusBadgeVariants({ status, className }))}
        ref={ref}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {props.children}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { Badge, StatusBadge, badgeVariants, statusBadgeVariants };
```

**使用示例：**

```tsx
<Badge variant="default">标签</Badge>
<Badge variant="primary">已发布</Badge>
<Badge variant="success">成功</Badge>
<Badge variant="warning">警告</Badge>
<Badge variant="error">错误</Badge>

{/* 带点的状态徽章 */}
<StatusBadge status="published">已发布</StatusBadge>
<StatusBadge status="draft">草稿</StatusBadge>
<StatusBadge status="deleted">已删除</StatusBadge>
```

### 3.5 NavItem

```typescript
// components/ui/nav-item.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItemVariants = cva(
  'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-[var(--duration-fast)]',
  {
    variants: {
      active: {
        true:  'bg-primary/10 text-primary border-l-2 border-primary',
        false: 'text-muted hover:bg-surface hover:text-fg',
      }
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface NavItemProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof navItemVariants> {
  href: string;
}

const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  ({ className, active, href, ...props }, ref) => {
    return (
      <Link
        href={href}
        className={cn(navItemVariants({ active, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NavItem.displayName = 'NavItem';

export { NavItem, navItemVariants };
```

**使用示例：**

```tsx
<NavItem href="/dashboard">仪表盘</NavItem>
<NavItem href="/articles" active>文章</NavItem>
```

### 3.6 PageBtn (分页按钮)

```typescript
// components/ui/pagination.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const pageBtnVariants = cva(
  'min-w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-all duration-[var(--duration-base)] ease-[var(--ease-smooth)]',
  {
    variants: {
      variant: {
        default: 'bg-transparent border border-border text-fg hover:bg-surface hover:border-border-h',
        active:  'bg-fg text-bg border-fg',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface PageBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pageBtnVariants> {}

const PageBtn = React.forwardRef<HTMLButtonElement, PageBtnProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        className={cn(pageBtnVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
PageBtn.displayName = 'PageBtn';

export { PageBtn, pageBtnVariants };
```

**使用示例：**

```tsx
<div className="flex items-center gap-2">
  <PageBtn variant="default">1</PageBtn>
  <PageBtn variant="active">2</PageBtn>
  <PageBtn variant="default">3</PageBtn>
  <span className="px-2 text-muted">...</span>
  <PageBtn variant="default">10</PageBtn>
</div>
```

---

## 4. 与 NiceModal 的集成

```typescript
// components/ui/dialog.tsx
import NiceModal from '@ebay/nice-modal-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

const dialogVariants = cva(
  'fixed inset-0 z-modal flex items-center justify-center p-6',
  {
    variants: {
      visible: {
        true:  'opacity-100 visible',
        false: 'opacity-0 invisible',
      }
    }
  }
);

const dialogContentVariants = cva(
  'relative bg-card border border-border rounded-lg w-full max-w-lg transform transition-all duration-[var(--duration-base)]',
  {
    variants: {
      visible: {
        true:  'scale-100 translate-y-0',
        false: 'scale-95 translate-y-4',
      }
    }
  }
);

export interface DialogProps {
  id: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Dialog = NiceModal.create(({ id, title, children, footer }: DialogProps) => {
  const modal = NiceModal.useModal(id);

  return (
    <>
      {/* 遮罩 */}
      <div
        className={cn(
          'absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-[var(--duration-base)]',
          modal.visible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => modal.remove()}
      />

      {/* 对话框 */}
      <div className={cn(dialogContentVariants({ visible: modal.visible }))}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="font-serif text-h3">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => modal.remove()}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 p-6 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </>
  );
});

export { Dialog };

// 使用
NiceModal.show(Dialog, {
  id: 'delete-confirm',
  title: '确认删除',
  footer: (
    <>
      <Button variant="secondary" onClick={() => NiceModal.remove('delete-confirm')}>
        取消
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        确认删除
      </Button>
    </>
  )
});
```

---

## 5. 组件文件结构

```
components/
├── ui/                          # 基础 UI 组件（Variant-driven）
│   ├── button.tsx               # 按钮
│   ├── input.tsx                # 输入框
│   ├── textarea.tsx             # 多行文本
│   ├── card.tsx                 # 卡片
│   ├── badge.tsx                # 徽章
│   ├── avatar.tsx               # 头像
│   ├── separator.tsx            # 分隔线
│   ├── skeleton.tsx             # 骨架屏
│   ├── table.tsx                # 表格
│   ├── tabs.tsx                 # 标签页
│   ├── dropdown-menu.tsx         # 下拉菜单
│   ├── dialog.tsx               # 对话框（NiceModal 封装）
│   ├── sheet.tsx                # 侧边面板
│   ├── tooltip.tsx              # 提示框
│   └── pagination.tsx           # 分页
│
├── form/                        # 表单相关组件
│   ├── form.tsx                 # 表单封装
│   ├── form-field.tsx           # 表单字段
│   ├── checkbox.tsx             # 复选框
│   ├── radio.tsx                # 单选框
│   ├── switch.tsx               # 开关
│   ├── select.tsx               # 选择器
│   └── label.tsx                # 标签
│
├── layout/                      # 布局组件
│   ├── header.tsx               # 顶部导航
│   ├── footer.tsx               # 底部
│   ├── sidebar.tsx              # 侧边栏
│   └── container.tsx            # 容器
│
├── blog/                        # 博客业务组件
│   ├── article-card.tsx         # 文章卡片
│   ├── article-list.tsx         # 文章列表
│   └── toc.tsx                  # 目录
│
└── admin/                       # 管理后台组件
    ├── data-table.tsx           # 数据表格
    ├── stat-card.tsx            # 统计卡片
    └── activity-item.tsx        # 活动项
```

---

## 6. 落地步骤

```
Phase 1: 基础设施
├── 1. 安装依赖: pnpm add class-variance-authority clsx tailwind-merge
├── 2. 配置 @theme 设计 token (styles/global.css)
├── 3. 建立 lib/utils.ts (cn 函数)
└── 4. 实现基础组件: Button, Input, Badge

Phase 2: 核心组件
├── 1. Card, Avatar, Separator, Skeleton
├── 2. Form 相关: Label, Checkbox, Radio, Switch, Select
├── 3. Dialog, Sheet, Tooltip (NiceModal 封装)
└── 4. Pagination, Tabs

Phase 3: 布局与业务组件
├── 1. Header, Footer, Sidebar
├── 2. Article Card, Article List
├── 3. Admin DataTable, StatCard
└── 4. 清理废弃样式文件
```

---

## 7. 命名约定

| 规则 | 示例 |
|------|------|
| **组件文件** | `PascalCase.tsx` — `Button.tsx`, `DataTable.tsx` |
| **变体值** | `kebab-case` — `variant="destructive"`, `size="sm"` |
| **Props 接口** | `ComponentNameProps` — `ButtonProps`, `CardProps` |
| **变体定义** | `componentVariants` — `buttonVariants`, `cardVariants` |
| **样式合并** | 使用 `cn()` (clsx + tailwind-merge) |

---

## 8. 设计规范摘要

### 8.1 颜色速查

| 用途 | Tailwind 类 | CSS Token |
|------|-------------|-----------|
| 背景 | `bg-bg` | `--color-bg` |
| 文字 | `text-fg` | `--color-fg` |
| 主色 | `bg-primary` | `--color-primary` |
| 次级背景 | `bg-surface` | `--color-surface` |
| 次级文字 | `text-muted` | `--color-muted` |
| 边框 | `border-border` | `--color-border` |
| 成功 | `bg-success` | `--color-success` |
| 警告 | `bg-warning` | `--color-warning` |
| 错误 | `bg-error` | `--color-error` |

### 8.2 字体速查

| 用途 | Tailwind 类 | CSS Token | 可变字重 |
|------|-------------|-----------|---------|
| 衬线标题 | `font-serif` | `--font-serif` | 200-800 |
| 无衬线正文 | `font-sans` | `--font-sans` | 100-900 |
| 等宽代码 | `font-mono` | `--font-mono` | 300-700 |

### 8.3 CDN 字体 URL

| 字体 | Woff2 URL |
|------|----------|
| Inter | `https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/inter-latin-wght-normal.woff2` |
| Newsreader | `https://cdn.jsdelivr.net/fontsource/fonts/newsreader:vf@latest/newsreader-latin-wght-normal.woff2` |
| Newsreader Italic | `https://cdn.jsdelivr.net/fontsource/fonts/newsreader:vf@latest/newsreader-latin-wght-italic.woff2` |
| Space Grotesk | `https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk:vf@latest/space-grotesk-latin-wght-normal.woff2` |

---

*文档版本: v1.0*
*最后更新: 2026-03-29*

# shadcn/ui Design System Migration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目设计系统从自定义 Apple HIG 完全迁移至 shadcn/ui Zinc 主题标准，消除所有 Apple 专属 CSS token 和 utility class。

**Architecture:** 分五个 Chunk 依次执行——先替换 CSS 基础层（global.css + components.json），再重新生成 shadcn 标准组件，再逐层替换自定义组件、业务组件、页面文件，最后清理文档。每个 Chunk 结束后提交一次 git。

**Tech Stack:** Next.js 16 App Router · shadcn/ui new-york Zinc · Tailwind CSS v4 · Radix UI · pnpm

**Spec:** `docs/superpowers/specs/2026-03-14-shadcn-ui-design-system-migration-design.md`

---

## Token 映射速查表（实施时常用）

| 旧 Token | 新 Token |
|---|---|
| `bg-surface` | `bg-muted` |
| `bg-surface-hover` / `hover:bg-surface-hover` | `bg-accent` / `hover:bg-accent` |
| `bg-surface/50` | `bg-muted/50` |
| `text-text` | `text-foreground` |
| `text-text-secondary` | `text-muted-foreground` |
| `text-text-tertiary` | `text-muted-foreground` |
| `border-border` | `border-border` ✅ |
| `bg-accent` | `bg-primary` |
| `text-accent` | `text-primary` |
| `bg-accent/10` | `bg-primary/10` |
| `bg-accent-hover-color` / `hover:bg-accent-hover-color` | `bg-primary/90` |
| `ease-apple` | `ease-in-out` |
| `text-error` | `text-destructive` |
| `bg-error` | `bg-destructive` |
| `hover:bg-error-hover-color` | `hover:bg-destructive/90` |
| `text-success` / `bg-success` / `bg-success-bg` | `text-muted-foreground` / `bg-muted` |
| `border-success-border` | `border-border` |
| `text-warning` / `bg-warning-bg` | `text-muted-foreground` / `bg-muted` |
| `text-info` / `bg-info-bg` | `text-muted-foreground` / `bg-muted` |
| `bg-info` (普通背景) | `bg-muted` |
| `bg-info` (选中态) | `bg-primary` |
| `bg-info/10` / `bg-info/20` | `bg-primary/10` |
| `apple-prose` | `blog-prose` |
| `AppleCard` (组件名) | `GlassCard` |

---

## Chunk 1: Foundation — CSS 基础层

### Task 1: 更新 `components.json`

**Files:**
- Modify: `components.json`

- [ ] **Step 1: 将 baseColor 从 neutral 改为 zinc**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "styles/global.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

---

### Task 2: 重写 `styles/global.css`

**Files:**
- Modify: `styles/global.css`

**目标：** 移除所有 Apple HIG 相关内容，引入 shadcn/ui Zinc 标准变量，保留 hljs/滚动条/blog-prose/code-block-wrapper。

- [ ] **Step 1: 完全替换 `styles/global.css` 为以下内容**

保留原文件中：
1. `@import` 语句（tailwindcss、tw-animate-css、@iconify、typography、bytemd、highlight.js、bytemd.css）
2. `@plugin` 语句
3. hljs 相关变量和样式（`:root` 和 `.dark` 中的 `--hljs-*` 部分）
4. `::-webkit-scrollbar` 样式
5. `code-block-wrapper` utility
6. `copy-code-btn` utility
7. `apple-prose` utility —— 改名为 `blog-prose`，更新颜色引用

移除：
- `@keyframes float-slow / float-medium / float-fast / fade-in-up`
- `@font-face` Inter 和 JetBrains Mono
- `@theme` 中所有 Apple HIG 相关 token（`--font-*`、`--ease-apple`、`--animate-*`、`--color-bg`、`--color-surface`、`--color-surface-hover`、`--color-accent`、`--color-text-*`、`--color-success-*`、`--color-warning-*`、`--color-error-*`、`--color-info-*`）
- `:root` 中所有 Apple HIG 变量（`--bg-color`、`--surface-color`、`--surface-hover-color`、`--border-color`、`--accent-color`、`--accent-hover-color`、`--text-color`、`--text-color-secondary`、`--text-color-tertiary`、`--success-*`、`--warning-*`、`--error-*`、`--info-*` 共 34 个变量）
- `.dark` 中对应变量（同上）
- Apple utility class：`apple-card`、`apple-surface`、`apple-btn`、`apple-btn-primary`、`apple-btn-secondary`、`apple-btn-ghost`、`apple-input`、`text-secondary`、`text-tertiary`、`text-accent-custom`

新增 shadcn/ui Zinc token 到 `:root` 和 `.dark`，以及 `@theme inline` 块（Tailwind v4 必须）：

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.21 0.006 285.885);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
}

/* Tailwind v4 必须：将 CSS 变量注册为 Tailwind 工具类 */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}
```

修复 `@layer base` 中的两条规则：

```css
@layer base {
  * {
    border-color: var(--border);  /* 原来是 var(--border-color) */
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  /* 注意：--primary 是完整的 oklch() 值，直接用 var()，不要用 hsl(var()) */
  ::selection {
    background-color: var(--primary);
    color: var(--primary-foreground);
  }
}
```

`blog-prose` utility（原 `apple-prose`）颜色映射：

```css
@utility blog-prose {
  @apply prose prose-lg max-w-none;

  --tw-prose-body: var(--foreground);
  --tw-prose-headings: var(--foreground);
  --tw-prose-lead: var(--muted-foreground);
  --tw-prose-links: var(--primary);
  --tw-prose-bold: var(--foreground);
  --tw-prose-counters: var(--primary);
  --tw-prose-bullets: var(--primary);
  --tw-prose-hr: var(--border);
  --tw-prose-quotes: var(--foreground);
  --tw-prose-quote-borders: var(--primary);
  --tw-prose-captions: var(--muted-foreground);
  --tw-prose-code: var(--primary);
  --tw-prose-pre-code: var(--foreground);
  --tw-prose-pre-bg: var(--muted);
  --tw-prose-th-borders: var(--border);
  --tw-prose-td-borders: var(--border);

  & pre {
    @apply bg-muted rounded-xl border border-border p-4;
  }

  & blockquote {
    @apply border-l-4 border-primary bg-muted/50 p-4 rounded-r-xl not-italic;
  }

  & img {
    @apply rounded-xl shadow-sm;
  }

  & a {
    @apply no-underline hover:underline transition-colors duration-200 font-medium;
  }

  & :not(pre) > code {
    @apply px-1.5 py-0.5 rounded-md text-sm font-mono bg-muted border border-border text-primary mx-0.5 align-middle;
  }

  & :not(pre) > code::before,
  & :not(pre) > code::after {
    content: none;
  }

  & pre code {
    @apply bg-transparent border-none p-0;
  }

  & pre code::before,
  & pre code::after {
    content: none;
  }

  & h1, & h2, & h3, & h4 {
    @apply scroll-m-20 tracking-tight;
  }

  & h1 {
    @apply text-3xl font-bold lg:text-4xl mb-8;
  }

  & h2 {
    @apply text-2xl font-semibold border-b border-border pb-2 mt-10 mb-6;
  }

  & h3 {
    @apply text-xl font-semibold mt-8 mb-4;
  }
}
```

`copy-code-btn` utility 颜色映射：

```css
@utility copy-code-btn {
  @apply absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground opacity-0 transition-all duration-200 cursor-pointer;

  .code-block-wrapper:hover & {
    @apply opacity-100;
  }

  &:hover {
    @apply bg-primary text-primary-foreground border-primary;
  }

  &.copied {
    @apply border-primary text-primary bg-muted opacity-100;
  }

  & .check-icon { @apply hidden; }
  &.copied .copy-icon { @apply hidden; }
  &.copied .check-icon { @apply block; }
}
```

- [ ] **Step 2: 确认 body 背景色正确**

```bash
grep -n "background\|foreground\|bg-color\|surface-color" /Users/fuxiaochen/workspace/fuxiaochen/styles/global.css
```

确认输出中不再出现 `--bg-color`、`--surface-color` 等旧 token。

- [ ] **Step 3: Commit**

```bash
git add components.json styles/global.css
git commit -m "feat: migrate CSS to shadcn/ui Zinc theme tokens"
```

---

### Task 3: 重新添加 shadcn/ui 标准组件

**Files:**
- Overwrite: `components/ui/` 下所有标准 shadcn 组件

- [ ] **Step 1: 重新添加所有已安装的标准组件**

```bash
cd /Users/fuxiaochen/workspace/fuxiaochen
pnpm dlx shadcn@latest add alert-dialog avatar badge button card checkbox dialog drawer dropdown-menu form input label pagination popover radio-group scroll-area select separator sheet skeleton switch table textarea toggle tooltip --overwrite
```

> 注意：`button-group`、`empty` 是自定义组件，不在 shadcn 注册表中，不在此列表中，将在下一步手动更新 token。

- [ ] **Step 2: 删除 typography 目录**

```bash
rm -rf /Users/fuxiaochen/workspace/fuxiaochen/components/ui/typography
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/
git commit -m "feat: reinstall shadcn/ui components with Zinc theme"
```

---

## Chunk 2: 自定义 UI 组件

### Task 4: 更新 `components/ui/glass-card.tsx`

**Files:**
- Modify: `components/ui/glass-card.tsx`

- [ ] **Step 1: 替换文件内容（改名 AppleCard → GlassCard，更新 token）**

```tsx
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hover";
}

export function GlassCard({
  children,
  className,
  variant = "default",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted p-6 shadow-sm",
        variant === "hover" &&
          "transition-all duration-200 ease-in-out hover:shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

---

### Task 5: 更新 `components/ui/back-to-top.tsx`

**Files:**
- Modify: `components/ui/back-to-top.tsx`

- [ ] **Step 1: 替换 token**

```tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed right-8 bottom-8 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-10 opacity-0",
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5 text-foreground" />
    </button>
  );
}
```

---

### Task 6: 更新 `components/ui/error-view.tsx`

**Files:**
- Modify: `components/ui/error-view.tsx`

- [ ] **Step 1: 替换 AppleCard → GlassCard，更新 token**

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface ErrorViewProps {
  code?: string;
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ code, title, message, onRetry }: ErrorViewProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              {code === "404" ? (
                <span className="text-3xl font-bold">404</span>
              ) : (
                <AlertTriangle className="h-10 w-10" />
              )}
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-foreground">{title}</h1>
          <p className="mb-8 text-muted-foreground">{message}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back Home
              </Button>
            </Link>
            {onRetry && (
              <Button onClick={onRetry} className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </motion.div>
      </GlassCard>
    </div>
  );
}
```

---

### Task 7: 更新自定义 UI 组件（empty、button-group、data-table*）

**Files:**
- Modify: `components/ui/empty.tsx`
- Modify: `components/ui/button-group.tsx`
- Modify: `components/ui/data-table.tsx`
- Modify: `components/ui/data-table-column-header.tsx`
- Modify: `components/ui/data-table-pagination.tsx`
- Modify: `components/ui/data-table-toolbar.tsx`
- Modify: `components/ui/data-table-view-options.tsx`

- [ ] **Step 1: 在每个文件中做 token 替换**

先确认 `empty.tsx` 和 `button-group.tsx` 中的 token：

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple\|bg-error\|text-error" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/ui/empty.tsx \
  /Users/fuxiaochen/workspace/fuxiaochen/components/ui/button-group.tsx
```

`empty.tsx` 替换：`bg-surface` → `bg-muted`，`text-text` → `text-foreground`，`text-text-secondary` → `text-muted-foreground`，`text-accent` → `text-primary`

`button-group.tsx` 替换：`bg-surface` → `bg-muted`（以及其他按映射表处理）

对 data-table 系列文件执行以下替换（文件内容按映射表替换 token）：
- `bg-surface` → `bg-muted`
- `bg-surface-hover` → `bg-accent`
- `text-text` → `text-foreground`
- `text-text-secondary` → `text-muted-foreground`
- `text-text-tertiary` → `text-muted-foreground`
- `border-border` → `border-border` ✅
- `bg-accent` → `bg-primary`（注意：只有旧 Apple 意义的 accent，即主色）
- `text-accent` → `text-primary`
- `ease-apple` → `ease-in-out`

> 注意：先 grep 确认每个文件实际用到哪些 token，再替换。

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple\|bg-error\|text-error" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/ui/data-table.tsx \
  /Users/fuxiaochen/workspace/fuxiaochen/components/ui/data-table-column-header.tsx \
  /Users/fuxiaochen/workspace/fuxiaochen/components/ui/data-table-pagination.tsx \
  /Users/fuxiaochen/workspace/fuxiaochen/components/ui/data-table-toolbar.tsx \
  /Users/fuxiaochen/workspace/fuxiaochen/components/ui/data-table-view-options.tsx
```

- [ ] **Step 2: Commit Chunk 2**

```bash
git add components/ui/glass-card.tsx components/ui/back-to-top.tsx components/ui/error-view.tsx \
  components/ui/empty.tsx components/ui/button-group.tsx \
  components/ui/data-table.tsx components/ui/data-table-column-header.tsx \
  components/ui/data-table-pagination.tsx components/ui/data-table-toolbar.tsx \
  components/ui/data-table-view-options.tsx
git commit -m "feat: migrate custom UI components to shadcn tokens"
```

---

## Chunk 3: Layout、Blog、Admin 组件

### Task 8: 更新 `components/layout/header.tsx`

**Files:**
- Modify: `components/layout/header.tsx`

- [ ] **Step 1: 替换所有旧 token**

关键替换点：
- `bg-bg-color` → `bg-background`（注意：header 用了 `bg-bg-color/80` 这个非标准写法）
- `border-border` → `border-border` ✅
- `bg-accent` → `bg-primary`
- `text-text` → `text-foreground`
- `via-accent/30` → `via-primary/30`
- `bg-surface` → `bg-muted`
- `hover:bg-surface` → `hover:bg-accent`

```bash
grep -n "bg-bg-color\|bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/layout/header.tsx
```

逐一替换后保存。

---

### Task 9: 更新 `components/layout/footer.tsx`

**Files:**
- Modify: `components/layout/footer.tsx`

- [ ] **Step 1: 替换 token**

关键替换点：
- `bg-surface/50` → `bg-muted/50`
- `border-border` → `border-border` ✅
- `from-accent/5` → `from-primary/5`
- `text-text-secondary` → `text-muted-foreground`
- `text-text-tertiary` → `text-muted-foreground`
- `text-accent` → `text-primary`
- `hover:bg-surface` → `hover:bg-accent`

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|border-border" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/layout/footer.tsx
```

---

### Task 10: 更新 `components/portal/hero.tsx` 和 `components/theme-toggle.tsx`

**Files:**
- Modify: `components/portal/hero.tsx`
- Modify: `components/theme-toggle.tsx`

- [ ] **Step 1: grep 确认用到的 token，按映射表替换**

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple\|animate-float\|animate-fade" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/portal/hero.tsx \
  /Users/fuxiaochen/workspace/fuxiaochen/components/theme-toggle.tsx
```

> ⚠️ `hero.tsx` 可能使用 `animate-float-*`，这些动画已被移除。如果 hero 有浮动动画元素，直接删除那些动画类或改为 `animate-pulse`。

---

### Task 11: 更新 blog 组件

**Files:**
- Modify: `components/blog/blog-card.tsx`
- Modify: `components/blog/blog-content.tsx`
- Modify: `components/blog/blog-filter-bar.tsx`
- Modify: `components/blog/blog-list.tsx`
- Modify: `components/blog/table-of-contents.tsx`

- [ ] **Step 1: 更新 `blog-content.tsx`（apple-prose → blog-prose）**

```bash
grep -n "apple-prose" /Users/fuxiaochen/workspace/fuxiaochen/components/blog/blog-content.tsx
```

将所有 `apple-prose` 替换为 `blog-prose`。

- [ ] **Step 2: 更新 `blog-card.tsx`（移除 typography import，更新 token）**

```bash
grep -n "typography\|bg-surface\|text-text\|bg-accent\|text-accent" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/blog/blog-card.tsx
```

移除 `@/components/ui/typography/` 的 import，用 HTML 标签替换 `<Title>`、`<Text>`、`<Paragraph>` 等组件。

- [ ] **Step 3: 更新 `blog-filter-bar.tsx`（特殊处理选中态）**

关键替换（注意语义）：
- 搜索框 input：`bg-surface/50` → `bg-muted/50`，`text-text` → `text-foreground`，`placeholder:text-text-tertiary` → `placeholder:text-muted-foreground`，`focus:border-accent` → `focus:border-primary`，`focus:ring-accent/20` → `focus:ring-primary/20`
- 分类按钮**选中态**：`bg-accent text-primary-foreground` → `bg-primary text-primary-foreground`
- 标签按钮**选中态**：`bg-info text-primary-foreground` → `bg-primary text-primary-foreground`
- 未选中态：`bg-surface/50 text-text-secondary hover:bg-surface` → `bg-muted/50 text-muted-foreground hover:bg-accent`
- 清除按钮：`bg-surface-hover` → `bg-accent`，`hover:text-text` → `hover:text-foreground`
- Select 触发器：`bg-surface/50` → `bg-muted/50`
- 重置按钮：`bg-surface/50 text-text-secondary hover:bg-surface hover:text-text` → `bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground`

- [ ] **Step 4: 更新 `table-of-contents.tsx`（DOM querySelector + token）**

```bash
grep -n "apple-prose\|bg-surface\|text-text\|bg-accent" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/blog/table-of-contents.tsx
```

将 DOM 选择器字符串中的 `.apple-prose` 改为 `.blog-prose`，并替换其他 token。

- [ ] **Step 5: 更新 `blog-list.tsx`**

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/blog/blog-list.tsx
```

按映射表替换。

---

### Task 12: 更新 admin 组件（批量）

**Files:**
- Modify: `components/admin/data-table-pagination.tsx`

- [ ] **Step 1: grep 确认 token，替换**

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple\|bg-error\|text-error" \
  /Users/fuxiaochen/workspace/fuxiaochen/components/admin/data-table-pagination.tsx
```

- [ ] **Step 2: Commit Chunk 3**

```bash
git add components/layout/ components/portal/ components/blog/ components/admin/ components/theme-toggle.tsx
git commit -m "feat: migrate layout/blog/admin components to shadcn tokens"
```

---

## Chunk 4: App 页面层

### Task 13: 更新 `app/(site)/page.tsx`（首页）

**Files:**
- Modify: `app/(site)/page.tsx`

- [ ] **Step 1: grep 确认 token**

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|bg-info\|bg-success\|animate-float\|animate-fade" \
  "/Users/fuxiaochen/workspace/fuxiaochen/app/(site)/page.tsx"
```

- [ ] **Step 2: 替换 token**

关键替换点：
- `bg-info/20`（装饰性光圈）→ `bg-primary/10`
- 其余按标准映射表替换

---

### Task 14: 更新 `app/(site)/about/page.tsx`

**Files:**
- Modify: `app/(site)/about/page.tsx`

- [ ] **Step 1: grep 确认所有旧 token**

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|bg-info\|text-info\|bg-warning\|text-warning\|bg-success\|animate-float\|animate-fade\|from-accent\|via-info" \
  "/Users/fuxiaochen/workspace/fuxiaochen/app/(site)/about/page.tsx"
```

- [ ] **Step 2: 按以下规则替换**

- `from-accent/10` → `from-primary/10`
- `from-accent/5 via-info/5` → `from-primary/5 via-primary/5`（删除 `via-info`）
- `bg-success`（ping 在线状态点）→ `bg-primary`
- `text-info`（Go 标签文字）→ `text-primary`
- `bg-info/10`（Go 标签背景）→ `bg-primary/10`
- `text-warning`（Tailwind 标签）→ `text-muted-foreground`
- `bg-warning/10`（Tailwind 标签背景）→ `bg-muted`
- `bg-info/20`（装饰性背景）→ `bg-primary/10`
- 其余按标准映射表替换

---

### Task 15: 更新 `app/(site)/login/page.tsx`

**Files:**
- Modify: `app/(site)/login/page.tsx`

- [ ] **Step 1: grep 确认所有旧 token**

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|animate-float\|animate-fade\|typography\|from-accent\|via-info\|bg-info" \
  "/Users/fuxiaochen/workspace/fuxiaochen/app/(site)/login/page.tsx"
```

- [ ] **Step 2: 处理动画元素**

`animate-float-slow`、`animate-float-medium`、`animate-float-fast`、`animate-fade-in-up` 已移除。

对使用这些动画的装饰性 div 元素：直接删除 `animate-*` 类，改用 `opacity-30` 或直接去掉这些装饰性背景元素（登录页保持简洁）。

- [ ] **Step 3: 移除 typography import，替换其他 token**

移除 `@/components/ui/typography/` 的 import，按映射表替换所有剩余旧 token。

---

### Task 16: 更新 `app/(site)/blog/[slug]/page.tsx`

**Files:**
- Modify: `app/(site)/blog/[slug]/page.tsx`

- [ ] **Step 1: 替换 apple-prose 和 typography import**

```bash
grep -n "apple-prose\|typography\|bg-surface\|text-text\|text-accent" \
  "/Users/fuxiaochen/workspace/fuxiaochen/app/(site)/blog/[slug]/page.tsx"
```

- `apple-prose` → `blog-prose`
- 移除 typography 组件 import，替换为 HTML 标签
- 其余按映射表替换

---

### Task 17: 更新 `app/(site)/changelog/page.tsx`

**Files:**
- Modify: `app/(site)/changelog/page.tsx`

- [ ] **Step 1: 移除 typography import，替换 token**

```bash
grep -n "typography\|bg-surface\|text-text\|bg-accent\|text-accent" \
  "/Users/fuxiaochen/workspace/fuxiaochen/app/(site)/changelog/page.tsx"
```

---

### Task 18: 更新 `app/(site)/blog/page.tsx`

**Files:**
- Modify: `app/(site)/blog/page.tsx`

- [ ] **Step 1: 替换 token**

```bash
grep -n "bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple" \
  "/Users/fuxiaochen/workspace/fuxiaochen/app/(site)/blog/page.tsx"
```

---

### Task 19: 更新 ui-preview 组件（批量）

**Files:**
- Modify: `app/(site)/ui-preview/components/section-wrapper.tsx`
- Modify: `app/(site)/ui-preview/components/preview-card.tsx`
- Modify: `app/(site)/ui-preview/components/previews/typography-preview.tsx`
- Modify: `app/(site)/ui-preview/components/previews/data-table-preview.tsx`
- Modify: `app/(site)/ui-preview/components/previews/dialog-preview.tsx`
- Modify: `app/(site)/ui-preview/components/previews/display-preview.tsx`
- Modify: `app/(site)/ui-preview/components/previews/layout-preview.tsx`
- Modify: `app/(site)/ui-preview/page.tsx`

- [ ] **Step 1: 批量 grep 确认所有旧 token**

```bash
grep -rn "bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple\|typography\|AppleCard\|apple-prose" \
  "/Users/fuxiaochen/workspace/fuxiaochen/app/(site)/ui-preview/"
```

- [ ] **Step 2: 对每个文件执行以下操作**

- 移除 typography 组件 import（如有），替换为 HTML 标签
- `AppleCard` → `GlassCard`，更新 import 路径
- 按映射表替换所有旧 token
- `typography-preview.tsx` 中的 typography 展示组件：用 HTML 标签 + className 重写

---

### Task 20: 更新 `app/(admin)/` 所有文件

**Files:**
- Modify: `app/(admin)/admin-sidebar.tsx`
- Modify: `app/(admin)/layout.tsx`
- Modify: `app/(admin)/user-nav.tsx`
- Modify: `app/(admin)/admin/page.tsx`
- Modify: `app/(admin)/admin/blogs/blog-form.tsx`
- Modify: `app/(admin)/admin/blogs/blog-list.tsx`
- Modify: `app/(admin)/admin/blogs/new/page.tsx`
- Modify: `app/(admin)/admin/blogs/[id]/page.tsx`
- Modify: `app/(admin)/admin/categories/category-dialog.tsx`
- Modify: `app/(admin)/admin/categories/category-list.tsx`
- Modify: `app/(admin)/admin/categories/delete-alert.tsx`
- Modify: `app/(admin)/admin/changelogs/changelog-dialog.tsx`
- Modify: `app/(admin)/admin/changelogs/changelog-list.tsx`
- Modify: `app/(admin)/admin/tags/tag-dialog.tsx`
- Modify: `app/(admin)/admin/tags/tag-list.tsx`
- Modify: `app/(admin)/admin/users/page.tsx`
- Modify: `app/(admin)/admin/users/user-dialog.tsx`
- Modify: `app/(admin)/admin/users/user-list.tsx`

- [ ] **Step 1: `blog-form.tsx` — 特殊处理 apple-prose**

```bash
grep -n "apple-prose" "/Users/fuxiaochen/workspace/fuxiaochen/app/(admin)/admin/blogs/blog-form.tsx"
```

将 `apple-prose` 替换为 `blog-prose`。

- [ ] **Step 2: 批量 grep 确认所有文件的旧 token**

```bash
grep -rn "bg-surface\|text-text\|bg-accent\|text-accent\|ease-apple\|bg-error\|text-error\|text-success\|bg-success\|text-info\|bg-info\|text-warning" \
  "/Users/fuxiaochen/workspace/fuxiaochen/app/(admin)/"
```

- [ ] **Step 3: 逐文件按映射表替换**

每个文件中的替换遵循标准映射表。重点关注 `admin-sidebar.tsx`（可能有大量 token），检查是否有选中态使用了语义色（如 `bg-accent` 用于选中项高亮），这类情况改为 `bg-primary text-primary-foreground`。

- [ ] **Step 4: Commit Chunk 4**

```bash
git add "app/(site)/" "app/(admin)/"
git commit -m "feat: migrate app pages to shadcn tokens"
```

---

## Chunk 5: 清理与收尾

### Task 21: 更新 `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 移除 Apple HIG 章节**

删除以下章节的完整内容：
- "设计系统：Apple Human Interface Guidelines"
- "配色方案"（Light Mode / Dark Mode 颜色表格）
- "语意化颜色"（success/warning/error/info 表格）
- "圆角系统"
- "阴影系统"
- "过渡动画"
- "字体"
- "组件样式指南"（Button/Input/Card/Dialog/Table 的 Apple 规范）

- [ ] **Step 2: 新增 shadcn/ui 设计规范章节**

在 "UI 组件库" 章节之前插入：

```markdown
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
- 禁止使用已移除的 Apple HIG token（`bg-surface`、`text-text`、`border-border` 除外等）

### 组件规范

- 优先使用 shadcn/ui 原生 variant，不自造 utility class
- 组件颜色通过 variant 控制，不通过 className 覆盖颜色
```

- [ ] **Step 3: 更新 "代码高亮" 引用**

将 `apple-prose` 改为 `blog-prose`。

---

### Task 22: 运行 lint 修复

**Files:**
- Various

- [ ] **Step 1: 运行 lint**

```bash
cd /Users/fuxiaochen/workspace/fuxiaochen && pnpm lint
```

- [ ] **Step 2: 修复所有 lint 报错**

常见问题：
- 未使用的 import（移除了 typography 组件后）
- TypeScript 类型错误（如 `GlassCard` 重命名后的调用处）

- [ ] **Step 3: 运行构建验证**

```bash
pnpm build
```

确认构建无错误。

- [ ] **Step 4: Final Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with shadcn/ui design system"

git add -A
git commit -m "fix: resolve lint errors after design system migration"
```

---

## 完成验证清单

- [ ] `global.css` 中不再出现任何 `--bg-color`、`--surface-color`、`--accent-color`、`--text-color` 等旧变量
- [ ] `global.css` 中包含 `--background`、`--foreground`、`--primary`、`--muted` 等 shadcn 标准变量
- [ ] `components/ui/typography/` 目录已删除
- [ ] `glass-card.tsx` 导出名已从 `AppleCard` 改为 `GlassCard`
- [ ] 全局搜索 `apple-prose` 仅剩 CSS 定义（已改名为 `blog-prose`），不再有 className 引用
- [ ] 全局搜索 `bg-surface`、`text-text`、`bg-accent`（旧含义）无结果
- [ ] `pnpm lint` 无报错
- [ ] `pnpm build` 无报错

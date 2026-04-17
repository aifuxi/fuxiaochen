# Brand-First Publishing System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 `DESIGN.md` 的黑白单主题设计语言重建前台与后台，让站点成为品牌优先的个人发布系统，并彻底移除现有 Apple 风格主体验。

**Architecture:** 先稳定基础层：测试工具、`next/font` 字体、全局 token、共享 UI primitives、站点导航与本地内容配置，再进入页面级重构。首页精选与博客发现继续复用现有 `Blog / Category / Tag / Changelog` 数据模型，不新增 CMS 级后台配置；关于页内容改为本地配置，后台仅保留单人发布工作流。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript、Tailwind CSS v4、Radix UI、SWR、Prisma、Vitest、Testing Library

---

## Scope Check

这个 spec 同时覆盖基础设计系统、前台站点和后台控制台，但三者共享同一套 token、组件和内容模型，不适合拆成互不关联的独立计划。本计划按阶段拆成可独立提交的任务，先做共享基础，再做前台，再做后台，避免页面级返工。

## File Structure

### Tooling / Tests

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.tsx`
- Create: `tests/smoke/vitest-smoke.test.ts`
- Create: `tests/contracts/global-brand-contract.test.ts`
- Create: `tests/components/ui/form-primitives.test.tsx`
- Create: `tests/components/ui/display-primitives.test.tsx`
- Create: `tests/lib/navigation.test.ts`
- Create: `tests/lib/site/home.test.ts`
- Create: `tests/lib/site/blog.test.ts`
- Create: `tests/contracts/site-secondary-routes.contract.test.ts`
- Create: `tests/components/admin/admin-sidebar.test.tsx`
- Create: `tests/contracts/admin-blog-management.contract.test.ts`
- Create: `tests/contracts/admin-publishing-modules.contract.test.ts`
- Create: `tests/contracts/deprecated-surface-contract.test.ts`

### Foundation / Shared UI

- Modify: `app/layout.tsx`
- Modify: `styles/global.css`
- Modify: `components/ui/typography/title.tsx`
- Modify: `components/ui/typography/text.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/textarea.tsx`
- Modify: `components/ui/select.tsx`
- Modify: `components/ui/checkbox.tsx`
- Modify: `components/ui/radio-group.tsx`
- Modify: `components/ui/switch.tsx`
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/badge.tsx`
- Modify: `components/ui/table.tsx`
- Modify: `components/ui/data-table.tsx`
- Modify: `components/ui/pagination.tsx`
- Modify: `components/ui/dialog.tsx`
- Modify: `components/ui/alert-dialog.tsx`
- Modify: `components/ui/drawer.tsx`
- Modify: `components/ui/empty.tsx`
- Modify: `components/ui/error-view.tsx`
- Modify: `components/ui/skeleton.tsx`
- Create: `components/ui/pill.tsx`
- Modify: `components/ui/back-to-top.tsx`
- Modify: `components/ui/glass-card.tsx`

### Site Shell / Site Pages

- Create: `constants/navigation.ts`
- Create: `constants/site-content.ts`
- Create: `lib/site/home.ts`
- Create: `lib/site/blog.ts`
- Create: `components/site/section-heading.tsx`
- Create: `components/site/home/brand-hero.tsx`
- Create: `components/site/home/featured-articles.tsx`
- Create: `components/site/home/latest-writing.tsx`
- Create: `components/site/home/about-summary.tsx`
- Create: `components/site/home/changelog-summary.tsx`
- Create: `components/site/about/about-hero.tsx`
- Create: `components/site/about/profile-story.tsx`
- Create: `components/site/about/tech-stack.tsx`
- Create: `components/site/about/work-style.tsx`
- Create: `components/site/about/external-links.tsx`
- Create: `components/site/changelog/changelog-timeline.tsx`
- Modify: `components/layout/header.tsx`
- Modify: `components/layout/footer.tsx`
- Modify: `app/(site)/layout.tsx`
- Modify: `app/(site)/page.tsx`
- Modify: `app/(site)/blog/page.tsx`
- Modify: `app/(site)/blog/[slug]/page.tsx`
- Modify: `app/(site)/about/page.tsx`
- Modify: `app/(site)/changelog/page.tsx`
- Modify: `app/(site)/login/page.tsx`
- Modify: `app/(site)/not-found.tsx`
- Modify: `app/(site)/error.tsx`
- Modify: `components/blog/blog-filter-bar.tsx`
- Modify: `components/blog/blog-list.tsx`
- Modify: `components/blog/blog-card.tsx`
- Modify: `components/blog/blog-content.tsx`
- Modify: `components/blog/table-of-contents.tsx`
- Delete: `app/(site)/ui-preview/page.tsx`
- Delete: `app/(site)/ui-preview/components/preview-card.tsx`
- Delete: `app/(site)/ui-preview/components/section-wrapper.tsx`
- Delete: `app/(site)/ui-preview/components/previews/button-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/data-table-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/dialog-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/display-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/form-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/input-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/layout-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/typography-preview.tsx`
- Delete: `components/theme-provider.tsx`
- Delete: `components/theme-toggle.tsx`
- Delete: `components/portal/hero.tsx`

### Admin Console

- Create: `components/admin/page-header.tsx`
- Create: `components/admin/stat-card.tsx`
- Modify: `stores/dashboard/interface.ts`
- Modify: `stores/dashboard/store.ts`
- Modify: `app/(admin)/layout.tsx`
- Modify: `app/(admin)/admin-sidebar.tsx`
- Modify: `app/(admin)/admin/page.tsx`
- Modify: `app/(admin)/admin/blogs/page.tsx`
- Modify: `app/(admin)/admin/blogs/blog-list.tsx`
- Modify: `app/(admin)/admin/blogs/blog-form.tsx`
- Modify: `app/(admin)/admin/blogs/delete-alert.tsx`
- Modify: `app/(admin)/admin/blogs/new/page.tsx`
- Modify: `app/(admin)/admin/blogs/[id]/page.tsx`
- Modify: `app/(admin)/admin/categories/page.tsx`
- Modify: `app/(admin)/admin/categories/category-list.tsx`
- Modify: `app/(admin)/admin/categories/category-dialog.tsx`
- Modify: `app/(admin)/admin/categories/delete-alert.tsx`
- Modify: `app/(admin)/admin/tags/page.tsx`
- Modify: `app/(admin)/admin/tags/tag-list.tsx`
- Modify: `app/(admin)/admin/tags/tag-dialog.tsx`
- Modify: `app/(admin)/admin/tags/delete-alert.tsx`
- Modify: `app/(admin)/admin/changelogs/page.tsx`
- Modify: `app/(admin)/admin/changelogs/changelog-list.tsx`
- Modify: `app/(admin)/admin/changelogs/changelog-dialog.tsx`
- Modify: `app/(admin)/admin/changelogs/delete-alert.tsx`

### Final Cleanup

- Modify: `package.json`
- Delete: `components/ui/glass-card.tsx`

## Architectural Notes

- 前台页面默认保持 Server Component；只把筛选条、目录高亮、登录表单这类交互切成 isolated client leaf，避免不必要的 hydration。
- 站点数据获取优先 `Promise.all()` 并在页面层完成聚合，避免首页、博客页和后台仪表盘出现 waterfall。
- 字体改为 `next/font/google`，不再从 CSS 远程拉 `@font-face`，同时移除 `.dark` 与 `next-themes` 路径。
- 首页精选和博客 featured 位基于现有文章排序规则生成，不增加 Prisma schema，不引入后台站点配置模块。
- 后台保留 CRUD 能力，但导航、仪表盘和列表表单全部收敛为单人内容发布语境，`/admin/users` 不做重构，只从主导航和主工作流移除。

### Task 1: 建立 Vitest 测试基线

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `vitest.setup.tsx`
- Create: `tests/smoke/vitest-smoke.test.ts`

- [ ] **Step 1: 写入失败中的 smoke test**

```ts
import { describe, expect, it } from "vitest";

describe("vitest scaffold", () => {
  it("can execute repository tests", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试，确认当前仓库还没有测试基线**

Run: `pnpm exec vitest run tests/smoke/vitest-smoke.test.ts`
Expected: FAIL，提示 `vitest` 未安装或找不到配置。

- [ ] **Step 3: 修改 `package.json`，补齐脚本和开发依赖**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/react": "^16.3.0",
    "jsdom": "^26.1.0",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 4: 新建 Vitest 配置与测试启动文件**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    css: false,
  },
});
```

```tsx
// vitest.setup.tsx
import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: (
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      src: string;
      alt: string;
    },
  ) => <img {...props} />,
}));
```

- [ ] **Step 5: 安装新增依赖**

Run: `pnpm install`
Expected: 安装完成，`pnpm-lock.yaml` 更新，无报错退出。

- [ ] **Step 6: 再次运行 smoke test，确认测试基线可用**

Run: `pnpm exec vitest run tests/smoke/vitest-smoke.test.ts`
Expected: PASS，显示 `1 passed`。

- [ ] **Step 7: 提交**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts vitest.setup.tsx tests/smoke/vitest-smoke.test.ts
git commit -m "chore: add vitest test harness"
```

### Task 2: 重建全局品牌 token、字体与排版基线

**Files:**
- Modify: `app/layout.tsx`
- Modify: `styles/global.css`
- Modify: `components/ui/typography/title.tsx`
- Modify: `components/ui/typography/text.tsx`
- Create: `tests/contracts/global-brand-contract.test.ts`

- [ ] **Step 1: 写入品牌基础约束测试**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("global brand contract", () => {
  it("removes dark theme and apple token remnants", () => {
    const css = readFileSync("styles/global.css", "utf8");
    expect(css).toContain("--color-ink: #000000;");
    expect(css).toContain("--color-paper: #ffffff;");
    expect(css).not.toContain(".dark");
    expect(css).not.toContain("apple-card");
    expect(css).not.toContain("atom-one-dark");
  });

  it("uses next/font and does not wrap the app with ThemeProvider", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toContain("next/font/google");
    expect(layout).not.toContain("ThemeProvider");
  });
});
```

- [ ] **Step 2: 运行约束测试，确认当前实现仍然是旧风格**

Run: `pnpm exec vitest run tests/contracts/global-brand-contract.test.ts`
Expected: FAIL，至少会命中 `.dark`、`apple-card` 或 `ThemeProvider` 相关断言。

- [ ] **Step 3: 改写 `app/layout.tsx`，切换为 `next/font/google` 和单主题 body**

```tsx
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import { ModalProvider } from "@/components/modal-provider";
import { NICKNAME, SLOGAN, WEBSITE } from "@/constants/info";
import { isProduction } from "@/lib/env";
import "@/styles/global.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-brand-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-brand-display",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} bg-paper text-ink antialiased ${isProduction() ? "" : "debug-screens"}`}
      >
        <ModalProvider>{children}</ModalProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 重写 `styles/global.css`，建立黑白单主题 token 与 `brand-prose`**

```css
@import "tailwindcss";
@import "tw-animate-css";
@plugin "@iconify/tailwind4" {
  prefixes: skill-icons;
}
@plugin "@tailwindcss/typography";
@import "bytemd/dist/index.css";
@import "./bytemd.css";

@theme {
  --font-sans: var(--font-brand-body), "PingFang SC", "Hiragino Sans GB", sans-serif;
  --font-display: var(--font-brand-display), "PingFang SC", sans-serif;

  --color-ink: #000000;
  --color-paper: #ffffff;
  --color-muted: #4b4b4b;
  --color-subtle: #afafaf;
  --color-chip: #efefef;
  --color-line: #000000;
  --color-panel: #ffffff;
  --color-panel-soft: #f6f6f6;
  --color-shadow: rgba(0, 0, 0, 0.12);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-full: 999px;
}

:root {
  color-scheme: light;
}

@layer base {
  * {
    border-color: var(--color-line);
  }

  html {
    background: var(--color-paper);
  }

  body {
    min-height: 100dvh;
    background: var(--color-paper);
    color: var(--color-ink);
    font-family: var(--font-sans);
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::selection {
    background: var(--color-ink);
    color: var(--color-paper);
  }
}

@utility brand-shell {
  @apply mx-auto w-full max-w-[1120px] px-4 md:px-6;
}

@utility brand-prose {
  @apply prose max-w-none prose-neutral;
  --tw-prose-body: var(--color-muted);
  --tw-prose-headings: var(--color-ink);
  --tw-prose-links: var(--color-ink);
  --tw-prose-bold: var(--color-ink);
  --tw-prose-bullets: var(--color-ink);
  --tw-prose-hr: rgba(0, 0, 0, 0.12);
  --tw-prose-quotes: var(--color-ink);
  --tw-prose-quote-borders: var(--color-ink);
}

.brand-prose h1,
.brand-prose h2,
.brand-prose h3,
.brand-prose h4 {
  font-family: var(--font-display);
  letter-spacing: -0.04em;
}

.brand-prose pre {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #f6f6f6;
}

.brand-prose blockquote {
  border-left: 3px solid #000000;
  background: #f6f6f6;
}
```

- [ ] **Step 5: 调整排版 primitives，确保标题和正文遵守新层级**

```tsx
// components/ui/typography/title.tsx
const titleVariants = cva("font-[family:var(--font-display)] tracking-[-0.04em] text-ink", {
  variants: {
    level: {
      1: "text-4xl font-bold leading-[0.95] md:text-6xl",
      2: "text-3xl font-bold leading-tight md:text-4xl",
      3: "text-2xl font-bold leading-tight",
      4: "text-xl font-semibold leading-snug",
      5: "text-base font-semibold leading-snug",
      6: "text-sm font-semibold leading-snug",
    },
  },
  defaultVariants: {
    level: 1,
  },
});
```

```tsx
// components/ui/typography/text.tsx
const textVariants = cva("font-sans", {
  variants: {
    type: {
      primary: "text-ink",
      secondary: "text-muted",
      success: "text-ink",
      warning: "text-ink",
      danger: "text-ink",
    },
    size: {
      sm: "text-sm leading-6",
      base: "text-base leading-7",
      lg: "text-lg leading-8",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    type: "primary",
    size: "base",
    weight: "normal",
  },
});
```

- [ ] **Step 6: 重新运行品牌约束测试**

Run: `pnpm exec vitest run tests/contracts/global-brand-contract.test.ts`
Expected: PASS，断言 `.dark`、`ThemeProvider`、Apple token 已全部移除。

- [ ] **Step 7: 提交**

```bash
git add app/layout.tsx styles/global.css components/ui/typography/title.tsx components/ui/typography/text.tsx tests/contracts/global-brand-contract.test.ts
git commit -m "feat: rebuild global brand foundation"
```

### Task 3: 重建表单与交互 primitives

**Files:**
- Create: `components/ui/pill.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/textarea.tsx`
- Modify: `components/ui/select.tsx`
- Modify: `components/ui/checkbox.tsx`
- Modify: `components/ui/radio-group.tsx`
- Modify: `components/ui/switch.tsx`
- Modify: `components/ui/back-to-top.tsx`
- Create: `tests/components/ui/form-primitives.test.tsx`

- [ ] **Step 1: 写入失败中的 primitives 测试**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";

describe("form primitives", () => {
  it("renders primary actions as black pills", () => {
    render(<Button>Publish</Button>);
    expect(screen.getByRole("button", { name: "Publish" })).toHaveClass(
      "rounded-full",
      "bg-black",
      "text-white",
    );
  });

  it("renders inputs with visible black border", () => {
    render(<Input aria-label="Title" />);
    expect(screen.getByLabelText("Title")).toHaveClass("border-black");
  });

  it("renders active pills as inverted chips", () => {
    render(<Pill active>Frontend</Pill>);
    expect(screen.getByText("Frontend")).toHaveClass("bg-black", "text-white");
  });

  it("renders checked checkboxes with black fill", () => {
    render(<Checkbox checked aria-label="Published" />);
    expect(screen.getByLabelText("Published")).toHaveAttribute(
      "data-state",
      "checked",
    );
  });
});
```

- [ ] **Step 2: 运行测试，确认当前组件还没满足品牌约束**

Run: `pnpm exec vitest run tests/components/ui/form-primitives.test.tsx`
Expected: FAIL，`Button`、`Input` 和 `Pill` 相关 class 断言不满足。

- [ ] **Step 3: 新建 `Pill`，重写 `Button` 的黑白 CTA / 次级 / ghost 变体**

```tsx
// components/ui/pill.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-transform active:scale-[0.98]",
  {
    variants: {
      active: {
        true: "border-black bg-black text-white",
        false: "border-transparent bg-[#efefef] text-black hover:bg-[#e2e2e2]",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export function Pill({
  className,
  active,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof pillVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(pillVariants({ active }), className)} {...props} />;
}
```

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium whitespace-nowrap transition-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-black text-white hover:bg-[#1f1f1f]",
        secondary: "border border-black bg-white text-black hover:bg-[#f3f3f3]",
        ghost: "bg-transparent text-black hover:bg-[#efefef]",
        outline: "border border-black bg-transparent text-black hover:bg-[#f3f3f3]",
        destructive: "bg-black text-white hover:bg-[#1f1f1f]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);
```

- [ ] **Step 4: 重写输入、选择、勾选与返回顶部按钮的视觉基线**

```tsx
// components/ui/input.tsx
className={cn(
  "h-11 w-full rounded-[8px] border border-black bg-white px-3 text-sm text-black outline-none transition-colors placeholder:text-[#afafaf] focus:ring-2 focus:ring-black/10",
  className,
)}
```

```tsx
// components/ui/textarea.tsx
className={cn(
  "min-h-28 w-full rounded-[8px] border border-black bg-white px-3 py-2 text-sm text-black outline-none transition-colors placeholder:text-[#afafaf] focus:ring-2 focus:ring-black/10",
  className,
)}
```

```tsx
// components/ui/select.tsx
className={cn(
  "flex h-11 w-full items-center justify-between rounded-[8px] border border-black bg-white px-3 text-sm text-black outline-none transition-colors data-[placeholder]:text-[#afafaf]",
  className,
)}
```

```tsx
// components/ui/checkbox.tsx
className={cn(
  "peer h-5 w-5 rounded-[8px] border border-black bg-white transition-colors data-[state=checked]:bg-black data-[state=checked]:text-white",
  className,
)}
```

```tsx
// components/ui/back-to-top.tsx
className={cn(
  "fixed right-6 bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-black bg-white text-black shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-px",
  isVisible
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-8 opacity-0",
)}
```

- [ ] **Step 5: 重新运行 primitives 测试**

Run: `pnpm exec vitest run tests/components/ui/form-primitives.test.tsx`
Expected: PASS，按钮、输入、Pill、Checkbox 的 class 断言全部通过。

- [ ] **Step 6: 提交**

```bash
git add components/ui/pill.tsx components/ui/button.tsx components/ui/input.tsx components/ui/textarea.tsx components/ui/select.tsx components/ui/checkbox.tsx components/ui/radio-group.tsx components/ui/switch.tsx components/ui/back-to-top.tsx tests/components/ui/form-primitives.test.tsx
git commit -m "feat(ui): rebuild form primitives"
```

### Task 4: 重建数据展示、对话框与状态 primitives

**Files:**
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/badge.tsx`
- Modify: `components/ui/table.tsx`
- Modify: `components/ui/data-table.tsx`
- Modify: `components/ui/pagination.tsx`
- Modify: `components/ui/dialog.tsx`
- Modify: `components/ui/alert-dialog.tsx`
- Modify: `components/ui/drawer.tsx`
- Modify: `components/ui/empty.tsx`
- Modify: `components/ui/error-view.tsx`
- Modify: `components/ui/skeleton.tsx`
- Modify: `components/ui/glass-card.tsx`
- Create: `tests/components/ui/display-primitives.test.tsx`

- [ ] **Step 1: 写入失败中的展示组件测试**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Empty, EmptyTitle } from "@/components/ui/empty";
import { ErrorView } from "@/components/ui/error-view";

describe("display primitives", () => {
  it("renders cards with white surface and subtle black shadow", () => {
    render(<Card>Card</Card>);
    expect(screen.getByText("Card")).toHaveClass("bg-white");
  });

  it("renders badges as pill-shaped labels", () => {
    render(<Badge>Published</Badge>);
    expect(screen.getByText("Published")).toHaveClass("rounded-full");
  });

  it("renders empty states without accent gradients", () => {
    render(
      <Empty>
        <EmptyTitle>暂无内容</EmptyTitle>
      </Empty>,
    );
    expect(screen.getByText("暂无内容")).toBeInTheDocument();
  });

  it("renders localized error actions", () => {
    render(<ErrorView title="页面错误" message="请稍后重试" />);
    expect(screen.getByText("返回首页")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试，确认当前展示层仍然带有旧视觉实现**

Run: `pnpm exec vitest run tests/components/ui/display-primitives.test.tsx`
Expected: FAIL，`ErrorView` 文案和 `Card` / `Badge` 的 class 断言至少一项不满足。

- [ ] **Step 3: 重写 `Card`、`Badge`、`Pagination` 和表格相关样式**

```tsx
// components/ui/card.tsx
className={cn(
  "flex flex-col gap-5 rounded-[12px] bg-white px-6 py-6 text-black shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
  className,
)}
```

```tsx
// components/ui/badge.tsx
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-black text-white",
        secondary: "bg-[#efefef] text-black",
        destructive: "bg-black text-white",
        outline: "border border-black bg-white text-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
```

```tsx
// components/ui/table.tsx
className={cn(
  "w-full caption-bottom text-sm text-black",
  className,
)}
```

```tsx
// components/ui/pagination.tsx
className={cn(
  buttonVariants({
    variant: isActive ? "secondary" : "ghost",
    size,
  }),
  isActive ? "border border-black" : "",
  className,
)}
```

- [ ] **Step 4: 重写对话框、空状态、错误状态，并把 `AppleCard` 临时改成兼容包装**

```tsx
// components/ui/error-view.tsx
export function ErrorView({ code, title, message, onRetry }: ErrorViewProps) {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-[12px] border border-black bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-[#4b4b4b]">
          {code}
        </p>
        <h1 className="font-[family:var(--font-display)] text-4xl font-bold tracking-[-0.04em] text-black">
          {title}
        </h1>
        <p className="mt-3 text-base text-[#4b4b4b]">{message}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/">
            <Button variant="secondary">返回首页</Button>
          </Link>
          {onRetry ? <Button onClick={onRetry}>重新加载</Button> : null}
        </div>
      </div>
    </div>
  );
}
```

```tsx
// components/ui/glass-card.tsx
import { Card } from "@/components/ui/card";

export function AppleCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <Card className={className} {...props} />;
}
```

- [ ] **Step 5: 重新运行展示组件测试**

Run: `pnpm exec vitest run tests/components/ui/display-primitives.test.tsx`
Expected: PASS，空状态、错误状态、Card / Badge 约束全部通过。

- [ ] **Step 6: 提交**

```bash
git add components/ui/card.tsx components/ui/badge.tsx components/ui/table.tsx components/ui/data-table.tsx components/ui/pagination.tsx components/ui/dialog.tsx components/ui/alert-dialog.tsx components/ui/drawer.tsx components/ui/empty.tsx components/ui/error-view.tsx components/ui/skeleton.tsx components/ui/glass-card.tsx tests/components/ui/display-primitives.test.tsx
git commit -m "feat(ui): rebuild display primitives"
```

### Task 5: 重建前台壳层并删除公开预览页

**Files:**
- Create: `constants/navigation.ts`
- Modify: `components/layout/header.tsx`
- Modify: `components/layout/footer.tsx`
- Modify: `app/(site)/layout.tsx`
- Delete: `components/theme-provider.tsx`
- Delete: `components/theme-toggle.tsx`
- Delete: `components/portal/hero.tsx`
- Delete: `app/(site)/ui-preview/page.tsx`
- Delete: `app/(site)/ui-preview/components/preview-card.tsx`
- Delete: `app/(site)/ui-preview/components/section-wrapper.tsx`
- Delete: `app/(site)/ui-preview/components/previews/button-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/data-table-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/dialog-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/display-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/form-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/input-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/layout-preview.tsx`
- Delete: `app/(site)/ui-preview/components/previews/typography-preview.tsx`
- Create: `tests/lib/navigation.test.ts`

- [ ] **Step 1: 写入导航与范围约束测试**

```ts
import { describe, expect, it } from "vitest";
import { adminNavItems, siteNavItems } from "@/constants/navigation";

describe("navigation contract", () => {
  it("keeps only the approved public top-level routes", () => {
    expect(siteNavItems.map((item) => item.label)).toEqual([
      "首页",
      "博客",
      "关于我",
      "更新日志",
    ]);
  });

  it("removes user management from the admin primary navigation", () => {
    expect(adminNavItems.some((item) => item.href === "/admin/users")).toBe(
      false,
    );
  });
});
```

- [ ] **Step 2: 运行测试，确认当前导航结构还未抽离**

Run: `pnpm exec vitest run tests/lib/navigation.test.ts`
Expected: FAIL，`constants/navigation.ts` 尚不存在。

- [ ] **Step 3: 抽离站点 / 后台导航常量，并重写 Header / Footer**

```ts
// constants/navigation.ts
export const siteNavItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于我" },
  { href: "/changelog", label: "更新日志" },
];

export const adminNavItems = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/blogs", label: "博客管理" },
  { href: "/admin/categories", label: "分类管理" },
  { href: "/admin/tags", label: "标签管理" },
  { href: "/admin/changelogs", label: "更新日志管理" },
];
```

```tsx
// components/layout/header.tsx
<header className="sticky top-0 z-50 border-b border-black/10 bg-white">
  <div className="brand-shell flex h-18 items-center justify-between gap-6">
    <Link href="/" className="flex items-center gap-3 text-black">
      <Image src="/images/logo.svg" alt="付小晨" width={32} height={32} />
      <span className="font-[family:var(--font-display)] text-lg font-bold tracking-[-0.03em]">
        付小晨
      </span>
    </Link>
    <nav className="hidden items-center gap-2 md:flex">
      {siteNavItems.map((item) => (
        <Pill key={item.href} asChild active={pathname === item.href}>
          <Link href={item.href}>{item.label}</Link>
        </Pill>
      ))}
    </nav>
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary" size="icon" className="md:hidden">
          菜单
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex flex-col gap-3 p-6">
          {siteNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-base font-medium text-black">
              {item.label}
            </Link>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
    <Link href="/admin" className="hidden md:inline-flex">
      <Button variant="secondary">进入后台</Button>
    </Link>
  </div>
</header>
```

```tsx
// components/layout/footer.tsx
<footer className="mt-20 bg-black text-white">
  <div className="brand-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
    <div>
      <p className="text-sm uppercase tracking-[0.16em] text-white/60">Brand</p>
      <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-bold tracking-[-0.04em]">
        付小晨
      </h2>
      <p className="mt-4 max-w-md text-sm leading-7 text-white/72">{SLOGAN}</p>
    </div>
    <div className="grid gap-3 text-sm text-white/72">
      {siteNavItems.map((item) => (
        <Link key={item.href} href={item.href} className="hover:text-white">
          {item.label}
        </Link>
      ))}
    </div>
  </div>
</footer>
```

```tsx
// app/(site)/layout.tsx
import { BackToTop } from "@/components/ui/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
```

- [ ] **Step 4: 删除 Theme 路径和 `ui-preview` 公开预览入口**

Run:

```bash
rm components/theme-provider.tsx
rm components/theme-toggle.tsx
rm components/portal/hero.tsx
rm 'app/(site)/ui-preview/page.tsx'
rm 'app/(site)/ui-preview/components/preview-card.tsx'
rm 'app/(site)/ui-preview/components/section-wrapper.tsx'
rm 'app/(site)/ui-preview/components/previews/button-preview.tsx'
rm 'app/(site)/ui-preview/components/previews/data-table-preview.tsx'
rm 'app/(site)/ui-preview/components/previews/dialog-preview.tsx'
rm 'app/(site)/ui-preview/components/previews/display-preview.tsx'
rm 'app/(site)/ui-preview/components/previews/form-preview.tsx'
rm 'app/(site)/ui-preview/components/previews/input-preview.tsx'
rm 'app/(site)/ui-preview/components/previews/layout-preview.tsx'
rm 'app/(site)/ui-preview/components/previews/typography-preview.tsx'
```

Expected: 文件删除成功，无 `No such file or directory` 报错。

- [ ] **Step 5: 重新运行导航测试**

Run: `pnpm exec vitest run tests/lib/navigation.test.ts`
Expected: PASS，前台顶级导航固定为 4 项，后台导航不再包含 `用户管理`。

- [ ] **Step 6: 提交**

```bash
git add constants/navigation.ts components/layout/header.tsx components/layout/footer.tsx 'app/(site)/layout.tsx' tests/lib/navigation.test.ts
git add -A components/theme-provider.tsx components/theme-toggle.tsx components/portal/hero.tsx 'app/(site)/ui-preview'
git commit -m "feat(site): rebuild public shell"
```

### Task 6: 重建品牌优先首页

**Files:**
- Create: `constants/site-content.ts`
- Create: `lib/site/home.ts`
- Create: `components/site/section-heading.tsx`
- Create: `components/site/home/brand-hero.tsx`
- Create: `components/site/home/featured-articles.tsx`
- Create: `components/site/home/latest-writing.tsx`
- Create: `components/site/home/about-summary.tsx`
- Create: `components/site/home/changelog-summary.tsx`
- Modify: `app/(site)/page.tsx`
- Create: `tests/lib/site/home.test.ts`

- [ ] **Step 1: 写入首页数据模型测试**

```ts
import { describe, expect, it } from "vitest";
import { buildHomePageModel } from "@/lib/site/home";

const blogs = [
  { id: "1", title: "A", slug: "a", content: "x".repeat(900), createdAt: "2026-04-10T00:00:00.000Z" },
  { id: "2", title: "B", slug: "b", content: "x".repeat(300), createdAt: "2026-04-09T00:00:00.000Z" },
  { id: "3", title: "C", slug: "c", content: "x".repeat(300), createdAt: "2026-04-08T00:00:00.000Z" },
  { id: "4", title: "D", slug: "d", content: "x".repeat(300), createdAt: "2026-04-07T00:00:00.000Z" },
] as const;

const changelogs = [
  { id: "c1", version: "v1.1.0", content: "second", date: 1713398400000 },
  { id: "c2", version: "v1.0.0", content: "first", date: 1712966400000 },
] as const;

describe("buildHomePageModel", () => {
  it("splits one lead story and three secondary stories", () => {
    const model = buildHomePageModel({
      blogs: blogs as never,
      changelogs: changelogs as never,
    });

    expect(model.leadStory?.slug).toBe("a");
    expect(model.secondaryStories.map((item) => item.slug)).toEqual([
      "b",
      "c",
      "d",
    ]);
  });

  it("sorts changelog summary in descending order", () => {
    const model = buildHomePageModel({
      blogs: blogs as never,
      changelogs: changelogs as never,
    });

    expect(model.recentChangelogs[0]?.version).toBe("v1.1.0");
  });
});
```

- [ ] **Step 2: 运行测试，确认首页 view-model 尚未实现**

Run: `pnpm exec vitest run tests/lib/site/home.test.ts`
Expected: FAIL，`lib/site/home.ts` 尚不存在。

- [ ] **Step 3: 写入本地品牌内容配置**

```ts
// constants/site-content.ts
export const SITE_PROFILE = {
  identity: "前端开发工程师 / 内容发布者",
  headline: "构建可维护的 Web 产品，并持续把经验写下来。",
  summary:
    "这里先回答你是谁、你在做什么、为什么值得继续看，再把你带去博客、关于页和更新日志。",
  highlights: [
    "关注前端架构、设计系统与工程效率",
    "保持稳定写作与持续迭代的发布节奏",
    "用黑白高对比的品牌语言统一前后台体验",
  ],
  aboutSummary: [
    "2020 年毕业，长期专注前端开发与 Web 工程化。",
    "工作方式偏重结构化拆解、清晰规范和可持续交付。",
  ],
  externalLinks: [
    { label: "GitHub", href: "https://github.com/aifuxi" },
    { label: "掘金", href: "https://juejin.cn/user/2647279733052494" },
    { label: "Bilibili", href: "https://space.bilibili.com/315542317" },
  ],
  techStack: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Go", "MySQL"],
} as const;
```

- [ ] **Step 4: 实现首页聚合逻辑与分区组件**

```ts
// lib/site/home.ts
import type { Blog } from "@/types/blog";
import type { Changelog } from "@/types/changelog";

export function buildHomePageModel({
  blogs,
  changelogs,
}: {
  blogs: Blog[];
  changelogs: Changelog[];
}) {
  const [leadStory, ...restStories] = blogs;

  return {
    leadStory: leadStory ?? null,
    secondaryStories: restStories.slice(0, 3),
    latestWriting: blogs.slice(0, 6),
    recentChangelogs: [...changelogs].sort((a, b) => (b.date ?? 0) - (a.date ?? 0)).slice(0, 4),
  };
}
```

```tsx
// components/site/section-heading.tsx
export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-black md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-7 text-[#4b4b4b]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
```

```tsx
// components/site/home/brand-hero.tsx
import Link from "next/link";
import { SITE_PROFILE } from "@/constants/site-content";
import { Button } from "@/components/ui/button";

export function BrandHero({
  profile,
}: {
  profile: typeof SITE_PROFILE;
}) {
  return (
    <section className="grid gap-10 border-b border-black/10 pb-12 lg:grid-cols-[minmax(0,1.2fr)_320px]">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">
          {profile.identity}
        </p>
        <h1 className="mt-4 font-[family:var(--font-display)] text-5xl font-bold tracking-[-0.05em] text-black md:text-7xl">
          {profile.headline}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4b4b4b]">
          {profile.summary}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/blog">进入博客</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/about">关于我</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-3">
        {profile.highlights.map((item) => (
          <div
            key={item}
            className="rounded-[12px] border border-black/10 bg-[#f6f6f6] p-4 text-sm leading-7 text-black"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/site/home/featured-articles.tsx
import Link from "next/link";
import type { Blog } from "@/types/blog";
import { SectionHeading } from "@/components/site/section-heading";

export function FeaturedArticles({
  lead,
  secondary,
}: {
  lead: Blog | null;
  secondary: Blog[];
}) {
  if (!lead) return null;

  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Featured"
        title="精选文章"
        description="先给出一篇主推内容，再补充几个继续阅读入口。"
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Link
          href={`/blog/${lead.slug}`}
          className="rounded-[12px] border border-black bg-black p-8 text-white"
        >
          <h3 className="font-[family:var(--font-display)] text-3xl font-bold tracking-[-0.04em]">
            {lead.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/72">
            {lead.description}
          </p>
        </Link>
        <div className="grid gap-4">
          {secondary.map((item) => (
            <Link
              key={item.id}
              href={`/blog/${item.slug}`}
              className="rounded-[12px] border border-black/10 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
            >
              <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">
                {item.category?.name ?? "文章"}
              </p>
              <h4 className="mt-2 font-[family:var(--font-display)] text-2xl font-bold tracking-[-0.04em] text-black">
                {item.title}
              </h4>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

```tsx
// components/site/home/latest-writing.tsx
import type { Blog } from "@/types/blog";
import { BlogCard } from "@/components/blog/blog-card";
import { SectionHeading } from "@/components/site/section-heading";

export function LatestWriting({ blogs }: { blogs: Blog[] }) {
  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Latest"
        title="最新写作"
        description="保持最近更新的写作流，首页不再堆满所有模块。"
      />
      <div className="space-y-4">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/site/home/about-summary.tsx
import Link from "next/link";
import { SITE_PROFILE } from "@/constants/site-content";
import { SectionHeading } from "@/components/site/section-heading";

export function AboutSummary({
  profile,
}: {
  profile: typeof SITE_PROFILE;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
      <SectionHeading
        eyebrow="About"
        title="关于我摘要"
        description={profile.aboutSummary.join(" ")}
      />
      <div className="flex items-start lg:justify-end">
        <Link href="/about" className="text-sm font-medium text-black underline underline-offset-4">
          查看完整介绍
        </Link>
      </div>
    </section>
  );
}
```

```tsx
// components/site/home/changelog-summary.tsx
import type { Changelog } from "@/types/changelog";
import { formatSimpleDate } from "@/lib/time";
import { SectionHeading } from "@/components/site/section-heading";

export function ChangelogSummary({ items }: { items: Changelog[] }) {
  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Changelog"
        title="最近更新日志"
        description="保持“持续建设中”的信号，并和独立时间线结构保持一致。"
      />
      <div className="divide-y divide-black/10 rounded-[12px] border border-black/10 bg-white">
        {items.map((item) => (
          <div key={item.id} className="grid gap-2 px-5 py-4 md:grid-cols-[160px_minmax(0,1fr)]">
            <div className="text-sm text-[#4b4b4b]">
              {item.date ? formatSimpleDate(new Date(item.date)) : "-"}
            </div>
            <div>
              <p className="font-semibold text-black">{item.version}</p>
              <p className="mt-1 text-sm leading-7 text-[#4b4b4b]">
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// app/(site)/page.tsx
import { getBlogsAction } from "@/app/actions/blog";
import { getChangelogsAction } from "@/app/actions/changelog";
import { SITE_PROFILE } from "@/constants/site-content";
import { buildHomePageModel } from "@/lib/site/home";
import { AboutSummary } from "@/components/site/home/about-summary";
import { BrandHero } from "@/components/site/home/brand-hero";
import { ChangelogSummary } from "@/components/site/home/changelog-summary";
import { FeaturedArticles } from "@/components/site/home/featured-articles";
import { LatestWriting } from "@/components/site/home/latest-writing";

export default async function HomePage() {
  const [blogsResult, changelogResult] = await Promise.all([
    getBlogsAction({
      page: 1,
      pageSize: 8,
      published: true,
      sortBy: "createdAt",
      order: "desc",
    }),
    getChangelogsAction({
      page: 1,
      pageSize: 4,
      sortBy: "createdAt",
      order: "desc",
    }),
  ]);

  if (!blogsResult.success || !changelogResult.success) {
    throw new Error("加载首页数据失败");
  }

  const model = buildHomePageModel({
    blogs: blogsResult.data?.lists ?? [],
    changelogs: changelogResult.data?.lists ?? [],
  });

  return (
    <main className="brand-shell space-y-16 pb-20 pt-10 md:space-y-24">
      <BrandHero profile={SITE_PROFILE} />
      <FeaturedArticles lead={model.leadStory} secondary={model.secondaryStories} />
      <LatestWriting blogs={model.latestWriting} />
      <AboutSummary profile={SITE_PROFILE} />
      <ChangelogSummary items={model.recentChangelogs} />
    </main>
  );
}
```

- [ ] **Step 5: 重新运行首页数据模型测试**

Run: `pnpm exec vitest run tests/lib/site/home.test.ts`
Expected: PASS，首页 lead story、secondary stories 和 changelog 摘要选择规则正确。

- [ ] **Step 6: 提交**

```bash
git add constants/site-content.ts lib/site/home.ts components/site/section-heading.tsx components/site/home/brand-hero.tsx components/site/home/featured-articles.tsx components/site/home/latest-writing.tsx components/site/home/about-summary.tsx components/site/home/changelog-summary.tsx 'app/(site)/page.tsx' tests/lib/site/home.test.ts
git commit -m "feat(site): rebuild brand-first homepage"
```

### Task 7: 重建博客发现页与文章详情页

**Files:**
- Create: `lib/site/blog.ts`
- Modify: `app/(site)/blog/page.tsx`
- Modify: `app/(site)/blog/[slug]/page.tsx`
- Modify: `components/blog/blog-filter-bar.tsx`
- Modify: `components/blog/blog-list.tsx`
- Modify: `components/blog/blog-card.tsx`
- Modify: `components/blog/blog-content.tsx`
- Modify: `components/blog/table-of-contents.tsx`
- Create: `tests/lib/site/blog.test.ts`

- [ ] **Step 1: 写入博客页逻辑测试**

```ts
import { describe, expect, it } from "vitest";
import { buildBlogIndexModel, getReadingMinutes } from "@/lib/site/blog";

const blogs = [
  { slug: "lead", content: "x".repeat(900) },
  { slug: "one", content: "x".repeat(300) },
  { slug: "two", content: "x".repeat(300) },
] as const;

describe("blog page helpers", () => {
  it("shows a featured article only on the first unfiltered page", () => {
    const model = buildBlogIndexModel({
      blogs: blogs as never,
      page: 1,
      hasActiveFilters: false,
    });

    expect(model.featured?.slug).toBe("lead");
    expect(model.archive.map((item) => item.slug)).toEqual(["one", "two"]);
  });

  it("keeps all articles in the archive when filters are active", () => {
    const model = buildBlogIndexModel({
      blogs: blogs as never,
      page: 1,
      hasActiveFilters: true,
    });

    expect(model.featured).toBeNull();
    expect(model.archive.map((item) => item.slug)).toEqual([
      "lead",
      "one",
      "two",
    ]);
  });

  it("calculates reading time with a 300 chars per minute heuristic", () => {
    expect(getReadingMinutes("x".repeat(750))).toBe(3);
  });
});
```

- [ ] **Step 2: 运行测试，确认博客 helper 尚未实现**

Run: `pnpm exec vitest run tests/lib/site/blog.test.ts`
Expected: FAIL，`lib/site/blog.ts` 尚不存在。

- [ ] **Step 3: 实现 featured 逻辑与阅读时长 helper**

```ts
// lib/site/blog.ts
import type { Blog } from "@/types/blog";

export function getReadingMinutes(content: string) {
  return Math.max(1, Math.ceil(content.length / 300));
}

export function buildBlogIndexModel({
  blogs,
  page,
  hasActiveFilters,
}: {
  blogs: Blog[];
  page: number;
  hasActiveFilters: boolean;
}) {
  const showFeatured = page === 1 && !hasActiveFilters && blogs.length > 0;

  return {
    featured: showFeatured ? blogs[0] : null,
    archive: showFeatured ? blogs.slice(1) : blogs,
  };
}
```

- [ ] **Step 4: 改写博客页，使用 pill 筛选和新的内容浏览结构**

```tsx
// app/(site)/blog/page.tsx
const hasActiveFilters = Boolean(
  params.title || params.categoryId || params.tagId,
);
const requestPageSize =
  page === 1 && !hasActiveFilters ? DEFAULT_PAGE_SIZE + 1 : DEFAULT_PAGE_SIZE;

const [blogsResult, categoriesResult, tagsResult] = await Promise.all([
  getBlogsAction({
    page,
    pageSize: requestPageSize,
    title: params.title,
    categoryId: params.categoryId,
    tagId: params.tagId,
    sortBy: params.sortBy || "createdAt",
    order: params.order || "desc",
    published: true,
  }),
  getCategoriesAction({ page: 1, pageSize: 100 }),
  getTagsAction({ page: 1, pageSize: 100 }),
]);

const indexModel = buildBlogIndexModel({
  blogs: blogsResult.data?.lists ?? [],
  page,
  hasActiveFilters,
});
```

```tsx
// components/blog/blog-content.tsx
export default function BlogContent({ content }: { content: string }) {
  return (
    <div className="brand-prose mx-auto w-full">
      <Viewer value={content} plugins={plugins} />
    </div>
  );
}
```

```tsx
// components/blog/table-of-contents.tsx
document.querySelectorAll(".brand-prose h1, .brand-prose h2, .brand-prose h3");
```

- [ ] **Step 5: 改写文章详情页头部和目录，统一新品牌语气**

```tsx
// app/(site)/blog/[slug]/page.tsx
const readingTime = getReadingMinutes(blog.content);

return (
  <main className="brand-shell grid gap-10 pb-20 pt-10 lg:grid-cols-[minmax(0,1fr)_240px]">
    <article className="min-w-0">
      <Link href="/blog" className="text-sm text-[#4b4b4b] hover:text-black">
        返回博客
      </Link>
      <header className="mt-6 border-b border-black/10 pb-8">
        <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">
          {blog.category?.name ?? "文章"}
        </p>
        <h1 className="mt-3 font-[family:var(--font-display)] text-4xl font-bold tracking-[-0.04em] text-black md:text-6xl">
          {blog.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#4b4b4b]">
          <span>{formatSimpleDate(new Date(blog.createdAt))}</span>
          <span>·</span>
          <span>{readingTime} 分钟阅读</span>
        </div>
      </header>
      <div className="mt-10">
        <BlogContent content={blog.content} />
      </div>
    </article>
    <aside className="hidden lg:block">
      <TableOfContents />
    </aside>
  </main>
);
```

- [ ] **Step 6: 重新运行博客 helper 测试**

Run: `pnpm exec vitest run tests/lib/site/blog.test.ts`
Expected: PASS，featured 展示规则与阅读时长计算都正确。

- [ ] **Step 7: 提交**

```bash
git add lib/site/blog.ts 'app/(site)/blog/page.tsx' 'app/(site)/blog/[slug]/page.tsx' components/blog/blog-filter-bar.tsx components/blog/blog-list.tsx components/blog/blog-card.tsx components/blog/blog-content.tsx components/blog/table-of-contents.tsx tests/lib/site/blog.test.ts
git commit -m "feat(blog): rebuild discovery and article pages"
```

### Task 8: 重建关于页、更新日志、登录页和错误页

**Files:**
- Create: `components/site/about/about-hero.tsx`
- Create: `components/site/about/profile-story.tsx`
- Create: `components/site/about/tech-stack.tsx`
- Create: `components/site/about/work-style.tsx`
- Create: `components/site/about/external-links.tsx`
- Create: `components/site/changelog/changelog-timeline.tsx`
- Modify: `app/(site)/about/page.tsx`
- Modify: `app/(site)/changelog/page.tsx`
- Modify: `app/(site)/login/page.tsx`
- Modify: `app/(site)/not-found.tsx`
- Modify: `app/(site)/error.tsx`
- Create: `tests/contracts/site-secondary-routes.contract.test.ts`

- [ ] **Step 1: 写入次级站点路由约束测试**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("site secondary routes contract", () => {
  it("moves changelog back to a server-rendered page", () => {
    const source = readFileSync("app/(site)/changelog/page.tsx", "utf8");
    expect(source.startsWith("\"use client\"")).toBe(false);
  });

  it("removes gradient-heavy login styling", () => {
    const source = readFileSync("app/(site)/login/page.tsx", "utf8");
    expect(source).not.toContain("bg-gradient");
    expect(source).not.toContain("backdrop-blur");
  });

  it("localizes not-found and error routes", () => {
    const notFound = readFileSync("app/(site)/not-found.tsx", "utf8");
    const error = readFileSync("app/(site)/error.tsx", "utf8");
    expect(notFound).toContain("页面不存在");
    expect(error).toContain("发生错误");
  });
});
```

- [ ] **Step 2: 运行测试，确认次级路由仍保留旧实现**

Run: `pnpm exec vitest run tests/contracts/site-secondary-routes.contract.test.ts`
Expected: FAIL，`changelog/page.tsx` 仍是 client component，`login/page.tsx` 仍含渐变样式。

- [ ] **Step 3: 重写关于页与更新日志页**

```tsx
// app/(site)/about/page.tsx
import { SITE_PROFILE } from "@/constants/site-content";
import { AboutHero } from "@/components/site/about/about-hero";
import { ExternalLinks } from "@/components/site/about/external-links";
import { ProfileStory } from "@/components/site/about/profile-story";
import { TechStack } from "@/components/site/about/tech-stack";
import { WorkStyle } from "@/components/site/about/work-style";

export default function AboutPage() {
  return (
    <main className="brand-shell space-y-16 pb-20 pt-10 md:space-y-24">
      <AboutHero profile={SITE_PROFILE} />
      <ProfileStory profile={SITE_PROFILE} />
      <TechStack items={SITE_PROFILE.techStack} />
      <WorkStyle profile={SITE_PROFILE} />
      <ExternalLinks items={SITE_PROFILE.externalLinks} />
    </main>
  );
}
```

```tsx
// components/site/about/about-hero.tsx
import { SITE_PROFILE } from "@/constants/site-content";

export function AboutHero({
  profile,
}: {
  profile: typeof SITE_PROFILE;
}) {
  return (
    <section className="grid gap-8 border-b border-black/10 pb-12 lg:grid-cols-[minmax(0,1.1fr)_320px]">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">
          About
        </p>
        <h1 className="mt-4 font-[family:var(--font-display)] text-5xl font-bold tracking-[-0.05em] text-black md:text-6xl">
          先讲清楚我是谁，再讲清楚我为什么持续写作。
        </h1>
      </div>
      <div className="space-y-3 text-sm leading-7 text-[#4b4b4b]">
        {profile.aboutSummary.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/site/about/profile-story.tsx
import { SITE_PROFILE } from "@/constants/site-content";
import { SectionHeading } from "@/components/site/section-heading";

export function ProfileStory({
  profile,
}: {
  profile: typeof SITE_PROFILE;
}) {
  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Story"
        title="背景与成长路径"
        description="把已有信息改写成更完整的人物叙事，而不是旧卡片重新排列。"
      />
      <div className="grid gap-4">
        {profile.aboutSummary.map((item) => (
          <div
            key={item}
            className="rounded-[12px] border border-black/10 bg-white p-5 text-sm leading-7 text-black shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/site/about/tech-stack.tsx
import { SectionHeading } from "@/components/site/section-heading";

export function TechStack({ items }: { items: string[] }) {
  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Stack"
        title="技术栈"
        description="把长期使用的技术明确写出来，而不是埋在零散文案里。"
      />
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-black px-4 py-2 text-sm font-medium text-black"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/site/about/work-style.tsx
import { SITE_PROFILE } from "@/constants/site-content";
import { SectionHeading } from "@/components/site/section-heading";

export function WorkStyle({
  profile,
}: {
  profile: typeof SITE_PROFILE;
}) {
  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Work Style"
        title="工作方式与兴趣偏好"
        description="把工作方式、关注方向和长期兴趣一起组织成高密度但可扫描的段落。"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {profile.highlights.map((item) => (
          <div
            key={item}
            className="rounded-[12px] border border-black/10 bg-[#f6f6f6] p-5 text-sm leading-7 text-black"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/site/about/external-links.tsx
export function ExternalLinks({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  return (
    <section className="space-y-4 border-t border-black/10 pt-8">
      <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">
        Links
      </p>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-black px-4 py-2 text-sm font-medium text-black hover:bg-black hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// app/(site)/changelog/page.tsx
import { getChangelogsAction } from "@/app/actions/changelog";
import { ChangelogTimeline } from "@/components/site/changelog/changelog-timeline";

interface ChangelogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ChangelogPage({
  searchParams,
}: ChangelogPageProps) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const result = await getChangelogsAction({
    page,
    pageSize: 20,
    sortBy: "createdAt",
    order: "desc",
  });

  if (!result.success || !result.data) {
    throw new Error("加载更新日志失败");
  }

  return (
    <main className="brand-shell pb-20 pt-10">
      <ChangelogTimeline items={result.data.lists ?? []} page={page} total={result.data.total} />
    </main>
  );
}
```

```tsx
// components/site/changelog/changelog-timeline.tsx
import type { Changelog } from "@/types/changelog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { formatSimpleDate } from "@/lib/time";

export function ChangelogTimeline({
  items,
  page,
  total,
}: {
  items: Changelog[];
  page: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">
          Changelog
        </p>
        <h1 className="mt-3 font-[family:var(--font-display)] text-4xl font-bold tracking-[-0.04em] text-black md:text-5xl">
          更新日志
        </h1>
      </div>
      <div className="divide-y divide-black/10 rounded-[12px] border border-black/10 bg-white">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid gap-2 px-5 py-5 md:grid-cols-[180px_minmax(0,1fr)]"
          >
            <div className="text-sm text-[#4b4b4b]">
              {item.date ? formatSimpleDate(new Date(item.date)) : "-"}
            </div>
            <div>
              <p className="font-semibold text-black">{item.version}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#4b4b4b]">
                {item.content}
              </p>
            </div>
          </article>
        ))}
      </div>
      {totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            {page > 1 ? (
              <PaginationItem>
                <PaginationPrevious href={`/changelog?page=${page - 1}`} />
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <PaginationLink href={`/changelog?page=${page}`} isActive>
                {page}
              </PaginationLink>
            </PaginationItem>
            {page < totalPages ? (
              <PaginationItem>
                <PaginationNext href={`/changelog?page=${page + 1}`} />
              </PaginationItem>
            ) : null}
          </PaginationContent>
        </Pagination>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 4: 重写登录页和错误路由**

```tsx
// app/(site)/login/page.tsx
return (
  <main className="brand-shell grid min-h-[100dvh] items-center py-10 lg:grid-cols-[1.1fr_0.9fr]">
    <section className="border-b border-black/10 pb-10 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
      <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">Admin Access</p>
      <h1 className="mt-4 font-[family:var(--font-display)] text-4xl font-bold tracking-[-0.04em] text-black md:text-6xl">
        登录后进入你的发布控制台。
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-[#4b4b4b]">
        这里只服务单人内容发布流程，不承担多用户管理和站点配置中心职责。
      </p>
    </section>
    <section className="pt-10 lg:pl-12 lg:pt-0">
      <div className="rounded-[12px] border border-black bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          {isSignUp ? (
            <Input
              placeholder="你的昵称"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          ) : null}
          <Input
            type="email"
            placeholder="邮箱地址"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            {isSignUp ? "创建账号" : "登录"}
          </Button>
        </form>
        <Button
          type="button"
          variant="secondary"
          onClick={handleSocialSignIn}
          className="mt-3 w-full"
        >
          使用 GitHub 登录
        </Button>
      </div>
    </section>
  </main>
);
```

```tsx
// app/(site)/not-found.tsx
<ErrorView
  code="404"
  title="页面不存在"
  message="你访问的页面已经不存在，或者链接地址已经变更。"
/>
```

```tsx
// app/(site)/error.tsx
<ErrorView
  code="500"
  title="发生错误"
  message="页面加载失败，请重试或返回首页继续浏览。"
  onRetry={() => reset()}
/>
```

- [ ] **Step 5: 重新运行次级路由约束测试**

Run: `pnpm exec vitest run tests/contracts/site-secondary-routes.contract.test.ts`
Expected: PASS，更新日志切回 server component，登录页无渐变毛玻璃，错误页文案已本地化。

- [ ] **Step 6: 提交**

```bash
git add components/site/about/about-hero.tsx components/site/about/profile-story.tsx components/site/about/tech-stack.tsx components/site/about/work-style.tsx components/site/about/external-links.tsx components/site/changelog/changelog-timeline.tsx 'app/(site)/about/page.tsx' 'app/(site)/changelog/page.tsx' 'app/(site)/login/page.tsx' 'app/(site)/not-found.tsx' 'app/(site)/error.tsx' tests/contracts/site-secondary-routes.contract.test.ts
git commit -m "feat(site): rebuild about changelog and auth routes"
```

### Task 9: 重建后台壳层与仪表盘

**Files:**
- Create: `components/admin/page-header.tsx`
- Create: `components/admin/stat-card.tsx`
- Modify: `stores/dashboard/interface.ts`
- Modify: `stores/dashboard/store.ts`
- Modify: `app/(admin)/layout.tsx`
- Modify: `app/(admin)/admin-sidebar.tsx`
- Modify: `app/(admin)/admin/page.tsx`
- Create: `tests/components/admin/admin-sidebar.test.tsx`

- [ ] **Step 1: 写入后台侧边栏测试**

```tsx
import { render, screen } from "@testing-library/react";
import { vi, describe, expect, it } from "vitest";
import { AdminSidebar } from "@/app/(admin)/admin-sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

describe("AdminSidebar", () => {
  it("shows only publishing modules", () => {
    render(
      <AdminSidebar
        user={{ name: "付小晨", role: 1, image: null }}
      />,
    );

    expect(screen.getByText("仪表盘")).toBeInTheDocument();
    expect(screen.getByText("博客管理")).toBeInTheDocument();
    expect(screen.queryByText("用户管理")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试，确认后台导航仍包含旧项**

Run: `pnpm exec vitest run tests/components/admin/admin-sidebar.test.tsx`
Expected: FAIL，当前 `AdminSidebar` 仍然渲染 `用户管理`。

- [ ] **Step 3: 调整仪表盘数据结构，去掉用户统计，补充草稿与日志摘要**

```ts
// stores/dashboard/interface.ts
import type { Blog } from "@/types/blog";
import type { Changelog } from "@/types/changelog";

export interface DashboardStats {
  blogCount: number;
  publishedBlogCount: number;
  draftBlogCount: number;
  categoryCount: number;
  tagCount: number;
  recentBlogs: Blog[];
  recentDrafts: Blog[];
  recentChangelogs: Changelog[];
}
```

```ts
// stores/dashboard/store.ts
const [
  blogCount,
  publishedBlogCount,
  draftBlogCount,
  categoryCount,
  tagCount,
  recentBlogs,
  recentDrafts,
  recentChangelogs,
] = await Promise.all([
  prisma.blog.count({ where: { deletedAt: null } }),
  prisma.blog.count({ where: { deletedAt: null, published: true } }),
  prisma.blog.count({ where: { deletedAt: null, published: false } }),
  prisma.category.count({ where: { deletedAt: null } }),
  prisma.tag.count({ where: { deletedAt: null } }),
  prisma.blog.findMany({ take: 5, where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, include: { category: true, tags: { include: { tag: true } } } }),
  prisma.blog.findMany({ take: 5, where: { deletedAt: null, published: false }, orderBy: { updatedAt: "desc" }, include: { category: true, tags: { include: { tag: true } } } }),
  prisma.changelog.findMany({ take: 4, where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
]);
```

- [ ] **Step 4: 重写后台布局、侧边栏和仪表盘页面**

```tsx
// components/admin/page-header.tsx
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.16em] text-[#4b4b4b]">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-[family:var(--font-display)] text-4xl font-bold tracking-[-0.04em] text-black">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#4b4b4b]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
```

```tsx
// components/admin/stat-card.tsx
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[12px] border border-black/10 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
      <p className="text-sm text-[#4b4b4b]">{label}</p>
      <p className="mt-2 font-[family:var(--font-display)] text-3xl font-bold tracking-[-0.04em] text-black">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-[#4b4b4b]">{hint}</p> : null}
    </div>
  );
}
```

```tsx
// app/(admin)/layout.tsx
return (
  <div className="min-h-screen bg-[#f6f6f6] text-black">
    <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[280px_minmax(0,1fr)]">
      <AdminSidebar user={{ name: session.user.name, role: session.user.role ?? 2, image: session.user.image }} />
      <main className="min-w-0 px-4 py-6 md:px-8">{children}</main>
    </div>
  </div>
);
```

```tsx
// app/(admin)/admin-sidebar.tsx
<aside className="border-r border-black/10 bg-white px-4 py-5">
  <div className="flex items-center gap-3 border-b border-black/10 pb-5">
    <Image src="/images/logo.svg" alt="付小晨" width={28} height={28} />
    <div>
      <p className="font-[family:var(--font-display)] text-lg font-bold tracking-[-0.03em]">
        付小晨
      </p>
      <p className="text-sm text-[#4b4b4b]">Publishing Console</p>
    </div>
  </div>
</aside>
```

```tsx
// app/(admin)/admin/page.tsx
<div className="space-y-8">
  <PageHeader
    eyebrow="Dashboard"
    title="内容发布工作台"
    description="查看草稿、已发布文章与最近更新日志，保持单人发布流程紧凑可控。"
    actions={
      <>
        <Button asChild><Link href="/admin/blogs/new">写新文章</Link></Button>
        <Button variant="secondary" asChild><Link href="/admin/changelogs">写更新日志</Link></Button>
      </>
    }
  />
</div>
```

- [ ] **Step 5: 重新运行后台侧边栏测试**

Run: `pnpm exec vitest run tests/components/admin/admin-sidebar.test.tsx`
Expected: PASS，后台主导航只保留发布相关模块。

- [ ] **Step 6: 提交**

```bash
git add components/admin/page-header.tsx components/admin/stat-card.tsx stores/dashboard/interface.ts stores/dashboard/store.ts 'app/(admin)/layout.tsx' 'app/(admin)/admin-sidebar.tsx' 'app/(admin)/admin/page.tsx' tests/components/admin/admin-sidebar.test.tsx
git commit -m "feat(admin): rebuild console shell and dashboard"
```

### Task 10: 重建博客管理列表与编辑表单

**Files:**
- Modify: `app/(admin)/admin/blogs/page.tsx`
- Modify: `app/(admin)/admin/blogs/blog-list.tsx`
- Modify: `app/(admin)/admin/blogs/blog-form.tsx`
- Modify: `app/(admin)/admin/blogs/delete-alert.tsx`
- Modify: `app/(admin)/admin/blogs/new/page.tsx`
- Modify: `app/(admin)/admin/blogs/[id]/page.tsx`
- Create: `tests/contracts/admin-blog-management.contract.test.ts`

- [ ] **Step 1: 写入博客管理契约测试**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin blog management contract", () => {
  it("stops using the deprecated AppleCard wrapper", () => {
    const list = readFileSync("app/(admin)/admin/blogs/blog-list.tsx", "utf8");
    const form = readFileSync("app/(admin)/admin/blogs/blog-form.tsx", "utf8");
    expect(list).not.toContain("AppleCard");
    expect(form).not.toContain("AppleCard");
  });

  it("keeps publishing controls visible in the editor", () => {
    const form = readFileSync("app/(admin)/admin/blogs/blog-form.tsx", "utf8");
    expect(form).toContain("published");
    expect(form).toContain("categoryId");
    expect(form).toContain("tags");
  });
});
```

- [ ] **Step 2: 运行测试，确认博客模块仍然依赖旧容器**

Run: `pnpm exec vitest run tests/contracts/admin-blog-management.contract.test.ts`
Expected: FAIL，`blog-list.tsx` 或 `blog-form.tsx` 仍包含 `AppleCard`。

- [ ] **Step 3: 重写博客列表页，收敛为编辑控制台式表格与快捷入口**

```tsx
// app/(admin)/admin/blogs/blog-list.tsx
return (
  <div className="space-y-6">
    <PageHeader
      eyebrow="Blogs"
      title="博客管理"
      description="集中处理草稿、发布状态和内容检索。"
      actions={
        <Button asChild>
          <Link href="/admin/blogs/new">新建文章</Link>
        </Button>
      }
    />

    <Card className="gap-4">
      <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <Input name="query" placeholder="搜索标题" defaultValue={title || ""} />
        <Button type="submit" variant="secondary">筛选</Button>
      </form>
    </Card>

    <Card className="overflow-hidden p-0">
      <DataTable columns={columns} data={data?.lists || []} showPagination={false} emptyText="暂无文章" />
    </Card>
  </div>
);
```

- [ ] **Step 4: 重写博客编辑表单与删除弹窗**

```tsx
// app/(admin)/admin/blogs/blog-form.tsx
return (
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标题</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="文章标题" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="article-slug" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>摘要</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="这篇文章在讲什么" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>正文</FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[320px]" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>标签</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag.id}
                      type="button"
                      variant={
                        field.value?.includes(tag.id) ? "primary" : "secondary"
                      }
                      onClick={() =>
                        field.onChange(
                          field.value?.includes(tag.id)
                            ? field.value.filter((value) => value !== tag.id)
                            : [...(field.value || []), tag.id],
                        )
                      }
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Card>
    <Card>
      <h2 className="font-[family:var(--font-display)] text-2xl font-bold tracking-[-0.04em]">
        发布设置
      </h2>
      <div className="mt-5 space-y-4">
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-[12px] border border-black/10 p-4">
              <div>
                <FormLabel>立即发布</FormLabel>
                <p className="text-sm text-[#4b4b4b]">关闭时作为草稿保存</p>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormItem>
          )}
        />
      </div>
    </Card>
  </div>
);
```

```tsx
// app/(admin)/admin/blogs/delete-alert.tsx
<AlertDialogContent className="max-w-md">
  <AlertDialogHeader>
    <AlertDialogTitle>删除文章？</AlertDialogTitle>
    <AlertDialogDescription>
      文章会被标记为已删除，并从前台列表中移除。
    </AlertDialogDescription>
  </AlertDialogHeader>
</AlertDialogContent>
```

- [ ] **Step 5: 重新运行博客管理契约测试**

Run: `pnpm exec vitest run tests/contracts/admin-blog-management.contract.test.ts`
Expected: PASS，博客管理页和编辑器不再依赖 `AppleCard`，发布字段仍然完整。

- [ ] **Step 6: 提交**

```bash
git add 'app/(admin)/admin/blogs/page.tsx' 'app/(admin)/admin/blogs/blog-list.tsx' 'app/(admin)/admin/blogs/blog-form.tsx' 'app/(admin)/admin/blogs/delete-alert.tsx' 'app/(admin)/admin/blogs/new/page.tsx' 'app/(admin)/admin/blogs/[id]/page.tsx' tests/contracts/admin-blog-management.contract.test.ts
git commit -m "feat(admin): restyle blog management surfaces"
```

### Task 11: 重建分类、标签和更新日志管理模块

**Files:**
- Modify: `app/(admin)/admin/categories/page.tsx`
- Modify: `app/(admin)/admin/categories/category-list.tsx`
- Modify: `app/(admin)/admin/categories/category-dialog.tsx`
- Modify: `app/(admin)/admin/categories/delete-alert.tsx`
- Modify: `app/(admin)/admin/tags/page.tsx`
- Modify: `app/(admin)/admin/tags/tag-list.tsx`
- Modify: `app/(admin)/admin/tags/tag-dialog.tsx`
- Modify: `app/(admin)/admin/tags/delete-alert.tsx`
- Modify: `app/(admin)/admin/changelogs/page.tsx`
- Modify: `app/(admin)/admin/changelogs/changelog-list.tsx`
- Modify: `app/(admin)/admin/changelogs/changelog-dialog.tsx`
- Modify: `app/(admin)/admin/changelogs/delete-alert.tsx`
- Create: `tests/contracts/admin-publishing-modules.contract.test.ts`

- [ ] **Step 1: 写入后台其他发布模块契约测试**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin publishing modules contract", () => {
  it("removes AppleCard from taxonomy and changelog modules", () => {
    const categoryList = readFileSync("app/(admin)/admin/categories/category-list.tsx", "utf8");
    const tagList = readFileSync("app/(admin)/admin/tags/tag-list.tsx", "utf8");
    const changelogList = readFileSync("app/(admin)/admin/changelogs/changelog-list.tsx", "utf8");

    expect(categoryList).not.toContain("AppleCard");
    expect(tagList).not.toContain("AppleCard");
    expect(changelogList).not.toContain("AppleCard");
  });

  it("keeps changelog structure aligned with version/date/content", () => {
    const dialog = readFileSync("app/(admin)/admin/changelogs/changelog-dialog.tsx", "utf8");
    expect(dialog).toContain("version");
    expect(dialog).toContain("date");
    expect(dialog).toContain("content");
  });
});
```

- [ ] **Step 2: 运行测试，确认这些模块仍然依赖旧卡片壳层**

Run: `pnpm exec vitest run tests/contracts/admin-publishing-modules.contract.test.ts`
Expected: FAIL，至少一个列表文件仍包含 `AppleCard`。

- [ ] **Step 3: 重写分类、标签列表与弹窗**

```tsx
// app/(admin)/admin/categories/category-list.tsx
<div className="space-y-6">
  <PageHeader
    eyebrow="Taxonomy"
    title="分类管理"
    description="维护博客分类，保证前台浏览路径清晰。"
    actions={<Button onClick={handleCreate}>新建分类</Button>}
  />
  <Card className="overflow-hidden p-0">
    <DataTable columns={columns} data={data?.lists || []} showPagination={false} emptyText="暂无分类" />
  </Card>
</div>
```

```tsx
// app/(admin)/admin/tags/tag-dialog.tsx
<DialogContent className="max-w-md">
  <DialogHeader>
    <DialogTitle>{tag ? "编辑标签" : "新建标签"}</DialogTitle>
    <DialogDescription>标签用于补充文章主题线索，不承担多层级内容组织。</DialogDescription>
  </DialogHeader>
</DialogContent>
```

- [ ] **Step 4: 重写更新日志管理列表与表单弹窗**

```tsx
// app/(admin)/admin/changelogs/changelog-list.tsx
<div className="space-y-6">
  <PageHeader
    eyebrow="Changelog"
    title="更新日志管理"
    description="按版本、日期和内容维护对外可读的时间线。"
    actions={<Button onClick={handleCreate}>新建日志</Button>}
  />
  <Card className="overflow-hidden p-0">
    <DataTable columns={columns} data={data?.lists || []} showPagination={false} emptyText="暂无日志" />
  </Card>
</div>
```

```tsx
// app/(admin)/admin/changelogs/changelog-dialog.tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <Input name="version" placeholder="v1.2.0" />
  <Input name="date" type="date" />
  <Textarea name="content" placeholder="- 调整首页 Hero 文案&#10;- 重做博客筛选交互" />
  <div className="flex justify-end gap-2">
    <Button variant="secondary" type="button" onClick={handleClose}>取消</Button>
    <Button type="submit">保存</Button>
  </div>
</form>
```

- [ ] **Step 5: 重新运行发布模块契约测试**

Run: `pnpm exec vitest run tests/contracts/admin-publishing-modules.contract.test.ts`
Expected: PASS，分类、标签、更新日志模块不再依赖 `AppleCard`，更新日志字段结构完整。

- [ ] **Step 6: 提交**

```bash
git add 'app/(admin)/admin/categories/page.tsx' 'app/(admin)/admin/categories/category-list.tsx' 'app/(admin)/admin/categories/category-dialog.tsx' 'app/(admin)/admin/categories/delete-alert.tsx' 'app/(admin)/admin/tags/page.tsx' 'app/(admin)/admin/tags/tag-list.tsx' 'app/(admin)/admin/tags/tag-dialog.tsx' 'app/(admin)/admin/tags/delete-alert.tsx' 'app/(admin)/admin/changelogs/page.tsx' 'app/(admin)/admin/changelogs/changelog-list.tsx' 'app/(admin)/admin/changelogs/changelog-dialog.tsx' 'app/(admin)/admin/changelogs/delete-alert.tsx' tests/contracts/admin-publishing-modules.contract.test.ts
git commit -m "feat(admin): restyle taxonomy and changelog modules"
```

### Task 12: 清理废弃实现并完成最终验证

**Files:**
- Modify: `package.json`
- Delete: `components/ui/glass-card.tsx`
- Create: `tests/contracts/deprecated-surface-contract.test.ts`

- [ ] **Step 1: 写入废弃实现清理测试**

```ts
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const runSearch = (pattern: string) => {
  try {
    return execSync(`rg -n "${pattern}" app components package.json`).toString().trim();
  } catch {
    return "";
  }
};

describe("deprecated surface contract", () => {
  it("removes theme, glass-card and ui-preview references", () => {
    expect(runSearch("ThemeProvider|ThemeToggle|glass-card|AppleCard|ui-preview")).toBe("");
  });

  it("removes next-themes and framer-motion dependencies", () => {
    expect(runSearch("next-themes|framer-motion")).toBe("");
  });
});
```

- [ ] **Step 2: 运行测试，确认遗留实现还未完全清理**

Run: `pnpm exec vitest run tests/contracts/deprecated-surface-contract.test.ts`
Expected: FAIL，只要仓库里还存在 `AppleCard` 包装、`glass-card.tsx` 或相关依赖，就会失败。

- [ ] **Step 3: 删除兼容包装并清理无用依赖**

```bash
pnpm remove next-themes framer-motion
git rm components/ui/glass-card.tsx
```

Expected: `package.json` 和 `pnpm-lock.yaml` 更新，`components/ui/glass-card.tsx` 被删除。

- [ ] **Step 4: 重新运行废弃实现清理测试**

Run: `pnpm exec vitest run tests/contracts/deprecated-surface-contract.test.ts`
Expected: PASS，仓库中不再出现 `ThemeProvider`、`ThemeToggle`、`glass-card`、`AppleCard`、`ui-preview`、`next-themes`、`framer-motion`。

- [ ] **Step 5: 运行完整测试集**

Run: `pnpm exec vitest run`
Expected: PASS，所有新增测试全部通过。

- [ ] **Step 6: 运行静态检查**

Run: `pnpm lint`
Expected: PASS，0 error。

- [ ] **Step 7: 运行生产构建**

Run: `pnpm build`
Expected: PASS，Next.js 生产构建完成，并执行 `postbuild` 生成 sitemap。

- [ ] **Step 8: 手动冒烟验证关键页面与后台流程**

```text
前台路由：
1. `/`：Hero、精选文章、最新写作、关于摘要、更新日志摘要都可见。
2. `/blog`：筛选 pill、featured 位、排序、分页、空状态正常。
3. `/blog/<slug>`：目录高亮、正文 `brand-prose`、标签和元信息正常。
4. `/about`：人物叙事、技术栈、工作方式、外链正常。
5. `/changelog`：时间线、分页、首页摘要引用内容一致。
6. `/login`、404、error：均使用新黑白体系，无渐变毛玻璃残留。

后台路由：
1. `/admin`：指标卡、最近草稿、最近日志、快捷操作正常。
2. `/admin/blogs`：搜索、新建、编辑、删除弹窗可用。
3. `/admin/categories`、`/admin/tags`：列表、弹窗、删除流程可用。
4. `/admin/changelogs`：新建、编辑、删除流程可用。
5. 后台主导航中不出现 `用户管理`。
```

- [ ] **Step 9: 提交**

```bash
git add package.json pnpm-lock.yaml tests/contracts/deprecated-surface-contract.test.ts
git rm components/ui/glass-card.tsx
git commit -m "chore: remove deprecated apple ui remnants"
```

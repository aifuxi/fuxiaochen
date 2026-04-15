# CMS UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 CMS 全量页面重构为符合 `Chen Serif` 的 `Editorial Workspace`，统一共享基础组件与后台页面骨架，同时保持现有功能、数据流和路由稳定。

**Architecture:** 先把共享 `components/ui/*` 收敛到实体表面、细边界和统一状态语言，再新增 `components/cms/*` 作为后台专属 framing primitives，最后按页面家族迁移 shell、dashboard、列表页、编辑页、设置页和 auth 页。组件测试继续使用 Vitest 的 `node` 环境，通过 `react-dom/server` 渲染纯展示组件和 class contract tests 做 TDD。

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS 4, Base UI, SWR, NiceModal, Vitest 4, Bun

---

## File Map

### Create

- `components/cms/cms-page-header.tsx` - CMS 页面统一标题区
- `components/cms/cms-section-panel.tsx` - CMS section 容器
- `components/cms/cms-metric-strip.tsx` - 轻量指标条
- `components/cms/cms-empty-state.tsx` - 统一空状态
- `components/cms/cms-feedback-panel.tsx` - 统一错误 / loading / success framing
- `components/cms/cms-sidebar-nav.tsx` - 可测试的后台导航列表
- `components/cms/cms-dashboard-panels.tsx` - dashboard / analytics 的摘要块和活动块
- `components/cms/cms-list-shell.tsx` - 列表页标题、筛选、指标、主体骨架
- `components/cms/cms-editor-layout.tsx` - 编辑页主区 + 侧栏骨架
- `components/cms/cms-settings-nav.tsx` - 设置页目录导航
- `components/cms/cms-auth-frame.tsx` - 登录 / 注册入口页骨架
- `components/ui/button-variants.test.ts`
- `components/ui/surface-components.test.tsx`
- `components/ui/editorial-controls.test.ts`
- `components/cms/cms-framing.test.tsx`
- `components/cms/cms-sidebar-nav.test.tsx`
- `components/cms/cms-dashboard-panels.test.tsx`
- `components/cms/cms-list-shell.test.tsx`
- `components/cms/cms-editor-layout.test.tsx`
- `components/cms/cms-settings-auth.test.tsx`
- `components/cms/cms-no-glass-contract.test.ts`

### Modify

- `vitest.config.ts`
- `app/globals.css`
- `components/ui/button-variants.ts`
- `components/ui/card.tsx`
- `components/ui/table.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/select.tsx`
- `components/ui/tabs.tsx`
- `components/ui/dialog.tsx`
- `components/ui/menu.tsx`
- `components/ui/badge.tsx`
- `components/ui/switch.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/avatar.tsx`
- `components/layout/cms-shell.tsx`
- `components/layout/cms-header.tsx`
- `components/layout/cms-sidebar.tsx`
- `components/blocks/cms-dashboard-overview.tsx`
- `components/blocks/cms-analytics-dashboard.tsx`
- `components/blocks/cms-article-manager.tsx`
- `components/blocks/cms-category-manager.tsx`
- `components/blocks/cms-tag-manager.tsx`
- `components/blocks/cms-project-manager.tsx`
- `components/blocks/cms-changelog-manager.tsx`
- `components/blocks/cms-friend-link-manager.tsx`
- `components/blocks/cms-user-manager.tsx`
- `components/blocks/cms-comment-manager.tsx`
- `components/blocks/cms-article-form.tsx`
- `components/blocks/cms-project-form.tsx`
- `components/blocks/cms-changelog-form.tsx`
- `components/blocks/cms-settings-manager.tsx`
- `components/blocks/auth-card.tsx`

### Delete

- `components/blocks/article-editor-shell.tsx` - 当前无引用，编辑骨架迁移完成后删除

## Task 1: 建立共享表面样式契约

**Files:**
- Create: `components/ui/button-variants.test.ts`
- Create: `components/ui/surface-components.test.tsx`
- Modify: `vitest.config.ts`
- Modify: `components/ui/button-variants.ts`
- Modify: `components/ui/card.tsx`
- Modify: `components/ui/table.tsx`

- [ ] **Step 1: 写出共享按钮和表面组件的失败测试**

```ts
// components/ui/button-variants.test.ts
import { describe, expect, it } from "vitest";
import { buttonVariants } from "@/components/ui/button-variants";

describe("buttonVariants", () => {
  it("uses editorial framing for default buttons", () => {
    const classes = buttonVariants();

    expect(classes).toContain("rounded-2xl");
    expect(classes).not.toContain("rounded-full");
    expect(classes).toContain("focus-visible:ring-4");
  });
});
```

```tsx
// components/ui/surface-components.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Card } from "@/components/ui/card";
import { Table, TableRoot } from "@/components/ui/table";

describe("surface components", () => {
  it("renders solid surfaces instead of translucent CMS shells", () => {
    const html = renderToStaticMarkup(
      <>
        <Card>Body</Card>
        <Table>
          <TableRoot />
        </Table>
      </>,
    );

    expect(html).toContain("bg-[color:var(--color-surface-1)]");
    expect(html).not.toContain("bg-white/3");
    expect(html).not.toContain("bg-white/4");
  });
});
```

- [ ] **Step 2: 运行测试，确认它们按预期失败**

Run:

```bash
bun run test -- components/ui/button-variants.test.ts components/ui/surface-components.test.tsx
```

Expected: FAIL，错误应包含 `rounded-full` 仍存在、以及 `bg-[color:var(--color-surface-1)]` 尚未出现在 `Card` / `Table` 输出中。

- [ ] **Step 3: 最小化实现共享按钮与表面语言**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    globals: false,
    include: [
      "lib/**/*.test.ts",
      "components/**/*.test.ts",
      "components/**/*.test.tsx",
    ],
  },
});
```

```ts
// components/ui/button-variants.ts
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  `
    inline-flex items-center justify-center gap-2 rounded-2xl border font-medium whitespace-nowrap transition-all
    duration-200 ease-[var(--ease-smooth)] focus-visible:outline-none focus-visible:ring-4
    focus-visible:ring-[color:var(--color-ring)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        primary: "border-primary/20 bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-[#12c48a]",
        secondary: "border-[color:var(--color-line-default)] bg-[color:var(--color-surface-2)] text-foreground hover:-translate-y-0.5 hover:border-[color:var(--color-line-strong)]",
        ghost: "border-transparent bg-transparent text-foreground hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.03)]",
        outline: "border-[color:var(--color-line-default)] bg-transparent text-foreground hover:-translate-y-0.5 hover:border-[color:var(--color-line-strong)] hover:bg-[rgba(255,255,255,0.03)]",
        destructive: "border-red-500/30 bg-red-500/12 text-red-100 hover:-translate-y-0.5 hover:border-red-400/40 hover:bg-red-500/16",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-5 text-sm",
        lg: "h-13 px-6 text-sm",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);
```

```tsx
// components/ui/card.tsx
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-6 text-card-foreground shadow-none",
        className,
      )}
      {...props}
    />
  );
}
```

```tsx
// components/ui/table.tsx
export function Table({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-[color:var(--color-surface-2)]", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors hover:bg-[rgba(255,255,255,0.025)]", className)} {...props} />;
}
```

- [ ] **Step 4: 运行测试与局部 lint，确认基础表面收口**

Run:

```bash
bun run test -- components/ui/button-variants.test.ts components/ui/surface-components.test.tsx
bun run lint -- components/ui/button-variants.ts components/ui/card.tsx components/ui/table.tsx vitest.config.ts
```

Expected: PASS，且 ESLint 无错误。

- [ ] **Step 5: 提交这一小步**

```bash
git add vitest.config.ts \
  components/ui/button-variants.ts \
  components/ui/card.tsx \
  components/ui/table.tsx \
  components/ui/button-variants.test.ts \
  components/ui/surface-components.test.tsx
git commit -m "test(ui): 添加共享表面样式契约"
```

## Task 2: 收敛输入控件与弹层样式

**Files:**
- Create: `components/ui/editorial-controls.test.ts`
- Modify: `components/ui/input.tsx`
- Modify: `components/ui/textarea.tsx`
- Modify: `components/ui/select.tsx`
- Modify: `components/ui/tabs.tsx`
- Modify: `components/ui/dialog.tsx`
- Modify: `components/ui/menu.tsx`
- Modify: `components/ui/badge.tsx`
- Modify: `components/ui/switch.tsx`
- Modify: `components/ui/checkbox.tsx`
- Modify: `components/ui/avatar.tsx`

- [ ] **Step 1: 先写出控件和弹层的样式契约测试**

```ts
// components/ui/editorial-controls.test.ts
import { describe, expect, it } from "vitest";
import { inputFrameClassName } from "@/components/ui/input";
import { textareaClassName } from "@/components/ui/textarea";
import { selectTriggerClassName, selectPopupClassName } from "@/components/ui/select";
import { dialogBackdropClassName, dialogSurfaceClassName } from "@/components/ui/dialog";
import { dropdownMenuContentClassName } from "@/components/ui/menu";

describe("editorial controls", () => {
  it("removes blur-heavy framing from controls and overlays", () => {
    expect(inputFrameClassName).toContain("bg-[color:var(--color-surface-1)]");
    expect(textareaClassName).toContain("border-[color:var(--color-line-default)]");
    expect(selectPopupClassName).not.toContain("backdrop-blur");
    expect(dialogBackdropClassName).toBe("fixed inset-0 z-40 bg-black/72");
    expect(dialogSurfaceClassName).not.toContain("bg-zinc-950/96");
    expect(dropdownMenuContentClassName).not.toContain("backdrop-blur");
  });
});
```

- [ ] **Step 2: 跑测试，确认当前控件仍保留旧样式**

Run:

```bash
bun run test -- components/ui/editorial-controls.test.ts
```

Expected: FAIL，错误应包含 `inputFrameClassName` / `selectPopupClassName` 等导出不存在，或 `backdrop-blur` 仍存在。

- [ ] **Step 3: 用最小改动把控件和弹层迁移到实体表面**

```ts
// components/ui/input.tsx
export const inputFrameClassName =
  "flex h-11 items-center gap-3 rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-4 text-sm transition-all focus-within:border-[color:var(--color-line-strong)] focus-within:bg-[color:var(--color-surface-2)] focus-within:ring-4 focus-within:ring-[color:var(--color-ring)]";
```

```ts
// components/ui/textarea.tsx
export const textareaClassName =
  "min-h-32 w-full rounded-[1.25rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-soft focus:border-[color:var(--color-line-strong)] focus:ring-4 focus:ring-[color:var(--color-ring)]";
```

```ts
// components/ui/select.tsx
export const selectTriggerClassName =
  "flex h-11 w-full items-center justify-between rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-4 text-sm text-foreground transition-all outline-none focus-visible:border-[color:var(--color-line-strong)] focus-visible:ring-4 focus-visible:ring-[color:var(--color-ring)]";

export const selectPopupClassName =
  "min-w-[var(--anchor-width)] rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-popover)] p-2 shadow-[0_22px_60px_rgba(0,0,0,0.35)]";
```

```ts
// components/ui/dialog.tsx
export const dialogBackdropClassName = "fixed inset-0 z-40 bg-black/72";
export const dialogSurfaceClassName =
  "relative w-full max-w-2xl rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.42)] outline-none";
```

```ts
// components/ui/menu.tsx
export const dropdownMenuContentClassName =
  "min-w-56 rounded-[1.25rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-popover)] p-2 shadow-[0_22px_60px_rgba(0,0,0,0.35)]";
```

```tsx
// components/ui/tabs.tsx
export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn(
        "inline-flex rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "rounded-[1rem] px-4 py-2 text-sm text-muted transition-all data-[selected]:border data-[selected]:border-[color:var(--color-line-strong)] data-[selected]:bg-[color:var(--color-surface-2)] data-[selected]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

// components/ui/badge.tsx + switch.tsx + checkbox.tsx + avatar.tsx
// Badge 改为 weak surface + hairline border；
// Switch 改为 surface-2 底色和 line-default 边框；
// Checkbox 改为 surface-1 底色并在 checked 时提升边框对比；
// Avatar 默认背景改为 surface-2，移除 bg-white/6 浮层感。
```

- [ ] **Step 4: 验证控件契约测试通过**

Run:

```bash
bun run test -- components/ui/editorial-controls.test.ts
bun run lint -- components/ui/input.tsx components/ui/textarea.tsx components/ui/select.tsx components/ui/tabs.tsx components/ui/dialog.tsx components/ui/menu.tsx components/ui/badge.tsx components/ui/switch.tsx components/ui/checkbox.tsx components/ui/avatar.tsx
```

Expected: PASS，且控件文件 lint 通过。

- [ ] **Step 5: 提交这一批控件改动**

```bash
git add components/ui/input.tsx \
  components/ui/textarea.tsx \
  components/ui/select.tsx \
  components/ui/tabs.tsx \
  components/ui/dialog.tsx \
  components/ui/menu.tsx \
  components/ui/badge.tsx \
  components/ui/switch.tsx \
  components/ui/checkbox.tsx \
  components/ui/avatar.tsx \
  components/ui/editorial-controls.test.ts
git commit -m "refactor(ui): 收敛基础控件与弹层样式"
```

## Task 3: 新建 CMS 基础 framing primitives

**Files:**
- Create: `components/cms/cms-page-header.tsx`
- Create: `components/cms/cms-section-panel.tsx`
- Create: `components/cms/cms-metric-strip.tsx`
- Create: `components/cms/cms-empty-state.tsx`
- Create: `components/cms/cms-feedback-panel.tsx`
- Create: `components/cms/cms-framing.test.tsx`

- [ ] **Step 1: 先为 CMS 骨架组件写失败测试**

```tsx
// components/cms/cms-framing.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CmsEmptyState } from "@/components/cms/cms-empty-state";
import { CmsMetricStrip } from "@/components/cms/cms-metric-strip";
import { CmsPageHeader } from "@/components/cms/cms-page-header";
import { CmsSectionPanel } from "@/components/cms/cms-section-panel";

describe("cms framing", () => {
  it("renders a shared header, section panel, empty state, and metric strip", () => {
    const html = renderToStaticMarkup(
      <>
        <CmsPageHeader title="文章" description="管理内容状态" eyebrow="Content" />
        <CmsSectionPanel title="发布状态" description="用于发布侧栏">
          <p>Body</p>
        </CmsSectionPanel>
        <CmsMetricStrip items={[{ label: "总数", value: "12" }]} />
        <CmsEmptyState title="暂无文章" description="创建第一篇内容。" />
      </>,
    );

    expect(html).toContain("Content");
    expect(html).toContain("scroll-mt-28");
    expect(html).toContain("总数");
    expect(html).not.toContain("glass-card");
  });
});
```

- [ ] **Step 2: 运行测试，确认这些骨架文件还不存在**

Run:

```bash
bun run test -- components/cms/cms-framing.test.tsx
```

Expected: FAIL，错误应为模块不存在。

- [ ] **Step 3: 创建 CMS 骨架组件**

```tsx
// components/cms/cms-page-header.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CmsPageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function CmsPageHeader({ title, description, eyebrow, meta, actions, className }: CmsPageHeaderProps) {
  return (
    <section className={cn("section-rule px-8 py-8", className)}>
      {eyebrow ? <div className="type-label mb-3">{eyebrow}</div> : null}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-4xl tracking-[-0.05em] text-foreground">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>
          {meta ? <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
```

```tsx
// components/cms/cms-section-panel.tsx
import type { ReactNode } from "react";

type CmsSectionPanelProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  id?: string;
};

export function CmsSectionPanel({ title, description, children, id }: CmsSectionPanelProps) {
  return (
    <section id={id} className="scroll-mt-28 rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)]">
      {(title || description) && (
        <header className="border-b border-[color:var(--color-line-default)] px-6 py-5">
          {title ? <h2 className="font-serif text-2xl tracking-[-0.04em]">{title}</h2> : null}
          {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
        </header>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
```

```tsx
// components/cms/cms-metric-strip.tsx
export function CmsMetricStrip({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-5">
          <div className="type-label mb-3">{item.label}</div>
          <div className="font-serif text-3xl tracking-[-0.04em]">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// components/cms/cms-empty-state.tsx
export function CmsEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-6 py-8 text-center">
      <p className="font-serif text-2xl tracking-[-0.04em] text-foreground">{title}</p>
      <p className="max-w-md text-sm leading-6 text-muted">{description}</p>
      {action}
    </div>
  );
}

// components/cms/cms-feedback-panel.tsx
export function CmsFeedbackPanel({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-6 py-8 text-center">
      <p className="font-serif text-2xl tracking-[-0.04em] text-foreground">{title}</p>
      <p className="max-w-md text-sm leading-6 text-muted">{description}</p>
      {action}
    </div>
  );
}
```

- [ ] **Step 4: 运行测试验证骨架组件通过**

Run:

```bash
bun run test -- components/cms/cms-framing.test.tsx
bun run lint -- components/cms/cms-page-header.tsx components/cms/cms-section-panel.tsx components/cms/cms-metric-strip.tsx components/cms/cms-empty-state.tsx components/cms/cms-feedback-panel.tsx
```

Expected: PASS。

- [ ] **Step 5: 提交后台基础骨架**

```bash
git add components/cms/cms-page-header.tsx \
  components/cms/cms-section-panel.tsx \
  components/cms/cms-metric-strip.tsx \
  components/cms/cms-empty-state.tsx \
  components/cms/cms-feedback-panel.tsx \
  components/cms/cms-framing.test.tsx
git commit -m "feat(cms): 添加后台基础骨架组件"
```

## Task 4: 重构 CMS shell、顶部区和导航

**Files:**
- Create: `components/cms/cms-sidebar-nav.tsx`
- Create: `components/cms/cms-sidebar-nav.test.tsx`
- Modify: `components/layout/cms-shell.tsx`
- Modify: `components/layout/cms-header.tsx`
- Modify: `components/layout/cms-sidebar.tsx`

- [ ] **Step 1: 先写后台导航的失败测试**

```tsx
// components/cms/cms-sidebar-nav.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CmsSidebarNav } from "@/components/cms/cms-sidebar-nav";

describe("CmsSidebarNav", () => {
  it("marks the active item without heavy highlight blocks", () => {
    const html = renderToStaticMarkup(
      <CmsSidebarNav
        pathname="/cms/articles"
        groups={[
          {
            label: "内容",
            items: [{ href: "/cms/articles", icon: "file-text", label: "文章" }],
          },
        ]}
      />,
    );

    expect(html).toContain("data-current=\"true\"");
    expect(html).not.toContain("bg-primary/10");
  });
});
```

- [ ] **Step 2: 运行测试，确认导航组件尚未创建**

Run:

```bash
bun run test -- components/cms/cms-sidebar-nav.test.tsx
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 抽出可测试导航组件并迁移 shell**

```tsx
// components/cms/cms-sidebar-nav.tsx
import Link from "next/link";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { cn } from "@/lib/utils";

type CmsSidebarNavProps = {
  pathname: string;
  groups: Array<{
    label: string;
    items: Array<{ href: string; icon: string; label: string }>;
  }>;
};

export function CmsSidebarNav({ pathname, groups }: CmsSidebarNavProps) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="mb-8">
          <div className="type-label px-4 pb-3">{group.label}</div>
          {group.items.map((item) => {
            const current = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                data-current={current || undefined}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all",
                  current
                    ? "border-[color:var(--color-line-strong)] bg-[rgba(16,185,129,0.08)] text-foreground"
                    : "border-transparent text-muted hover:border-[color:var(--color-line-default)] hover:bg-[rgba(255,255,255,0.025)] hover:text-foreground",
                )}
              >
                <LucideIcon className="size-4" name={item.icon as never} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
```

```tsx
// components/layout/cms-shell.tsx
import { CmsPageHeader } from "@/components/cms/cms-page-header";

export async function CmsShell({ children, description, title }: CmsShellProps) {
  const session = await requireCmsSession();

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[280px_1fr]">
      <CmsSidebar user={session.user} />
      <main className="min-w-0 border-l border-[color:var(--color-line-default)]">
        <CmsHeader user={session.user} />
        <CmsPageHeader title={title} description={description} />
        <div className="px-8 pb-10">{children}</div>
      </main>
    </div>
  );
}
```

```tsx
// components/layout/cms-header.tsx
export function CmsHeader({ user }: CmsHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-[color:var(--color-line-default)] px-8 py-4">
      <div className="type-label">Editorial Workspace</div>
      <div className="flex items-center gap-3">
        <button className="rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-3 text-muted hover:border-[color:var(--color-line-strong)] hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
        <button className="rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-3 text-muted hover:border-[color:var(--color-line-strong)] hover:text-foreground">
          <LogOut className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-surface-2)] text-sm font-semibold text-foreground">
            {getUserInitials(user.name)}
          </div>
          <div>
            <div className="text-sm text-foreground">{user.name}</div>
            <div className="text-xs text-muted">{user.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

// components/layout/cms-sidebar.tsx
export function CmsSidebar({ user }: CmsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-r border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)]">
      <div className="border-b border-[color:var(--color-line-default)] px-6 py-6">
        <div className="flex items-center gap-3 font-mono text-sm tracking-[0.24em] uppercase text-foreground">
          <span className="rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-2)] px-3 py-2">CMS</span>
          Chen Serif
        </div>
      </div>
      <nav className="px-4 py-5">
        <CmsSidebarNav pathname={pathname} groups={cmsNavGroups} />
      </nav>
      <div className="border-t border-[color:var(--color-line-default)] px-4 py-4">
        <div className="rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-2)] px-4 py-4 text-sm text-muted">
          当前登录：{user.email}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: 验证 shell 改造通过测试和 lint**

Run:

```bash
bun run test -- components/cms/cms-sidebar-nav.test.tsx components/cms/cms-framing.test.tsx
bun run lint -- components/cms/cms-sidebar-nav.tsx components/layout/cms-shell.tsx components/layout/cms-header.tsx components/layout/cms-sidebar.tsx
```

Expected: PASS。

- [ ] **Step 5: 提交 shell 与导航重构**

```bash
git add components/cms/cms-sidebar-nav.tsx \
  components/cms/cms-sidebar-nav.test.tsx \
  components/layout/cms-shell.tsx \
  components/layout/cms-header.tsx \
  components/layout/cms-sidebar.tsx
git commit -m "refactor(cms): 重构后台壳层与导航"
```

## Task 5: 统一仪表盘与分析页面板

**Files:**
- Create: `components/cms/cms-dashboard-panels.tsx`
- Create: `components/cms/cms-dashboard-panels.test.tsx`
- Modify: `components/blocks/cms-dashboard-overview.tsx`
- Modify: `components/blocks/cms-analytics-dashboard.tsx`

- [ ] **Step 1: 为 dashboard 摘要块和活动块写失败测试**

```tsx
// components/cms/cms-dashboard-panels.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CmsActivityList, CmsSummaryGrid } from "@/components/cms/cms-dashboard-panels";

describe("cms dashboard panels", () => {
  it("renders summary cards and activity items with editorial surfaces", () => {
    const html = renderToStaticMarkup(
      <>
        <CmsSummaryGrid items={[{ key: "posts", label: "文章", value: "24", meta: "本周 +2" }]} />
        <CmsActivityList items={[{ id: "1", detail: "文章已发布", meta: "5 分钟前" }]} />
      </>,
    );

    expect(html).toContain("文章");
    expect(html).toContain("文章已发布");
    expect(html).not.toContain("glass-card");
  });
});
```

- [ ] **Step 2: 运行测试，确认新面板组件不存在**

Run:

```bash
bun run test -- components/cms/cms-dashboard-panels.test.tsx
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 创建统一面板组件并迁移两个页面**

```tsx
// components/cms/cms-dashboard-panels.tsx
import { CmsSectionPanel } from "@/components/cms/cms-section-panel";

export function CmsSummaryGrid({ items }: { items: Array<{ key: string; label: string; value: string; meta: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.key} className="rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-5">
          <div className="type-label mb-4">{item.label}</div>
          <div className="font-serif text-5xl tracking-[-0.05em]">{item.value}</div>
          <div className="mt-3 text-sm text-muted">{item.meta}</div>
        </div>
      ))}
    </div>
  );
}

export function CmsActivityList({ items }: { items: Array<{ id: string; detail: string; meta: string }> }) {
  return (
    <CmsSectionPanel title="活动动态">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-2)] px-4 py-3">
            <div className="text-sm text-foreground">{item.detail}</div>
            <div className="mt-1 text-xs text-muted">{item.meta}</div>
          </li>
        ))}
      </ul>
    </CmsSectionPanel>
  );
}
```

```tsx
// components/blocks/cms-dashboard-overview.tsx
return (
  <div className="space-y-6">
    <CmsSummaryGrid items={stats.map((stat) => ({ key: stat.key, label: stat.title, value: stat.value, meta: stat.deltaLabel }))} />
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <CmsSectionPanel title="最近文章" description="最新更新的内容与发布状态。">
        <RecentArticlesTable articles={recentArticles} />
      </CmsSectionPanel>
      {activityFeed.length === 0 ? (
        <CmsEmptyState title="暂无活动记录" description="发布、评论审核和内容更新会显示在这里。" />
      ) : (
        <CmsActivityList items={activityFeed.map((item) => ({ id: item.id, detail: item.message, meta: formatRelativeTime(item.occurredAt) }))} />
      )}
    </div>
  </div>
);

// components/blocks/cms-analytics-dashboard.tsx
return (
  <div className="space-y-6">
    <CmsSummaryGrid items={summary.map((stat) => ({ key: stat.key, label: stat.title, value: stat.formattedValue, meta: stat.deltaLabel }))} />
    <CmsSectionPanel title="流量概览" description="所选报告期间的每日浏览量。">
      {error ? (
        <CmsFeedbackPanel
          title="加载分析失败"
          description={error.message || "请稍后重试。"}
          action={<Button onClick={() => void mutate()} variant="outline">重试</Button>}
        />
      ) : (
        <TrafficChart dailyMetrics={dailyMetrics} isLoading={isLoading} />
      )}
    </CmsSectionPanel>
  </div>
);
```

- [ ] **Step 4: 运行面板测试和局部 lint**

Run:

```bash
bun run test -- components/cms/cms-dashboard-panels.test.tsx
bun run lint -- components/cms/cms-dashboard-panels.tsx components/blocks/cms-dashboard-overview.tsx components/blocks/cms-analytics-dashboard.tsx
```

Expected: PASS。

- [ ] **Step 5: 提交 dashboard / analytics 重构**

```bash
git add components/cms/cms-dashboard-panels.tsx \
  components/cms/cms-dashboard-panels.test.tsx \
  components/blocks/cms-dashboard-overview.tsx \
  components/blocks/cms-analytics-dashboard.tsx
git commit -m "refactor(cms): 统一仪表盘与分析页面板"
```

## Task 6: 抽取列表页骨架并迁移所有管理页

**Files:**
- Create: `components/cms/cms-list-shell.tsx`
- Create: `components/cms/cms-list-shell.test.tsx`
- Modify: `components/blocks/cms-article-manager.tsx`
- Modify: `components/blocks/cms-category-manager.tsx`
- Modify: `components/blocks/cms-tag-manager.tsx`
- Modify: `components/blocks/cms-project-manager.tsx`
- Modify: `components/blocks/cms-changelog-manager.tsx`
- Modify: `components/blocks/cms-friend-link-manager.tsx`
- Modify: `components/blocks/cms-user-manager.tsx`
- Modify: `components/blocks/cms-comment-manager.tsx`

- [ ] **Step 1: 为列表页骨架写失败测试**

```tsx
// components/cms/cms-list-shell.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CmsListShell } from "@/components/cms/cms-list-shell";

describe("CmsListShell", () => {
  it("renders filters, metrics, and body in a fixed order", () => {
    const html = renderToStaticMarkup(
      <CmsListShell
        filters={<div>filters</div>}
        metrics={<div>metrics</div>}
      >
        <div>body</div>
      </CmsListShell>,
    );

    expect(html).toContain("filters");
    expect(html).toContain("metrics");
    expect(html).toContain("body");
    expect(html.indexOf("filters")).toBeLessThan(html.indexOf("metrics"));
  });
});
```

- [ ] **Step 2: 运行测试，确认列表骨架还不存在**

Run:

```bash
bun run test -- components/cms/cms-list-shell.test.tsx
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 创建列表骨架并把管理页迁过去**

```tsx
// components/cms/cms-list-shell.tsx
import type { ReactNode } from "react";

type CmsListShellProps = {
  filters: ReactNode;
  metrics?: ReactNode;
  children: ReactNode;
};

export function CmsListShell({ filters, metrics, children }: CmsListShellProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-5">
        {filters}
      </div>
      {metrics ? <div>{metrics}</div> : null}
      <div>{children}</div>
    </div>
  );
}
```

```tsx
// components/blocks/cms-article-manager.tsx
return (
  <CmsListShell
    filters={
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="w-full max-w-md">
            <Input onChange={(event) => setSearchValue(event.target.value)} placeholder="按标题、slug 或摘要搜索" startAdornment={<Search className="size-4" />} value={searchValue} />
          </div>
          <div className="w-full max-w-56">
            <Select onValueChange={(value) => setStatus(value as ArticleStatus | "")} options={STATUS_OPTIONS} value={status} />
          </div>
          <div className="w-full max-w-64">
            <Select onValueChange={(value) => setCategoryId(value as string)} options={[{ label: "全部分类", value: "" }, ...categories.map((category) => ({ label: category.name, value: category.id }))]} value={categoryId} />
          </div>
        </div>
        <Link href="/cms/article/new">
          <Button variant="primary">
            <Plus className="size-4" />
            新建文章
          </Button>
        </Link>
      </div>
    }
    metrics={
      <CmsMetricStrip
        items={[
          { label: "文章总数", value: String(total) },
          { label: "当前可见", value: String(articles.length) },
          { label: "筛选条件", value: status || (categoryId ? "分类" : "全部内容") },
        ]}
      />
    }
  >
    <Table>
      <TableRoot>
        <TableHead>
          <tr>
            <TableHeaderCell>文章</TableHeaderCell>
            <TableHeaderCell>分类</TableHeaderCell>
            <TableHeaderCell>状态</TableHeaderCell>
            <TableHeaderCell>标签</TableHeaderCell>
            <TableHeaderCell>更新时间</TableHeaderCell>
            <TableHeaderCell className="text-right">操作</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>{article.title}</TableCell>
              <TableCell>{article.category}</TableCell>
              <TableCell><Badge variant={statusVariantMap[article.status] ?? "info"}>{article.status}</Badge></TableCell>
              <TableCell>{article.tags.join(" / ")}</TableCell>
              <TableCell>{format(new Date(article.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost">编辑</Button>
                <Button size="sm" variant="ghost">删除</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </Table>
  </CmsListShell>
);
```

```tsx
// components/blocks/cms-comment-manager.tsx
return (
  <CmsListShell
    filters={
      <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
        <div className="w-full max-w-md">
          <Input onChange={(event) => setSearchValue(event.target.value)} placeholder="按作者、邮箱或评论内容搜索" startAdornment={<Search className="size-4" />} value={searchValue} />
        </div>
        <div className="w-full max-w-56">
          <Select onValueChange={(value) => setStatus(value as CommentStatus | "")} options={STATUS_OPTIONS} value={status} />
        </div>
        <div className="w-full max-w-72">
          <Select onValueChange={(value) => setArticleId(value as string)} options={[{ label: "全部文章", value: "" }, ...articles.map((article) => ({ label: article.title, value: article.id }))]} value={articleId} />
        </div>
      </div>
    }
  >
    {comments.length === 0 ? (
      <CmsEmptyState title="暂无评论" description="当前没有符合筛选条件的评论。" />
    ) : (
      comments.map((comment) => (
        <CmsSectionPanel key={comment.id}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">{comment.authorName}</div>
              <div className="mt-1 text-xs text-muted">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</div>
            </div>
            <Badge variant={comment.status === CommentStatus.Approved ? "success" : comment.status === CommentStatus.Pending ? "warning" : "destructive"}>
              {comment.status}
            </Badge>
          </div>
          <p className="mt-4 text-sm leading-6 text-foreground">{comment.content}</p>
        </CmsSectionPanel>
      ))
    )}
  </CmsListShell>
);
```

- [ ] **Step 4: 运行列表骨架测试，并对所有管理页做 lint**

Run:

```bash
bun run test -- components/cms/cms-list-shell.test.tsx
bun run lint -- components/cms/cms-list-shell.tsx components/blocks/cms-article-manager.tsx components/blocks/cms-category-manager.tsx components/blocks/cms-tag-manager.tsx components/blocks/cms-project-manager.tsx components/blocks/cms-changelog-manager.tsx components/blocks/cms-friend-link-manager.tsx components/blocks/cms-user-manager.tsx components/blocks/cms-comment-manager.tsx
```

Expected: PASS。

- [ ] **Step 5: 提交列表页族迁移**

```bash
git add components/cms/cms-list-shell.tsx \
  components/cms/cms-list-shell.test.tsx \
  components/blocks/cms-article-manager.tsx \
  components/blocks/cms-category-manager.tsx \
  components/blocks/cms-tag-manager.tsx \
  components/blocks/cms-project-manager.tsx \
  components/blocks/cms-changelog-manager.tsx \
  components/blocks/cms-friend-link-manager.tsx \
  components/blocks/cms-user-manager.tsx \
  components/blocks/cms-comment-manager.tsx
git commit -m "refactor(cms): 抽取列表页骨架并迁移管理页"
```

## Task 7: 统一文章、项目和更新日志编辑布局

**Files:**
- Create: `components/cms/cms-editor-layout.tsx`
- Create: `components/cms/cms-editor-layout.test.tsx`
- Modify: `components/blocks/cms-article-form.tsx`
- Modify: `components/blocks/cms-project-form.tsx`
- Modify: `components/blocks/cms-changelog-form.tsx`
- Delete: `components/blocks/article-editor-shell.tsx`

- [ ] **Step 1: 为编辑页骨架写失败测试**

```tsx
// components/cms/cms-editor-layout.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CmsEditorLayout } from "@/components/cms/cms-editor-layout";

describe("CmsEditorLayout", () => {
  it("renders a primary editor column with a secondary sidebar", () => {
    const html = renderToStaticMarkup(
      <CmsEditorLayout
        primary={<div>editor</div>}
        sidebar={<div>sidebar</div>}
      />,
    );

    expect(html).toContain("editor");
    expect(html).toContain("sidebar");
    expect(html).toContain("xl:grid-cols-[1fr_360px]");
  });
});
```

- [ ] **Step 2: 运行测试，确认编辑布局文件尚未创建**

Run:

```bash
bun run test -- components/cms/cms-editor-layout.test.tsx
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 创建编辑骨架并迁移三类表单**

```tsx
// components/cms/cms-editor-layout.tsx
import type { ReactNode } from "react";

type CmsEditorLayoutProps = {
  primary: ReactNode;
  sidebar: ReactNode;
};

export function CmsEditorLayout({ primary, sidebar }: CmsEditorLayoutProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">{primary}</div>
      <aside className="space-y-6">{sidebar}</aside>
    </div>
  );
}
```

```tsx
// components/blocks/cms-article-form.tsx
return (
  <CmsEditorLayout
    primary={
      <>
        <CmsSectionPanel title="标题与元数据">
          <Field label="标题"><Input value={values.title} onChange={(event) => setValues((currentValues) => ({ ...currentValues, title: event.target.value }))} /></Field>
          <Field label="Slug"><Input value={values.slug} onChange={(event) => setValues((currentValues) => ({ ...currentValues, slug: event.target.value }))} /></Field>
          <Field label="摘要"><Textarea value={values.excerpt} onChange={(event) => setValues((currentValues) => ({ ...currentValues, excerpt: event.target.value }))} /></Field>
        </CmsSectionPanel>
        <CmsSectionPanel title="正文">
          <Tabs defaultValue="editor">
            <TabsList>
              <TabsTrigger value="editor">编辑器</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>
            <TabsContent value="editor"><MarkdownEditor value={values.contentMarkdown} onChange={(value) => setValues((currentValues) => ({ ...currentValues, contentMarkdown: value }))} /></TabsContent>
            <TabsContent value="preview"><MarkdownViewer value={values.contentMarkdown} /></TabsContent>
          </Tabs>
        </CmsSectionPanel>
      </>
    }
    sidebar={
      <>
        <CmsSectionPanel title={isEditMode ? "正在编辑文章" : "准备发布"}>
          <Button onClick={() => void handleSubmit(ArticleStatus.Published)} type="button">发布文章</Button>
          <Button onClick={() => void handleSubmit(ArticleStatus.Draft)} type="button" variant="outline">保存草稿</Button>
        </CmsSectionPanel>
        <CmsSectionPanel title="文章设置">
          <Field label="状态"><Select options={STATUS_OPTIONS} value={values.status} onValueChange={(value) => setValues((currentValues) => ({ ...currentValues, status: value as ArticleStatus }))} /></Field>
          <Field label="分类"><Select options={categoryOptions} value={values.categoryId} onValueChange={(value) => setValues((currentValues) => ({ ...currentValues, categoryId: value as string }))} /></Field>
        </CmsSectionPanel>
      </>
    }
  />
);
```

```tsx
// components/blocks/cms-project-form.tsx
return (
  <CmsEditorLayout
    primary={
      <>
        <CmsSectionPanel title="项目信息">
          <Field label="项目名称"><Input value={values.name} onChange={(event) => setValues((currentValues) => ({ ...currentValues, name: event.target.value }))} /></Field>
          <Field label="Slug"><Input value={values.slug} onChange={(event) => setValues((currentValues) => ({ ...currentValues, slug: event.target.value }))} /></Field>
          <Field label="简介"><Textarea value={values.summary} onChange={(event) => setValues((currentValues) => ({ ...currentValues, summary: event.target.value }))} /></Field>
        </CmsSectionPanel>
        <CmsSectionPanel title="详细介绍">
          <MarkdownEditor value={values.contentMarkdown} onChange={(value) => setValues((currentValues) => ({ ...currentValues, contentMarkdown: value }))} />
        </CmsSectionPanel>
      </>
    }
    sidebar={
      <>
        <CmsSectionPanel title="发布设置">
          <Field label="分类"><Select options={CATEGORY_OPTIONS} value={values.category} onValueChange={(value) => setValues((currentValues) => ({ ...currentValues, category: value as ProjectCategory }))} /></Field>
          <label className="flex items-center gap-3 text-sm text-foreground"><Checkbox checked={values.isFeatured} onCheckedChange={(checked) => setValues((currentValues) => ({ ...currentValues, isFeatured: Boolean(checked) }))} />设为精选</label>
        </CmsSectionPanel>
        <CmsSectionPanel title="项目元数据">
          <Field label="仓库地址"><Input value={values.repositoryUrl} onChange={(event) => setValues((currentValues) => ({ ...currentValues, repositoryUrl: event.target.value }))} /></Field>
          <Field label="演示地址"><Input value={values.demoUrl} onChange={(event) => setValues((currentValues) => ({ ...currentValues, demoUrl: event.target.value }))} /></Field>
        </CmsSectionPanel>
      </>
    }
  />
);

// components/blocks/cms-changelog-form.tsx
return (
  <CmsEditorLayout
    primary={
      <>
        <CmsSectionPanel title="版本信息">
          <Field label="版本号"><Input value={values.version} onChange={(event) => setValues((currentValues) => ({ ...currentValues, version: event.target.value }))} /></Field>
          <Field label="Slug"><Input value={values.slug} onChange={(event) => setValues((currentValues) => ({ ...currentValues, slug: event.target.value }))} /></Field>
          <Field label="摘要"><Textarea value={values.summary} onChange={(event) => setValues((currentValues) => ({ ...currentValues, summary: event.target.value }))} /></Field>
        </CmsSectionPanel>
        <CmsSectionPanel title="更新内容">
          <MarkdownEditor value={values.contentMarkdown} onChange={(value) => setValues((currentValues) => ({ ...currentValues, contentMarkdown: value }))} />
        </CmsSectionPanel>
      </>
    }
    sidebar={
      <>
        <CmsSectionPanel title="发布设置">
          <Field label="状态"><Select options={STATUS_OPTIONS} value={values.status} onValueChange={(value) => setValues((currentValues) => ({ ...currentValues, status: value as ChangelogStatus }))} /></Field>
          <Field label="发布时间"><Input type="datetime-local" value={values.publishedAt} onChange={(event) => setValues((currentValues) => ({ ...currentValues, publishedAt: event.target.value }))} /></Field>
        </CmsSectionPanel>
        <CmsSectionPanel title="附加信息">
          <Field label="标签"><Input value={values.labels.join(", ")} onChange={(event) => setValues((currentValues) => ({ ...currentValues, labels: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} /></Field>
        </CmsSectionPanel>
      </>
    }
  />
);
```

```bash
rm components/blocks/article-editor-shell.tsx
```

- [ ] **Step 4: 运行编辑布局测试与 lint**

Run:

```bash
bun run test -- components/cms/cms-editor-layout.test.tsx
bun run lint -- components/cms/cms-editor-layout.tsx components/blocks/cms-article-form.tsx components/blocks/cms-project-form.tsx components/blocks/cms-changelog-form.tsx
```

Expected: PASS。

- [ ] **Step 5: 提交编辑页重构**

```bash
git add components/cms/cms-editor-layout.tsx \
  components/cms/cms-editor-layout.test.tsx \
  components/blocks/cms-article-form.tsx \
  components/blocks/cms-project-form.tsx \
  components/blocks/cms-changelog-form.tsx
git rm components/blocks/article-editor-shell.tsx
git commit -m "refactor(cms): 统一内容编辑页布局"
```

## Task 8: 收敛设置页与认证入口

**Files:**
- Create: `components/cms/cms-settings-nav.tsx`
- Create: `components/cms/cms-auth-frame.tsx`
- Create: `components/cms/cms-settings-auth.test.tsx`
- Modify: `components/blocks/cms-settings-manager.tsx`
- Modify: `components/blocks/auth-card.tsx`

- [ ] **Step 1: 先写设置导航和认证入口的失败测试**

```tsx
// components/cms/cms-settings-auth.test.tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CmsAuthFrame } from "@/components/cms/cms-auth-frame";
import { CmsSettingsNav } from "@/components/cms/cms-settings-nav";

describe("cms settings and auth framing", () => {
  it("renders a document-like settings nav and a solid auth frame", () => {
    const html = renderToStaticMarkup(
      <>
        <CmsSettingsNav activeSection="常规" sections={["常规", "外观"]} />
        <CmsAuthFrame title="登录" description="输入凭据以访问仪表盘。">
          <form />
        </CmsAuthFrame>
      </>,
    );

    expect(html).toContain("常规");
    expect(html).toContain("登录");
    expect(html).not.toContain("backdrop-blur");
    expect(html).not.toContain("btn-primary-glow");
  });
});
```

- [ ] **Step 2: 运行测试，确认新骨架不存在**

Run:

```bash
bun run test -- components/cms/cms-settings-auth.test.tsx
```

Expected: FAIL，模块不存在。

- [ ] **Step 3: 创建设置导航与 auth 骨架并迁移页面**

```tsx
// components/cms/cms-settings-nav.tsx
type CmsSettingsNavProps = {
  sections: string[];
  activeSection: string;
  onSelect?: (section: string) => void;
};

export function CmsSettingsNav({ sections, activeSection, onSelect }: CmsSettingsNavProps) {
  return (
    <div className="rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-3">
      {sections.map((section) => (
        <button
          key={section}
          type="button"
          onClick={() => onSelect?.(section)}
          className={section === activeSection
            ? "mb-1 flex w-full items-center gap-3 rounded-2xl border border-[color:var(--color-line-strong)] bg-[rgba(16,185,129,0.08)] px-4 py-3 text-sm text-foreground"
            : "mb-1 flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-muted hover:border-[color:var(--color-line-default)] hover:bg-[rgba(255,255,255,0.025)] hover:text-foreground"}
        >
          <span className="type-label">•</span>
          {section}
        </button>
      ))}
    </div>
  );
}
```

```tsx
// components/cms/cms-auth-frame.tsx
import type { ReactNode } from "react";
import Link from "next/link";

export function CmsAuthFrame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[460px]">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 no-underline">
            <span className="rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-4 py-3 font-mono text-sm tracking-[0.22em] text-foreground uppercase">CMS</span>
          </Link>
        </div>
        <div className="rounded-[1.75rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-8">
          <h1 className="font-serif text-[2rem] tracking-[-0.05em]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// components/blocks/cms-settings-manager.tsx
return (
  <div className="grid gap-8 xl:grid-cols-[240px_1fr]">
    <aside className="xl:sticky xl:top-28 xl:h-fit">
      <CmsSettingsNav activeSection={activeSection} sections={[...sections]} onSelect={(section) => setActiveSection(section)} />
    </aside>
    <form className="space-y-8" onSubmit={handleSubmit}>
      <CmsSectionPanel id={getSectionId("常规")} title="常规设置" description="站点标识、元数据和默认发布信息。">
        {/* blogName / blogUrl / contactEmail / languageCode / blogDescription */}
      </CmsSectionPanel>
      <CmsSectionPanel id={getSectionId("外观")} title="外观" description="主题、排版、颜色和本地化默认值。">
        {/* theme / fontFamily / accentColor / timezone */}
      </CmsSectionPanel>
      <div className="sticky bottom-6 z-10 rounded-[1.5rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-4">
        <Button disabled={updateMutation.isMutating} type="submit">
          保存设置
        </Button>
      </div>
    </form>
  </div>
);
```

```tsx
// components/blocks/auth-card.tsx
return (
  <CmsAuthFrame
    title={isLogin ? "登录" : "注册"}
    description={isLogin ? "输入凭据以访问仪表盘。" : "创建账户以开始发布内容。"}
  >
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isLogin ? null : <TextField autoComplete="name" disabled={isPending} label="姓名" name="name" placeholder="张三" />}
      <TextField autoComplete="email" disabled={isPending} label="邮箱" name="email" placeholder="you@example.com" type="email" />
      <TextField autoComplete={isLogin ? "current-password" : "new-password"} disabled={isPending} label="密码" name="password" placeholder="••••••••" type="password" />
      {isLogin ? null : <TextField autoComplete="new-password" disabled={isPending} label="确认密码" name="confirmPassword" placeholder="••••••••" type="password" />}
      <Button className="mt-2 w-full justify-center" disabled={isPending} type="submit">
        {isPending ? (isLogin ? "登录中..." : "创建账户...") : isLogin ? "登录" : "创建账户"}
      </Button>
    </form>
  </CmsAuthFrame>
);
```

- [ ] **Step 4: 运行设置 / 认证测试与 lint**

Run:

```bash
bun run test -- components/cms/cms-settings-auth.test.tsx
bun run lint -- components/cms/cms-settings-nav.tsx components/cms/cms-auth-frame.tsx components/blocks/cms-settings-manager.tsx components/blocks/auth-card.tsx
```

Expected: PASS。

- [ ] **Step 5: 提交设置页与认证入口改造**

```bash
git add components/cms/cms-settings-nav.tsx \
  components/cms/cms-auth-frame.tsx \
  components/cms/cms-settings-auth.test.tsx \
  components/blocks/cms-settings-manager.tsx \
  components/blocks/auth-card.tsx
git commit -m "refactor(cms): 收敛设置页与认证入口"
```

## Task 9: 清理残留玻璃态并做全量验证

**Files:**
- Create: `components/cms/cms-no-glass-contract.test.ts`
- Modify: `app/globals.css`
- Modify: 仍残留 `glass-card` / `backdrop-blur` / `bg-white/3` / `bg-white/4` 的 CMS 文件

- [ ] **Step 1: 先写一个失败检查，锁住 CMS 范围内的残留样式**

```ts
// components/cms/cms-no-glass-contract.test.ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("cms no-glass contract", () => {
  it("does not keep glass-only helpers inside CMS code paths", () => {
    const dashboard = readFileSync("components/blocks/cms-dashboard-overview.tsx", "utf8");
    const settings = readFileSync("components/blocks/cms-settings-manager.tsx", "utf8");
    const auth = readFileSync("components/blocks/auth-card.tsx", "utf8");

    expect(dashboard).not.toContain("glass-card");
    expect(settings).not.toContain("backdrop-blur");
    expect(auth).not.toContain("btn-primary-glow");
  });
});
```

- [ ] **Step 2: 运行测试和 grep，确认仍有残留**

Run:

```bash
bun run test -- components/cms/cms-no-glass-contract.test.ts
rg -n 'glass-card|backdrop-blur|bg-white/3|bg-white/4|btn-primary-glow' components/layout/cms-* components/blocks/cms-* components/blocks/auth-card.tsx
```

Expected: FAIL，`rg` 仍有输出，说明 CMS 路径内仍需收尾。

- [ ] **Step 3: 清理 CMS 残留样式，不误伤前台范围**

```css
/* app/globals.css */
/* 删除以下 block，因为 CMS 与前台范围内都不再使用 .glass-card */
/* .glass-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 100%),
    var(--color-surface-2);
  border: 1px solid var(--color-line-default);
  box-shadow: var(--shadow-card);
} */
```

```tsx
// components/blocks/auth-card.tsx
<Button className="mt-2 w-full justify-center" disabled={isPending} type="submit">
  {isPending ? (isLogin ? "登录中..." : "创建账户...") : isLogin ? "登录" : "创建账户"}
</Button>

// components/blocks/cms-dashboard-overview.tsx
<CmsFeedbackPanel
  title="加载仪表盘失败"
  description={error.message || "请稍后重试。"}
  action={<Button onClick={() => void mutate()} variant="outline">重试</Button>}
/>

// 注意：不要删除 app/globals.css 里的 .btn-primary-glow，
// 因为 components/blocks/friend-link-application-form.tsx 仍在前台范围内使用它，本计划不处理前台页面。
```

- [ ] **Step 4: 运行全量验证**

Run:

```bash
bun run test
bun run lint
bun run build
rg -n 'glass-card|backdrop-blur|bg-white/3|bg-white/4|btn-primary-glow' components/layout/cms-* components/blocks/cms-* components/blocks/auth-card.tsx
```

Expected:

- `bun run test`: PASS
- `bun run lint`: PASS
- `bun run build`: PASS
- `rg ...`: 无输出

- [ ] **Step 5: 提交最终清理与验证结果**

```bash
git add app/globals.css \
  components/cms/cms-no-glass-contract.test.ts \
  components/layout/cms-shell.tsx \
  components/layout/cms-header.tsx \
  components/layout/cms-sidebar.tsx \
  components/blocks/cms-dashboard-overview.tsx \
  components/blocks/cms-analytics-dashboard.tsx \
  components/blocks/cms-article-manager.tsx \
  components/blocks/cms-category-manager.tsx \
  components/blocks/cms-tag-manager.tsx \
  components/blocks/cms-project-manager.tsx \
  components/blocks/cms-changelog-manager.tsx \
  components/blocks/cms-friend-link-manager.tsx \
  components/blocks/cms-user-manager.tsx \
  components/blocks/cms-comment-manager.tsx \
  components/blocks/cms-article-form.tsx \
  components/blocks/cms-project-form.tsx \
  components/blocks/cms-changelog-form.tsx \
  components/blocks/cms-settings-manager.tsx \
  components/blocks/auth-card.tsx
git commit -m "refactor(cms): 完成 Chen Serif 后台工作台重构"
```

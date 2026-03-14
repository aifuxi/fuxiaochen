# Design Spec: shadcn/ui 设计系统迁移

**日期**: 2026-03-14
**状态**: 已批准
**范围**: 全量替换，将项目设计系统从 Apple Human Interface Guidelines 迁移至 shadcn/ui 标准

---

## 背景与目标

项目当前使用自定义的 Apple HIG 设计系统，通过 CSS 自定义变量（`--bg-color`、`--surface-color`、`--accent-color` 等）实现主题化，并定义了大量 Apple 专属 utility class（`apple-card`、`apple-btn-*`、`apple-input` 等）。

UI 组件层虽然已使用 shadcn/ui 的基础结构（cva、Radix UI、cn()），但颜色 token 全部引用自定义 Apple 变量，导致无法直接使用 shadcn/ui 社区生态（块、扩展组件等）。

**目标**：完全迁移至 shadcn/ui 标准设计系统，统一使用其 CSS 变量 token 体系，移除所有 Apple HIG 专属定制内容。

---

## 技术决策

- **主题**: shadcn/ui new-york 风格，Zinc 配色预设
- **Primary 色**: shadcn/ui 默认（light: 黑色，dark: 白色）
- **语义色**: 仅保留 `destructive`（error），success/warning/info 映射至通用 muted token（已知 trade-off：部分状态色视觉区分减弱）
- **Typography 组件**: 删除 `components/ui/typography/` 目录，改用 HTML 标签 + shadcn token className
- **动画/字体**: 移除 `@keyframes` 浮动动画和 `@font-face` 声明；`login/page.tsx` 使用这些动画，需单独重新设计登录页动效

---

## 第一节：CSS 变量替换（`styles/global.css`）

### 移除内容

- 所有 Apple HIG 自定义变量：`--bg-color`、`--surface-color`、`--surface-hover-color`、`--border-color`、`--accent-color`、`--accent-hover-color`、`--text-color`、`--text-color-secondary`、`--text-color-tertiary`
- 所有语义状态色变量：`--success-*`、`--warning-*`、`--error-*`、`--info-*`（共 16 个变量）
- `@keyframes`：`float-slow`、`float-medium`、`float-fast`、`fade-in-up`
- `@font-face`：Inter、JetBrains Mono
- `@theme` 中对应的 `--animate-*`、`--font-*`、`--color-bg`、`--color-surface`、`--color-surface-hover`、`--color-accent`、`--color-text-*`、`--color-success-*`、`--color-warning-*`、`--color-error-*`、`--color-info-*`、`--ease-apple`
- Apple 专属 utility class：`apple-card`、`apple-surface`、`apple-btn`、`apple-btn-primary`、`apple-btn-secondary`、`apple-btn-ghost`、`apple-input`、`text-secondary`、`text-tertiary`、`text-accent-custom`

### 需要同步修复的 `@layer base` 规则

```css
/* 修复前 */
* { border-color: var(--border-color); }
::selection { background-color: var(--accent-color); }

/* 修复后 */
* { border-color: var(--border); }
::selection { background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
```

### 新增内容

引入 shadcn/ui Zinc 主题标准 CSS 变量（`:root` + `.dark`）：

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
```

### 保留内容

- `hljs` 语法高亮变量（更新颜色引用，使用新 token 替代硬编码值）
- 滚动条样式（`::-webkit-scrollbar`）
- `blog-prose` utility（原 `apple-prose` 改名，更新颜色引用至新 token）
- `code-block-wrapper` / `copy-code-btn` utility（更新颜色引用至新 token）

---

## 第二节：UI 组件层（`components/ui/`）

### 前置步骤：更新 `components.json`

在重新添加组件前，必须先将 `components.json` 中的 `baseColor` 从 `"neutral"` 改为 `"zinc"`，否则生成的组件 token 将使用 Neutral 而非 Zinc：

```json
{
  "style": "new-york",
  "tailwind": {
    "baseColor": "zinc"
  }
}
```

### 重新添加所有 shadcn/ui 组件

```bash
pnpm dlx shadcn@latest add --all --overwrite
```

覆盖已安装的所有标准 shadcn 组件，使其颜色 token 完全对齐 shadcn/ui Zinc 标准。

### 删除组件

- `components/ui/typography/` 目录下全部文件：`title.tsx`、`text.tsx`、`paragraph.tsx`、`link.tsx`

### 保留并手动更新 token 的自定义组件

以下组件不在 shadcn/ui 注册表中，保留实现但将颜色 token 替换为新体系：

| 文件 | 说明 | 额外注意 |
|---|---|---|
| `back-to-top.tsx` | 自定义交互组件 | — |
| `data-table.tsx` / `data-table-*.tsx` | 自定义数据表格 | — |
| `error-view.tsx` | 自定义错误页 | — |
| `glass-card.tsx` | 自定义玻璃卡片 | 导出名称为 `AppleCard`，需同步改名为 `GlassCard` |

---

## 第三节：Token 替换映射（全局）

适用范围：`components/ui/`（自定义部分）、`components/blog/`、`components/admin/`、`components/layout/`、`app/` 中所有使用了旧 token 的文件。

> ⚠️ **重要**：不要机械全局替换。涉及"选中状态"或"激活状态"语义色（如 `bg-info text-white` 用于选中态）的地方，需人工核查并改用 `bg-primary text-primary-foreground`，而非通用的 `bg-muted`。

### 标准 Token 映射

| 原 Apple Token | 替换为 shadcn Token |
|---|---|
| `bg-surface` | `bg-muted` |
| `bg-surface-hover` / `hover:bg-surface-hover` | `bg-accent` / `hover:bg-accent` |
| `text-text` | `text-foreground` |
| `text-text-secondary` | `text-muted-foreground` |
| `text-text-tertiary` | `text-muted-foreground` |
| `border-border` | `border-border` ✅ 不变 |
| `bg-accent` | `bg-primary` |
| `text-accent` | `text-primary` |
| `bg-accent-hover-color` / `hover:bg-accent-hover-color` | `bg-primary/90` |
| `ease-apple` | `ease-in-out` |
| `text-error` | `text-destructive` |
| `bg-error` | `bg-destructive` |
| `hover:bg-error-hover-color` | `hover:bg-destructive/90` |

### 语义状态色映射（降级为通用 token）

| 原 Token | 替换为 | 说明 |
|---|---|---|
| `text-success` | `text-muted-foreground` | — |
| `bg-success` / `hover:bg-success-hover` | `bg-muted` | — |
| `bg-success-bg` | `bg-muted` | — |
| `border-success-border` | `border-border` | — |
| `text-warning` | `text-muted-foreground` | — |
| `bg-warning-bg` | `bg-muted` | — |
| `border-warning-border` | `border-border` | — |
| `text-info` | `text-muted-foreground` | — |
| `bg-info` | `bg-muted`（普通背景场景）/ `bg-primary`（选中态，需人工判断） | — |
| `bg-info/10` / `bg-info/20` | `bg-primary/10` | 装饰性透明度变体 |
| `bg-info-bg` | `bg-muted` | — |
| `border-info-border` | `border-border` | — |

### 特殊场景：需人工处理的文件

以下文件使用了语义色或动画 token，不能机械替换，需人工处理：

| 文件 | 问题 | 处理方式 |
|---|---|---|
| `app/(site)/login/page.tsx` | 大量使用 `animate-float-slow/medium/fast`、`animate-fade-in-up` | 动画移除后需重新设计登录页动效，可用 `tw-animate-css` 中的替代动画或去掉动效 |
| `app/(site)/page.tsx` | 使用 `bg-info/20` 作为装饰性模糊光圈 | 改为 `bg-primary/10` 或 `bg-muted` |
| `app/(site)/about/page.tsx` | `bg-success` 用于"在线"状态 ping 动画，`text-info`/`text-warning` 用于技术标签色区分，`bg-info/10`/`bg-info/20` 用于装饰背景 | `bg-success` ping 点改为 `bg-primary`；技术标签改为 `bg-secondary text-secondary-foreground`；装饰背景改为 `bg-primary/10` |
| `components/blog/blog-filter-bar.tsx` | `bg-info text-white` 用于选中状态 | 改为 `bg-primary text-primary-foreground` |
| `components/blog/table-of-contents.tsx` | DOM querySelector 字符串硬编码 `".apple-prose h1, .apple-prose h2, .apple-prose h3"` | 改为 `".blog-prose h1, .blog-prose h2, .blog-prose h3"` |
| `app/(admin)/admin/blogs/blog-form.tsx` | 使用 `apple-prose` 作为 ByteMD 编辑器预览区的包裹类 | 改为 `blog-prose` |

### Typography 组件替换

删除 `components/ui/typography/` 后，以下文件有 import 需要替换：

- `components/blog/blog-card.tsx`
- `app/(site)/ui-preview/components/section-wrapper.tsx`
- `app/(site)/ui-preview/page.tsx`
- `app/(site)/ui-preview/typography-preview.tsx`
- `app/(site)/login/page.tsx`
- `app/(site)/ui-preview/preview-card.tsx`
- `app/(site)/blog/[slug]/page.tsx`
- `app/(site)/changelog/page.tsx`

替换示例：

```tsx
// 标题
// 之前: <Title level={2}>标题</Title>
<h2 className="text-xl font-semibold text-foreground">标题</h2>

// 副文本
// 之前: <Text variant="secondary">副文本</Text>
<span className="text-sm text-muted-foreground">副文本</span>

// 段落
// 之前: <Paragraph>内容</Paragraph>
<p className="text-sm text-foreground leading-relaxed">内容</p>

// 链接
// 之前: <Link href="...">链接</Link>
<a href="..." className="text-primary hover:underline">链接</a>
```

---

## 第四节：CLAUDE.md 更新

### 移除

- "设计系统：Apple Human Interface Guidelines" 整个章节
- 配色方案表格（Light/Dark Mode）
- 语义化颜色表格（success/warning/error/info）
- 圆角系统说明
- 阴影系统说明
- 过渡动画说明（`--ease-apple`）
- 字体说明
- 组件样式指南（Button/Input/Card/Dialog/Table 的 Apple 规范）
- 代码高亮（`apple-prose` 引用）

### 新增

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
- 禁止使用 Tailwind 原生色（`blue-500`、`green-600` 等）用于语义色
- 禁止使用已移除的 Apple HIG token（`bg-surface`、`text-text`、`bg-accent`（旧含义）等）

### 组件规范

- 优先使用 shadcn/ui 原生 variant，不自造 utility class
- 组件颜色通过 variant 控制，不通过 className 覆盖颜色
- 博客内容区使用 `blog-prose` 类（原 `apple-prose`）
```

### 保留不变

- NiceModal 管理规范
- Interface-First 数据流架构
- 命名约定
- 权限认证说明（`checkAdmin`）
- 数据库软删除说明
- 常用命令、技术栈、项目目录结构、业务模块说明

---

## 执行顺序

1. **更新 `components.json`**：将 `baseColor` 改为 `"zinc"`
2. **更新 `styles/global.css`**：替换 CSS 变量体系，修复 `@layer base`，移除 Apple 专属内容，`apple-prose` 改名为 `blog-prose`
3. **重新添加 shadcn/ui 组件**：`pnpm dlx shadcn@latest add --all --overwrite`
4. **删除 `components/ui/typography/` 目录**
5. **批量替换标准 token**：按映射表处理，逐文件核查上下文（勿机械替换）
6. **人工处理特殊文件**：`login/page.tsx`、`about/page.tsx`、`blog-filter-bar.tsx`、`table-of-contents.tsx`
7. **替换所有 typography 组件引用**：处理上文列出的 8 个文件
8. **更新保留的自定义组件**：`back-to-top`、`data-table-*`、`error-view`、`glass-card`（同时改名为 `GlassCard`）
9. **更新 `CLAUDE.md`**
10. **运行 `pnpm lint`**，修复类型/样式问题

---

## 风险与注意事项

- `apple-prose` 改名为 `blog-prose`，需同步更新所有引用（含 `table-of-contents.tsx` 中的 DOM querySelector 字符串）
- `ease-apple` 移除后统一改为 `ease-in-out`，各组件过渡感略有变化
- `animate-float-*` 动画被移除，`login/page.tsx` 登录页需重新设计动效
- success/warning/info 语义色降级为 muted，视觉上状态区分减弱，属于已知 trade-off
- `about/page.tsx` 的在线状态 ping 点和技术标签色会发生视觉变化，需人工确认效果
- `glass-card.tsx` 导出名由 `AppleCard` 改为 `GlassCard`，所有调用处需更新
- `components.json` 的 `baseColor` 必须在运行 `shadcn add` 前更新，否则生成组件 token 将错误

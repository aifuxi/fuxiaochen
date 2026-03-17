# UI Design Guide

> 一套以暗色模式为主、极简技术感风格的前端设计规范。
> 定位参考：Vercel / Linear
> 所有代码均可直接复制使用，无外部依赖（除 CDN 资源外）。

---

## 目录

- [UI Design Guide](#ui-design-guide)
  - [目录](#目录)
  - [1. 设计理念](#1-设计理念)
  - [2. 依赖与 CDN](#2-依赖与-cdn)
  - [3. 色彩系统](#3-色彩系统)
    - [3.1 暗色模式（默认）](#31-暗色模式默认)
    - [3.2 亮色模式](#32-亮色模式)
    - [3.3 色彩使用规则](#33-色彩使用规则)
  - [4. 字体系统](#4-字体系统)
    - [字号规范](#字号规范)
    - [字重规范](#字重规范)
    - [字距规范](#字距规范)
    - [行高规范](#行高规范)
  - [5. 间距系统](#5-间距系统)
  - [6. 圆角系统](#6-圆角系统)
  - [7. 阴影系统](#7-阴影系统)
  - [8. 背景与纹理](#8-背景与纹理)
    - [点阵背景（签名式）](#点阵背景签名式)
    - [导航毛玻璃（滚动触发）](#导航毛玻璃滚动触发)
  - [9. 组件规范](#9-组件规范)
    - [9.1 导航栏 Nav](#91-导航栏-nav)
    - [9.2 按钮 Button](#92-按钮-button)
    - [9.3 卡片 Card](#93-卡片-card)
    - [9.4 标签 Tag / Badge](#94-标签-tag--badge)
    - [9.5 表单 Form](#95-表单-form)
    - [9.6 列表项 List Item](#96-列表项-list-item)
    - [9.7 文章排版 Article](#97-文章排版-article)
    - [9.8 页脚 Footer](#98-页脚-footer)
  - [10. 动效规范](#10-动效规范)
    - [10.1 进入动画（页面加载）](#101-进入动画页面加载)
    - [10.2 滚动触发动画（Intersection Observer）](#102-滚动触发动画intersection-observer)
    - [10.3 阅读进度条](#103-阅读进度条)
    - [10.4 主题切换动画](#104-主题切换动画)
    - [10.5 动效时长参考](#105-动效时长参考)
  - [11. 响应式规范](#11-响应式规范)
  - [12. 完整 CSS 变量模板](#12-完整-css-变量模板)
  - [13. HTML 起始模板](#13-html-起始模板)

---

## 1. 设计理念

| 原则 | 说明 |
|------|------|
| **暗色优先** | 默认暗色模式，背景接近纯黑（`oklch(0.07 0 0)`），提供高对比度的内容层次 |
| **紫色调点缀** | 所有交互色、边框、卡片背景均带极淡紫色调（`hue: 280`），统一视觉语言 |
| **Mono 字体标识** | 导航 Logo、标签、日期、元数据等小文字统一使用等宽字体，强化技术感 |
| **极简边框** | 边框低对比度（`oklch(0.22)`），hover 时才提升亮度，保持界面清爽 |
| **微动效** | 所有交互反馈控制在 150–350ms，过渡以 `ease-out` / `cubic-bezier` 为主 |
| **点阵背景** | 签名式 24px 点阵 + 径向渐变遮罩，提供空间感而不喧宾夺主 |

---

## 2. 依赖与 CDN

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Geist+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

<!-- Tailwind CSS (可选，用于辅助布局) -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- 初始化 Lucide (页面底部) -->
<script>lucide.createIcons();</script>
```

**字体备选优先级：**

| 用途 | 首选 | 备选 |
|------|------|------|
| UI 正文 / 标题 | `Plus Jakarta Sans` | `DM Sans`, `system-ui` |
| 等宽 / 代码 / 标签 | `Geist Mono` | `JetBrains Mono`, `Fira Code` |
| 长文阅读正文 | `Lora` | `Playfair Display`, `Georgia` |

---

## 3. 色彩系统

### 3.1 暗色模式（默认）

```css
[data-theme="dark"] {
  /* ── 背景层级 ── */
  --background:          oklch(0.07 0 0);          /* 最深背景，接近纯黑 */
  --background-subtle:   oklch(0.10 0 0);          /* 次级背景 */
  --background-elevated: oklch(0.12 0.005 280);    /* 悬浮层/hover 背景，带紫调 */

  /* ── 文字层级 ── */
  --foreground:          oklch(0.97 0 0);          /* 主文字，近纯白 */
  --foreground-muted:    oklch(0.55 0 0);          /* 次要文字 */
  --foreground-subtle:   oklch(0.32 0 0);          /* 辅助文字，极淡 */

  /* ── 卡片 / 表面 ── */
  --card:                oklch(0.10 0.005 280);    /* 卡片背景，紫调 */
  --card-hover:          oklch(0.13 0.008 280);    /* 卡片 hover 状态 */

  /* ── 边框 ── */
  --border:              oklch(0.22 0.005 280);    /* 默认边框 */
  --border-subtle:       oklch(0.14 0.003 280);    /* 分隔线/弱边框 */
  --border-hover:        oklch(0.36 0.016 280);    /* hover 边框 */

  /* ── 主色调（紫色） ── */
  --primary:             oklch(0.72 0.12 280);     /* 主色，亮紫 */
  --primary-glow:        oklch(0.72 0.12 280 / 0.15); /* 光晕版主色 */

  /* ── 标签 ── */
  --tag-bg:              oklch(0.14 0.008 280);    /* 标签背景 */
  --tag-fg:              oklch(0.68 0.10 280);     /* 标签文字 */
  --tag-border:          oklch(0.26 0.014 280);    /* 标签边框 */

  /* ── 特殊场景 ── */
  --nav-blur-bg:         oklch(0.07 0 0 / 0.85);  /* 导航栏毛玻璃背景 */
  --code-bg:             oklch(0.11 0.006 280);    /* 代码块背景 */
  --blockquote-border:   oklch(0.72 0.12 280);     /* 引用块左边框 */
  --blockquote-bg:       oklch(0.72 0.12 280 / 0.06); /* 引用块背景 */
  --dot-color:           oklch(0.20 0 0);          /* 点阵颜色 */
}
```

### 3.2 亮色模式

```css
[data-theme="light"] {
  --background:          oklch(0.98 0 0);
  --background-subtle:   oklch(0.95 0 0);
  --background-elevated: oklch(0.93 0.003 280);
  --foreground:          oklch(0.10 0 0);
  --foreground-muted:    oklch(0.42 0 0);
  --foreground-subtle:   oklch(0.62 0 0);
  --card:                oklch(1.0 0 0);
  --card-hover:          oklch(0.97 0 0);
  --border:              oklch(0.86 0.004 280);
  --border-subtle:       oklch(0.90 0.002 280);
  --border-hover:        oklch(0.70 0.012 280);
  --primary:             oklch(0.52 0.14 280);
  --primary-glow:        oklch(0.52 0.14 280 / 0.12);
  --tag-bg:              oklch(0.94 0.006 280);
  --tag-fg:              oklch(0.48 0.12 280);
  --tag-border:          oklch(0.84 0.010 280);
  --nav-blur-bg:         oklch(0.98 0 0 / 0.88);
  --code-bg:             oklch(0.94 0.004 280);
  --blockquote-border:   oklch(0.52 0.14 280);
  --blockquote-bg:       oklch(0.52 0.14 280 / 0.05);
  --dot-color:           oklch(0.84 0 0);
}
```

### 3.3 色彩使用规则

- **禁止使用 Bootstrap 蓝** (`#007bff` / `#3b82f6`)，所有主色必须走 `hue: 280` 紫色系
- **背景层级不超过 3 层**：`background` → `background-subtle` → `background-elevated`
- **文字对比度**：正文 (`foreground`) 与背景对比度 > 7:1，`foreground-muted` 约 4.5:1
- **边框不做装饰**：边框仅用于分隔和表单，颜色保持极低对比度

---

## 4. 字体系统

```css
:root {
  --font-sans: 'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
  --font-serif: 'Lora', 'Playfair Display', Georgia, serif;
}
```

### 字号规范

| 变量 | 值 | 用途 |
|------|----|------|
| `0.65rem` | 10.4px | 节区标签、TOC 标题（全大写 + 宽字距） |
| `0.68rem` | 10.9px | 小标签文字 |
| `0.72rem` | 11.5px | 元数据、日期、footer 文字 |
| `0.75rem` | 12px | eyebrow 文字（全大写） |
| `0.78–0.82rem` | 12.5–13px | 小正文、补充说明 |
| `0.85–0.9rem` | 13.6–14.4px | 导航链接、卡片标题 |
| `0.95–1.0rem` | 15.2–16px | 列表标题、正文 |
| `1.05rem` | 16.8px | 文章副标题 |
| `1.35rem` | 21.6px | 文章 h2 |
| `clamp(1.75rem, 4vw, 2.4rem)` | 动态 | 文章主标题 |
| `clamp(2.5rem, 6vw, 3.75rem)` | 动态 | Hero 大标题 |

### 字重规范

| 值 | 用途 |
|----|------|
| `300` | 轻量正文（少用） |
| `400` | 导航链接、正文 |
| `500` | 导航 Logo、按钮、标签 |
| `600` | 卡片标题、文章 h3、加粗文字 |
| `700` | Hero 标题、文章 h1/h2 |

### 字距规范

| 场景 | letter-spacing |
|------|----------------|
| Hero 大标题 | `-0.04em` |
| 文章标题 | `-0.03em` |
| 导航 Logo（Mono） | `-0.02em` |
| 节区标签（大写） | `+0.10em` |
| Eyebrow 文字（大写） | `+0.12em` |

### 行高规范

| 场景 | line-height |
|------|-------------|
| Hero 大标题 | `1.05` |
| 文章标题 | `1.15` |
| 卡片标题 | `1.4` |
| 正文 | `1.6–1.7` |
| 长文阅读正文 | `1.8` |

---

## 5. 间距系统

```css
:root {
  --spacing: 0.25rem; /* 基础单位 = 4px */
}
```

| 名称 | 值 | 像素 |
|------|----|------|
| xs | `0.25rem` | 4px |
| sm | `0.5rem` | 8px |
| md | `0.75rem` | 12px |
| lg | `1rem` | 16px |
| xl | `1.5rem` | 24px |
| 2xl | `2rem` | 32px |
| 3xl | `3rem` | 48px |

**布局容器宽度：**

| 用途 | max-width |
|------|-----------|
| 博客正文 / 窄内容 | `720px` |
| 文章布局（含侧边栏） | `1100px`（正文列 `680px`） |
| 宽内容 / 应用布局 | `1280px` |

---

## 6. 圆角系统

```css
:root {
  --radius-sm:   0.25rem;   /* 4px  — 标签、badge */
  --radius:      0.5rem;    /* 8px  — 按钮、卡片、输入框（默认） */
  --radius-lg:   0.75rem;   /* 12px — 大卡片、模态框 */
  --radius-full: 9999px;    /* 全圆角 — pill 按钮、头像 */
}
```

---

## 7. 阴影系统

```css
:root {
  --shadow-xs:        0 1px 2px oklch(0 0 0 / 0.4);
  --shadow-sm:        0 2px 8px oklch(0 0 0 / 0.5);
  --shadow-md:        0 4px 16px oklch(0 0 0 / 0.6);
  --shadow-glow:      0 0 24px oklch(0.72 0.12 280 / 0.12);     /* 主色光晕 */
  --shadow-card-hover: 0 8px 32px oklch(0 0 0 / 0.7),
                       0 0 0 1px oklch(0.72 0.12 280 / 0.10);  /* 卡片 hover */
}
```

**使用规则：**

- 默认状态卡片：无阴影或仅 `--shadow-xs`
- hover 状态卡片：`--shadow-card-hover`（深阴影 + 紫色边框光）
- 导航 Logo 发光点：`box-shadow: 0 0 8px var(--primary)`
- 阅读进度条 / 激活指示：`box-shadow: 0 0 8px var(--primary)`

---

## 8. 背景与纹理

### 点阵背景（签名式）

```css
/* body::before 伪元素实现点阵 */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, var(--dot-color) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  z-index: 0;
}

/* body::after 径向渐变遮罩，让边缘自然消隐 */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, var(--background) 100%);
  pointer-events: none;
  z-index: 0;
}

/* 所有实际内容需要 z-index: 1 */
nav, main, footer { position: relative; z-index: 1; }
```

### 导航毛玻璃（滚动触发）

```css
nav {
  border-bottom: 1px solid transparent;
  transition: background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease;
}

nav.scrolled {
  background: var(--nav-blur-bg) !important;
  backdrop-filter: blur(12px);
  border-bottom-color: var(--border-subtle) !important;
}
```

```js
// 滚动超过 20px 触发
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});
```

---

## 9. 组件规范

### 9.1 导航栏 Nav

**结构：** Logo（左）+ 链接组（右）+ CTA 按钮（最右）

```html
<nav id="navbar">
  <!-- Logo：Mono 字体 + 脉冲光点 -->
  <a href="/" class="nav-logo">
    <span class="nav-dot"></span>
    brand.dev
  </a>

  <div class="nav-links">
    <a href="#" class="nav-link active">Blog</a>
    <a href="#" class="nav-link">Projects</a>
    <a href="#" class="nav-link">About</a>
    <!-- CTA 按钮 -->
    <a href="#" class="nav-cta">
      <i data-lucide="github" style="width:13px;height:13px;"></i>
      GitHub
    </a>
  </div>
</nav>
```

```css
nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 0 2rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.nav-logo {
  font-family: var(--font-mono) !important;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--foreground) !important;
  text-decoration: none;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 脉冲光点 */
.nav-dot {
  width: 6px; height: 6px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--primary);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.75); }
}

/* 导航链接 */
.nav-link {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--foreground-muted) !important;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius);
  transition: color 0.15s ease, background 0.15s ease;
  position: relative;
}

.nav-link:hover { color: var(--foreground) !important; background: var(--background-elevated); }

/* 激活状态：下方小圆点 */
.nav-link.active { color: var(--foreground) !important; }
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0.25rem; left: 50%;
  transform: translateX(-50%);
  width: 4px; height: 4px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--primary);
}

/* CTA 按钮（outlined 风格） */
.nav-cta {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--foreground-muted) !important;
  text-decoration: none;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex; align-items: center; gap: 0.35rem;
  transition: all 0.15s ease;
  margin-left: 0.5rem;
}

.nav-cta:hover {
  border-color: var(--border-hover);
  color: var(--foreground) !important;
  background: var(--background-elevated);
}
```

---

### 9.2 按钮 Button

```css
/* ── 基础按钮 ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  min-height: 2.25rem;
  outline: none;
  text-decoration: none;
}

.btn:disabled { pointer-events: none; opacity: 0.5; }

/* Variants */
.btn-primary {
  background-color: var(--primary);
  color: oklch(0.07 0 0);
}
.btn-primary:hover { opacity: 0.9; }

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--foreground);
}
.btn-outline:hover { background: var(--background-elevated); border-color: var(--border-hover); }

.btn-ghost {
  background: transparent;
  color: var(--foreground-muted);
}
.btn-ghost:hover { background: var(--background-elevated); color: var(--foreground); }

/* Sizes */
.btn-sm  { padding: 0.25rem 0.75rem; font-size: 0.75rem; min-height: 2rem; }
.btn-lg  { padding: 0.75rem 1.5rem; font-size: 1rem; min-height: 2.75rem; }
.btn-icon { padding: 0.5rem; width: 2.25rem; height: 2.25rem; }
```

---

### 9.3 卡片 Card

**基础卡片：**

```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  border-color: var(--border-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}
```

**项目卡片（图片 + 内容）：**

```html
<a href="#" class="project-card">
  <div class="project-img-wrap">
    <img src="..." alt="..." class="project-img" />
  </div>
  <div class="project-body">
    <div class="project-name">项目名称</div>
    <div class="project-desc">项目描述文字</div>
    <div class="project-footer">
      <span class="project-tech">React · TypeScript</span>
      <i data-lucide="arrow-up-right" style="width:13px;height:13px;"></i>
    </div>
  </div>
</a>
```

```css
.project-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.project-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.72 0.12 280 / 0.08);
}

.project-img-wrap { overflow: hidden; aspect-ratio: 16/10; background: var(--background-elevated); }
.project-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.85; transition: transform 0.35s ease; }
.project-card:hover .project-img { transform: scale(1.04); }

.project-body { padding: 0.85rem; flex: 1; }
.project-name { font-size: 0.85rem; font-weight: 600; color: var(--foreground) !important; margin-bottom: 0.25rem; }
.project-desc { font-size: 0.75rem; color: var(--foreground-subtle) !important; line-height: 1.5; margin-bottom: 0.6rem; }
.project-footer { display: flex; align-items: center; justify-content: space-between; }
.project-tech { font-family: var(--font-mono) !important; font-size: 0.65rem; color: var(--primary) !important; }
```

---

### 9.4 标签 Tag / Badge

```html
<span class="tag">design-systems</span>
<span class="post-tag">#css</span>
```

```css
/* 普通标签（较大） */
.tag {
  font-family: var(--font-mono) !important;
  font-size: 0.72rem;
  color: var(--tag-fg) !important;
  background: var(--tag-bg);
  border: 1px solid var(--tag-border);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius);
  transition: all 0.15s ease;
  cursor: default;
}

.tag:hover {
  border-color: var(--primary);
  color: var(--primary) !important;
  background: oklch(0.72 0.12 280 / 0.08);
}

/* 小标签（列表/文章内） */
.post-tag {
  font-family: var(--font-mono) !important;
  font-size: 0.68rem;
  color: var(--tag-fg) !important;
  background: var(--tag-bg);
  border: 1px solid var(--tag-border);
  padding: 0.1rem 0.45rem;
  border-radius: calc(var(--radius) - 2px);
}
```

**优先级 Badge（状态标签）：**

```css
.badge-high   { background: oklch(0.3 0.08 20 / 0.3);  color: oklch(0.80 0.15 20);  border: 1px solid oklch(0.40 0.10 20 / 0.5); }
.badge-medium { background: oklch(0.3 0.10 80 / 0.3);  color: oklch(0.85 0.12 80);  border: 1px solid oklch(0.40 0.12 80 / 0.5); }
.badge-low    { background: oklch(0.2 0.08 150 / 0.3); color: oklch(0.75 0.12 150); border: 1px solid oklch(0.35 0.10 150 / 0.5); }
```

---

### 9.5 表单 Form

```css
.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
  color: var(--foreground) !important;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
  font-family: var(--font-sans);
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px oklch(0.72 0.12 280 / 0.15);
}

.form-input::placeholder { color: var(--foreground-subtle); }
```

---

### 9.6 列表项 List Item

**带左侧高亮条的文章列表行：**

```html
<a href="#" class="post-card">
  <span class="post-date">Mar 2026</span>
  <div class="post-body">
    <div class="post-title">文章标题</div>
    <div class="post-excerpt">摘要文字...</div>
    <div class="post-tags">
      <span class="post-tag">#design</span>
    </div>
  </div>
  <i data-lucide="arrow-right" class="post-arrow" style="width:15px;height:15px;"></i>
</a>
```

```css
.post-card {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.25rem 1rem;
  border-top: 1px solid var(--border-subtle);
  text-decoration: none;
  position: relative;
  transition: background 0.2s ease;
}

.post-card:last-child { border-bottom: 1px solid var(--border-subtle); }

/* 左侧紫色高亮条：hover 时展开 */
.post-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: var(--primary);
  border-radius: 0 2px 2px 0;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 0.2s ease;
}

.post-card:hover::before { transform: scaleY(1); }
.post-card:hover { background: var(--card); }
.post-card:hover .post-title { color: var(--foreground) !important; }
.post-card:hover .post-arrow { transform: translateX(3px); color: var(--primary) !important; }

.post-date   { font-family: var(--font-mono) !important; font-size: 0.72rem; color: var(--foreground-subtle) !important; white-space: nowrap; padding-top: 0.2rem; min-width: 70px; }
.post-title  { font-size: 0.95rem; font-weight: 600; color: var(--foreground-muted) !important; margin-bottom: 0.35rem; line-height: 1.4; transition: color 0.2s ease; }
.post-excerpt { font-size: 0.82rem; color: var(--foreground-subtle) !important; line-height: 1.5; margin-bottom: 0.6rem; }
.post-arrow  { color: var(--foreground-subtle) !important; align-self: center; transition: transform 0.2s ease, color 0.2s ease; flex-shrink: 0; }
```

---

### 9.7 文章排版 Article

```css
/* 文章正文容器 */
.article-body {
  font-family: var(--font-serif) !important;
  font-size: 1.0rem;
  line-height: 1.8;
  color: var(--foreground-muted) !important;
}

/* 标题 */
.article-body h2 {
  font-family: var(--font-sans) !important;
  font-size: 1.35rem !important;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--foreground) !important;
  margin: 2.5rem 0 1rem;
}

.article-body h3 {
  font-family: var(--font-sans) !important;
  font-size: 1.05rem !important;
  font-weight: 600;
  color: var(--foreground) !important;
  margin: 2rem 0 0.75rem;
}

/* 段落 */
.article-body p { margin-bottom: 1.25rem; }

/* 链接 */
.article-body a {
  color: var(--primary) !important;
  text-decoration: underline;
  text-decoration-color: oklch(0.72 0.12 280 / 0.4);
  text-underline-offset: 3px;
  transition: text-decoration-color 0.15s ease;
}
.article-body a:hover { text-decoration-color: var(--primary); }

/* 加粗 */
.article-body strong { color: var(--foreground) !important; font-weight: 600; }

/* 行内代码 */
.article-body code {
  font-family: var(--font-mono) !important;
  font-size: 0.82em;
  background: var(--code-bg);
  border: 1px solid var(--border);
  padding: 0.1em 0.4em;
  border-radius: 0.25rem;
  color: var(--primary) !important;
}

/* 代码块 */
.article-body pre {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}
.article-body pre code {
  background: none; border: none; padding: 0;
  font-size: 0.85rem;
  color: var(--foreground-muted) !important;
}

/* 引用块 */
.article-body blockquote {
  border-left: 3px solid var(--blockquote-border);
  background: var(--blockquote-bg);
  padding: 1rem 1.25rem;
  margin: 1.75rem 0;
  border-radius: 0 var(--radius) var(--radius) 0;
  font-style: italic;
}

/* 分隔线 */
.article-body hr { border: none; border-top: 1px solid var(--border-subtle); margin: 2.5rem 0; }

/* 图片 */
.article-img {
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin: 1.75rem 0;
  opacity: 0.9;
}
.img-caption {
  font-family: var(--font-mono) !important;
  font-size: 0.72rem;
  color: var(--foreground-subtle) !important;
  text-align: center;
  margin-top: -1rem;
  margin-bottom: 1.75rem;
}
```

**文章三栏布局（正文 + 左 TOC + 右分享）：**

```css
.article-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr 680px 1fr;
  gap: 2rem;
}

@media (max-width: 900px) {
  .article-layout {
    grid-template-columns: 1fr;
    max-width: 680px;
  }
  .sidebar-left, .sidebar-right { display: none; }
}
```

---

### 9.8 页脚 Footer

```html
<footer>
  <div class="footer-inner">
    <span class="footer-copy">© 2026 Brand Name · Built with ♥</span>
    <div style="display:flex;gap:0.5rem;">
      <a href="#" class="footer-link">
        <i data-lucide="github" style="width:12px;height:12px;"></i>
        GitHub
      </a>
    </div>
  </div>
</footer>
```

```css
footer {
  border-top: 1px solid var(--border-subtle);
  padding: 2rem 0;
  position: relative;
  z-index: 1;
}

.footer-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-copy { font-family: var(--font-mono) !important; font-size: 0.72rem; color: var(--foreground-subtle) !important; }

.footer-link {
  font-family: var(--font-mono) !important;
  font-size: 0.72rem;
  color: var(--foreground-subtle) !important;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: calc(var(--radius) - 2px);
  display: flex; align-items: center; gap: 0.3rem;
  transition: color 0.15s ease, background 0.15s ease;
}

.footer-link:hover { color: var(--foreground) !important; background: var(--background-elevated); }
```

---

## 10. 动效规范

### 10.1 进入动画（页面加载）

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Hero 文字依次入场，stagger 递增 */
.hero-eyebrow { animation: fade-up 0.5s ease-out 0.10s both; }
.hero-name    { animation: fade-up 0.6s ease-out 0.20s both; }
.hero-role    { animation: fade-up 0.6s ease-out 0.35s both; }
.hero-bio     { animation: fade-up 0.6s ease-out 0.45s both; }
.hero-tags    { animation: fade-up 0.6s ease-out 0.55s both; }

/* 文章整体入场 */
article { animation: fade-up 0.6s ease-out 0.15s both; }
```

### 10.2 滚动触发动画（Intersection Observer）

```css
/* 初始状态：隐藏 + 下移 */
.post-card, .project-card, .section-header {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}

/* 进入视口后 */
.post-card.visible,
.project-card.visible,
.section-header.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // 同级元素依次错开 70ms
      const siblings = [...entry.target.parentElement.children];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 70}ms`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.post-card, .project-card, .section-header')
  .forEach(el => observer.observe(el));
```

### 10.3 阅读进度条

```css
#progress-bar {
  position: fixed;
  top: 60px; left: 0;
  height: 2px;
  background: var(--primary);
  width: 0%;
  z-index: 99;
  transition: width 0.1s linear;
  box-shadow: 0 0 8px var(--primary);
}
```

```js
window.addEventListener('scroll', () => {
  const article = document.querySelector('article');
  const total = article.offsetHeight - window.innerHeight;
  const scrolled = Math.max(0, -article.getBoundingClientRect().top);
  document.getElementById('progress-bar').style.width =
    Math.min(100, (scrolled / total) * 100) + '%';
});
```

### 10.4 主题切换动画

```css
/* 亮/暗切换时平滑过渡 */
body { transition: background-color 0.35s ease, color 0.35s ease; }

/* 主题切换按钮图标旋转 */
.theme-toggle .icon-sun,
.theme-toggle .icon-moon {
  position: absolute;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

[data-theme="dark"]  .icon-sun  { opacity: 1;  transform: rotate(0deg) scale(1); }
[data-theme="dark"]  .icon-moon { opacity: 0;  transform: rotate(-90deg) scale(0.5); }
[data-theme="light"] .icon-sun  { opacity: 0;  transform: rotate(90deg) scale(0.5); }
[data-theme="light"] .icon-moon { opacity: 1;  transform: rotate(0deg) scale(1); }
```

### 10.5 动效时长参考

| 场景 | 时长 | Easing |
|------|------|--------|
| 微交互（hover 颜色/边框） | `150ms` | `ease` |
| 按钮/导航链接过渡 | `150–200ms` | `ease` |
| 卡片 hover（位移+阴影） | `250ms` | `ease` |
| 页面元素入场 | `450–600ms` | `ease-out` |
| 侧边栏/模态框 | `350ms` | `ease-out` |
| 主题切换 | `350ms` | `ease` |

---

## 11. 响应式规范

| 断点 | 媒体查询 | 主要变化 |
|------|----------|----------|
| 移动端 | `≤ 640px` | 隐藏摘要文字、调整 nav padding、单列布局 |
| 平板 | `≤ 900px` | 隐藏文章侧边栏、切换单列 |
| 桌面 | `> 900px` | 完整三栏布局、多列项目网格 |

```css
/* 项目网格响应式 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .projects-grid { grid-template-columns: 1fr; }
}

/* 移动端导航 */
@media (max-width: 640px) {
  nav { padding: 0 1rem; }
  .post-excerpt { display: none; }
}
```

---

## 12. 完整 CSS 变量模板

```css
/* ══════════════════════════════════════════
   完整 CSS 变量模板
   可直接复制到 <style> 或 CSS 文件顶部
   ══════════════════════════════════════════ */

[data-theme="dark"],
:root {
  /* 背景 */
  --background:          oklch(0.07 0 0);
  --background-subtle:   oklch(0.10 0 0);
  --background-elevated: oklch(0.12 0.005 280);

  /* 文字 */
  --foreground:          oklch(0.97 0 0);
  --foreground-muted:    oklch(0.55 0 0);
  --foreground-subtle:   oklch(0.32 0 0);

  /* 卡片 */
  --card:                oklch(0.10 0.005 280);
  --card-hover:          oklch(0.13 0.008 280);

  /* 边框 */
  --border:              oklch(0.22 0.005 280);
  --border-subtle:       oklch(0.14 0.003 280);
  --border-hover:        oklch(0.36 0.016 280);

  /* 主色 */
  --primary:             oklch(0.72 0.12 280);
  --primary-glow:        oklch(0.72 0.12 280 / 0.15);

  /* 标签 */
  --tag-bg:              oklch(0.14 0.008 280);
  --tag-fg:              oklch(0.68 0.10 280);
  --tag-border:          oklch(0.26 0.014 280);

  /* 特殊 */
  --nav-blur-bg:         oklch(0.07 0 0 / 0.85);
  --code-bg:             oklch(0.11 0.006 280);
  --blockquote-border:   oklch(0.72 0.12 280);
  --blockquote-bg:       oklch(0.72 0.12 280 / 0.06);
  --dot-color:           oklch(0.20 0 0);

  /* 字体 */
  --font-sans:  'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif;
  --font-mono:  'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
  --font-serif: 'Lora', 'Playfair Display', Georgia, serif;

  /* 圆角 */
  --radius-sm:   0.25rem;
  --radius:      0.5rem;
  --radius-lg:   0.75rem;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-xs:         0 1px 2px oklch(0 0 0 / 0.4);
  --shadow-sm:         0 2px 8px oklch(0 0 0 / 0.5);
  --shadow-md:         0 4px 16px oklch(0 0 0 / 0.6);
  --shadow-glow:       0 0 24px oklch(0.72 0.12 280 / 0.12);
  --shadow-card-hover: 0 8px 32px oklch(0 0 0 / 0.7),
                       0 0 0 1px oklch(0.72 0.12 280 / 0.10);

  /* 间距基础单位 */
  --spacing: 0.25rem;
}

[data-theme="light"] {
  --background:          oklch(0.98 0 0);
  --background-subtle:   oklch(0.95 0 0);
  --background-elevated: oklch(0.93 0.003 280);
  --foreground:          oklch(0.10 0 0);
  --foreground-muted:    oklch(0.42 0 0);
  --foreground-subtle:   oklch(0.62 0 0);
  --card:                oklch(1.0 0 0);
  --card-hover:          oklch(0.97 0 0);
  --border:              oklch(0.86 0.004 280);
  --border-subtle:       oklch(0.90 0.002 280);
  --border-hover:        oklch(0.70 0.012 280);
  --primary:             oklch(0.52 0.14 280);
  --primary-glow:        oklch(0.52 0.14 280 / 0.12);
  --tag-bg:              oklch(0.94 0.006 280);
  --tag-fg:              oklch(0.48 0.12 280);
  --tag-border:          oklch(0.84 0.010 280);
  --nav-blur-bg:         oklch(0.98 0 0 / 0.88);
  --code-bg:             oklch(0.94 0.004 280);
  --blockquote-border:   oklch(0.52 0.14 280);
  --blockquote-bg:       oklch(0.52 0.14 280 / 0.05);
  --dot-color:           oklch(0.84 0 0);
}
```

---

## 13. HTML 起始模板

```html
<!DOCTYPE html>
<html lang="zh" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Geist+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

  <!-- Icons -->
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

  <!-- Tailwind (可选) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    /* ── 粘贴第 12 节的 CSS 变量模板 ── */

    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    body {
      font-family: var(--font-sans) !important;
      background-color: var(--background) !important;
      color: var(--foreground) !important;
      line-height: 1.6;
      min-height: 100vh;
      overflow-x: hidden;
      transition: background-color 0.35s ease, color 0.35s ease;
    }

    /* ── 点阵背景 ── */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: radial-gradient(circle, var(--dot-color) 1px, transparent 1px);
      background-size: 24px 24px;
      pointer-events: none;
      z-index: 0;
    }

    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, var(--background) 100%);
      pointer-events: none;
      z-index: 0;
      transition: background 0.35s ease;
    }

    nav, main, footer { position: relative; z-index: 1; }

    /* ── 滚动条 ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--background); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }

    /* ── 在此处添加页面样式 ── */
  </style>
</head>
<body>

  <!-- NAV -->
  <nav id="navbar">
    <a href="/" class="nav-logo">
      <span class="nav-dot"></span>
      brand.dev
    </a>
    <div class="nav-links">
      <a href="#" class="nav-link active">Home</a>
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
        <i data-lucide="sun" class="icon-sun" style="width:14px;height:14px;"></i>
        <i data-lucide="moon" class="icon-moon" style="width:14px;height:14px;"></i>
      </button>
    </div>
  </nav>

  <!-- MAIN -->
  <main>
    <!-- 页面内容 -->
  </main>

  <!-- FOOTER -->
  <footer>
    <div class="footer-inner">
      <span class="footer-copy">© 2026 Brand Name</span>
    </div>
  </footer>

  <script>
    lucide.createIcons();

    // 主题持久化
    const html = document.documentElement;
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

    document.getElementById('themeToggle')?.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });

    // 导航栏滚动效果
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  </script>

</body>
</html>
```

---

*设计规范版本：1.0 · 2026-03-17*

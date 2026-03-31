# Design Spec

## 1. 文档目标

本文档基于 `.superdesign/init/*` 与 `.superdesign/design_iterations/*` 的全部现有设计稿内容整理，输出为当前项目可直接落地的设计规范。规范以以下技术方案为准：

- Tailwind CSS v4 CSS-first tokens
- Variant-driven Design（CVA / variant props / semantic variants）
- `@radix-ui/*` 作为无头交互基础
- Next.js App Router 路由组拆分
- 现有字体体系：`Inter` / `Newsreader` / `Space Grotesk`
- 现有模态管理约束：`NiceModal`

本文档不是单纯复刻 HTML 原型，而是将原型抽象为项目级设计系统、组件分层、页面骨架和路由组织方案。

---

## 2. 设计总览

### 2.1 设计主题

设计稿呈现的是一套统一的深色内容产品系统，包含两条视觉线：

- 公开站点：偏 editorial / portfolio，强调阅读感、排版层次、氛围背景和内容卡片
- CMS 后台：偏 operational / dashboard，强调信息密度、筛选、表格、表单和管理效率

### 2.2 视觉关键词

- Dark Editorial
- Emerald Accent
- Glass Surface
- Serif + Grotesk typography pairing
- Motion with soft blur and reveal
- Quiet but high-contrast information hierarchy

### 2.3 信息架构

设计稿覆盖两大产品域：

- Public Site
  - Home
  - Articles
  - Article Detail
  - Projects
  - About
  - Changelog
  - Friends
  - Design Spec
- CMS
  - Login / Register
  - Dashboard
  - Articles
  - Create Article
  - Categories
  - Tags
  - Comments
  - Users
  - Analytics
  - Settings

---

## 3. 技术实现原则

### 3.1 设计系统实现原则

- 所有视觉 token 统一收敛到 [`styles/global.css`](../styles/global.css)
- 所有基础交互组件优先基于 `@radix-ui/*`
- 所有样式差异优先通过 variant 驱动，而不是页面内散落 class 拼接
- 所有模态类组件必须使用 NiceModal 管理，不直接暴露外部 `open` 状态
- 页面只组合布局组件、业务组件和数据，不持有重复 UI 结构
- CMS 与 Public Site 共用 token，但允许布局与组件密度不同

### 3.2 Variant-driven Design 约束

统一采用以下分层：

`base styles -> variant -> size -> state -> slot`

推荐接口形式：

```tsx
type VariantProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  tone?: "default" | "success" | "warning" | "danger";
  density?: "comfortable" | "compact";
};
```

约束：

- `variant` 表示视觉意图
- `size` 表示尺寸
- `tone` 表示语义色倾向
- `state` 由属性或 DOM 状态驱动，不新增视觉变体字段
- 复杂组件拆为 root / slot / subcomponent，不堆叠布尔 prop

### 3.3 Radix 选型原则

推荐使用：

- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-select`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-avatar`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-separator`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-switch`
- `@radix-ui/react-popover`
- `@radix-ui/react-collapsible`

避免：

- 继续依赖原型中的 Flowbite 交互实现
- 自己写 dropdown/select/dialog 的可访问性细节
- 用页面级 CSS 重复实现 overlay、focus、keyboard navigation

---

## 4. Design Tokens

### 4.1 品牌与语义色

从 `.superdesign` 提取出的核心色彩如下：

| Token | Value | 用途 |
| --- | --- | --- |
| `--color-bg` | `#050505` | 全站背景 |
| `--color-bg-elevated` | `#0a0a0a` | CMS 侧栏/高层背景 |
| `--color-fg` | `#ebebeb` | 主文本 |
| `--color-primary` | `#10b981` | 品牌强调 |
| `--color-primary-hover` | `#059669` | 主按钮 hover |
| `--color-surface` | `rgba(255,255,255,0.02)` | 卡片底色 |
| `--color-surface-hover` | `rgba(255,255,255,0.04)` | 卡片 hover |
| `--color-secondary` | `rgba(255,255,255,0.08)` | 次级底色 |
| `--color-secondary-hover` | `rgba(255,255,255,0.12)` | 次级 hover |
| `--color-muted` | `rgba(255,255,255,0.4)` | 弱文本 |
| `--color-muted-hover` | `rgba(255,255,255,0.6)` | 弱文本 hover |
| `--color-border` | `rgba(255,255,255,0.08)` | 默认边框 |
| `--color-border-hover` | `rgba(255,255,255,0.15)` | 激活边框 |
| `--color-error` | `#ef4444` | 错误/危险 |
| `--color-warning` | `#f59e0b` | 警告 |
| `--color-info` | `#3b82f6` | 信息 |

### 4.2 字体系统

延用仓库当前字体方案：

- `--font-sans`: `Inter`
- `--font-serif`: `Newsreader`
- `--font-mono`: `Space Grotesk`

角色分配：

- `Newsreader`: hero、页面标题、长文标题、重要 quote
- `Inter`: 正文、表单、导航、后台界面
- `Space Grotesk`: 标签、元信息、微文案、数字指标、按钮小写系统

### 4.3 字号体系

建议抽象为语义文本 token，而不是保留原型里的裸数值命名：

| Token | 建议值 | 用途 |
| --- | --- | --- |
| `--text-display` | `clamp(4rem, 10vw, 6.25rem)` | 首页 hero |
| `--text-h1` | `clamp(2.8rem, 6vw, 4rem)` | 一级标题 |
| `--text-h2` | `clamp(2.3rem, 5vw, 3rem)` | 二级标题 |
| `--text-h3` | `1.5rem` | 卡片/区块标题 |
| `--text-lg` | `1.125rem` | 引导文案 |
| `--text-base` | `1rem` | 正文 |
| `--text-sm` | `0.875rem` | 辅助文案 |
| `--text-xs` | `0.75rem` | label / meta |

### 4.4 间距、圆角、阴影、动效

间距不单独定义 `--spacing-*` token，直接使用 Tailwind 原生 spacing scale：

- `p-1 / p-2 / p-3 / p-4 / p-6 / p-8 / p-12`
- `gap-2 / gap-3 / gap-4 / gap-6 / gap-8 / gap-12`
- `px-4 / px-6 / px-8`
- `py-10 / py-14 / py-16 / py-24`

保留需要脱离 Tailwind 默认体系的 token：

| Token | Value |
| --- | --- |
| `--radius-sm` | `0.5rem` |
| `--radius-md` | `0.75rem` |
| `--radius-lg` | `1rem` |
| `--radius-xl` | `1.5rem` |
| `--radius-full` | `9999px` |
| `--ease-smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` |

动效规则：

- 页面首屏用 `fade / reveal / blur`
- hover 仅允许轻微 `translateY`, `border glow`, `spotlight`, `shimmer`
- 后台界面动效短、轻、快
- 长文阅读区禁止持续性抢注意力动画

### 4.5 Tailwind v4 建议写法

应将 token 收敛到 `@theme`，例如：

```css
@theme {
  --color-bg: #050505;
  --color-fg: #ebebeb;
  --color-primary: #10b981;
  --color-primary-h: #059669;
  --color-surface: rgba(255, 255, 255, 0.02);
  --color-surface-h: rgba(255, 255, 255, 0.04);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-h: rgba(255, 255, 255, 0.15);
  --color-muted: rgba(255, 255, 255, 0.4);
  --font-sans: "Inter", -apple-system, sans-serif;
  --font-serif: "Newsreader", Georgia, serif;
  --font-mono: "Space Grotesk", monospace;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 5. 视觉与交互规范

### 5.1 Surface 体系

分 4 层：

| Level | 说明 |
| --- | --- |
| `canvas` | 页面背景与氛围层 |
| `surface` | 默认卡片层 |
| `surface-elevated` | 浮层、导航、侧栏 |
| `surface-interactive` | hover / active / selected |

### 5.2 边框与特效

设计稿中高复用特效应标准化，而不是页面私有化：

- `glass`
- `spotlight`
- `shimmer-border`
- `primary-glow`
- `morph-blob`
- `scroll-reveal`

建议拆为 utility class 或 effect wrapper：

- `fx-glass`
- `fx-spotlight`
- `fx-shimmer-border`
- `fx-primary-glow`
- `fx-reveal`

### 5.3 内容排版

Public Site 排版原则：

- 标题使用 serif，正文保持中等行宽
- meta、标签、导航使用 mono/sans 小号
- 大段内容以 `max-w-prose` 或专用 `article` 容器限制宽度
- 目录 TOC 固定右侧，仅在桌面出现

CMS 排版原则：

- 标题可用 sans 或 serif 混排，但以信息清晰优先
- 表单、表格、筛选条使用统一 11/12/14/16 体系
- 数字指标可使用 mono 强化扫描速度

---

## 6. 组件分层规范

推荐目录：

```txt
components/
  ui/
  shared/
  layouts/
  site/
  cms/
  features/
```

### 6.1 原子组件 `components/ui`

职责：

- 最小可复用
- 不承载业务语义
- 仅承载视觉与可访问性交互
- 默认由 Tailwind + CVA + Radix 构成

建议保留/新增：

- `button.tsx`
- `input.tsx`
- `textarea.tsx`
- `select.tsx`
- `checkbox.tsx`
- `switch.tsx`
- `tabs.tsx`
- `dialog.tsx`
- `drawer.tsx`
- `dropdown-menu.tsx`
- `popover.tsx`
- `tooltip.tsx`
- `separator.tsx`
- `badge.tsx`
- `avatar.tsx`
- `card.tsx`
- `table.tsx`
- `pagination.tsx`
- `empty-state.tsx`
- `skeleton.tsx`
- `scroll-area.tsx`

### 6.2 共享模式组件 `components/shared`

职责：

- 原子组件之上的跨域组合
- 不绑定具体页面，但表达明确 UI 模式

建议组件：

- `section-header.tsx`
- `search-input.tsx`
- `filter-bar.tsx`
- `status-badge.tsx`
- `metric-card.tsx`
- `social-link-list.tsx`
- `tag-pill-group.tsx`
- `content-prose.tsx`
- `toc-nav.tsx`
- `empty-search-state.tsx`
- `page-hero.tsx`

### 6.3 布局组件 `components/layouts`

职责：

- 提供稳定页面框架
- 管理 header/sidebar/footer/shell
- 不处理业务数据

建议组件：

- `site-header.tsx`
- `site-footer.tsx`
- `site-shell.tsx`
- `site-section.tsx`
- `cms-sidebar.tsx`
- `cms-header.tsx`
- `cms-shell.tsx`
- `auth-shell.tsx`
- `design-spec-shell.tsx`

### 6.4 业务组件 `components/site` 与 `components/cms`

#### `components/site`

- `hero-section.tsx`
- `featured-article-card.tsx`
- `article-card.tsx`
- `article-list-row.tsx`
- `project-card.tsx`
- `friend-card.tsx`
- `timeline-changelog.tsx`
- `newsletter-form.tsx`
- `author-bio-card.tsx`
- `related-articles.tsx`

#### `components/cms`

- `stats-overview.tsx`
- `articles-table.tsx`
- `categories-table.tsx`
- `tags-table.tsx`
- `comments-table.tsx`
- `users-table.tsx`
- `analytics-chart-card.tsx`
- `settings-nav.tsx`
- `settings-section.tsx`
- `article-editor-form.tsx`
- `dashboard-activity-feed.tsx`

### 6.5 功能组件 `components/features`

用于封装数据和交互流程，避免页面直接拼装复杂逻辑：

- `features/articles/article-filters.tsx`
- `features/articles/article-search.tsx`
- `features/articles/article-pagination.tsx`
- `features/cms/articles/bulk-actions.tsx`
- `features/cms/settings/site-settings-form.tsx`
- `features/cms/auth/login-form.tsx`
- `features/cms/auth/register-form.tsx`
- `features/design-spec/design-spec-nav.tsx`

---

## 7. Variant 方案定义

### 7.1 Button

已存在 [`components/ui/button.tsx`](../components/ui/button.tsx)，方向正确，应作为标准模板。

保留 variants：

- `primary`
- `secondary`
- `ghost`
- `outline`
- `destructive`
- `link`

保留 sizes：

- `sm`
- `md`
- `lg`
- `icon`

可新增：

- `pill`
- `glow`

其中 `glow` 更适合做 `compound variant`，不建议把所有发光按钮都做成独立组件。

### 7.2 Card

建议定义：

- `variant`: `default | spotlight | shimmer | elevated | interactive`
- `padding`: `sm | md | lg`
- `density`: `comfortable | compact`

### 7.3 Badge

建议定义：

- `variant`: `neutral | success | warning | destructive | info | outline`
- `size`: `sm | md`

### 7.4 Table

表格不建议做成单一巨型组件，应该是：

- `Table` 为原子
- `DataTableToolbar`
- `DataTableEmptyState`
- `DataTablePagination`
- `RowActions`
- `BulkSelectionBar`

### 7.5 Dialog / Drawer

交互层使用 Radix，调度层必须用 NiceModal。

模式：

- `ConfirmDialog`
- `FormDialog`
- `DetailsDialog`
- `MobileDrawer`

禁止：

- 页面内部再维护一个平行的 `open` 状态
- 使用 `DialogTrigger` 作为业务入口

---

## 8. 页面到组件映射

### 8.1 Home `/`

由以下模块组成：

- `SiteHeader`
- `HomeHeroSection`
- `FeaturedArticlesSection`
- `LatestWritingsSection`
- `AboutSpotlightSection`
- `ProjectsPreviewSection`
- `NewsletterSection`
- `SiteFooter`

### 8.2 Articles `/articles`

- `SiteHeader`
- `ArchiveHero`
- `ArticleFilterPanel`
- `ArticleGrid`
- `ArchivePagination`
- `SiteFooter`

### 8.3 Article Detail `/articles/[slug]`

建议路由从原型 `/article/:slug` 收敛为 `/articles/[slug]`，更符合资源型 URL。

模块：

- `SiteHeader`
- `ArticleHero`
- `ArticleMetaBar`
- `ArticleProse`
- `ArticleToc`
- `ArticleSocialBar`
- `RelatedArticles`

### 8.4 Projects `/projects`

- `SiteHeader`
- `ProjectsHero`
- `ProjectGrid`
- `ProjectFilterBar`
- `SiteFooter`

### 8.5 About `/about`

- `SiteHeader`
- `AboutHero`
- `BioSection`
- `ExperienceTimeline`
- `PhilosophySection`
- `SiteFooter`

### 8.6 Changelog `/changelog`

- `SiteHeader`
- `ChangelogHero`
- `ReleaseTimeline`
- `SiteFooter`

### 8.7 Friends `/friends`

- `SiteHeader`
- `FriendsHero`
- `FriendsGrid`
- `FriendSubmissionForm`
- `SiteFooter`

### 8.8 Design Spec `/design-spec`

当前仓库保留了独立设计文档路由 [`app/(design)/design-spec/page.tsx`](../app/(design)/design-spec/page.tsx)，但设计系统展示页组件已经移除。

建议保持：

- URL: `/design-spec`
- 页面标题: `Design Spec`
- 定位：设计规范文档与实现约束页，不再维护独立 showcase 组件

### 8.9 CMS 页面族

复用统一 `CmsShell`：

- `/cms/dashboard`
- `/cms/articles`
- `/cms/articles/new`
- `/cms/categories`
- `/cms/tags`
- `/cms/comments`
- `/cms/users`
- `/cms/analytics`
- `/cms/settings`

认证页面使用独立 `AuthShell`：

- `/cms/login`
- `/cms/register`

---

## 9. 路由组拆分方案

### 9.1 推荐 App Router 结构

```txt
app/
  (site)/
    layout.tsx
    page.tsx
    about/page.tsx
    projects/page.tsx
    friends/page.tsx
    changelog/page.tsx
    articles/
      page.tsx
      [slug]/page.tsx
  (cms-auth)/
    cms/
      login/page.tsx
      register/page.tsx
  (cms)/
    cms/
      layout.tsx
      dashboard/page.tsx
      articles/page.tsx
      articles/new/page.tsx
      categories/page.tsx
      tags/page.tsx
      comments/page.tsx
      users/page.tsx
      analytics/page.tsx
      settings/page.tsx
  (design)/
    design-spec/page.tsx
```

### 9.2 与当前仓库对齐

当前已存在：

- [`app/(cms)`](../app/(cms))
- [`app/(cms-auth)`](../app/(cms-auth))
- [`app/(design)`](../app/(design))

缺失但应新增：

- `app/(site)`
- `app/(site)/articles`
- `app/(site)/articles/[slug]`
- `app/(site)/projects`
- `app/(site)/about`
- `app/(site)/friends`
- `app/(site)/changelog`

### 9.3 路由组职责

#### `(site)`

- public navigation
- footer
- 内容型 metadata
- 较强视觉氛围

#### `(cms-auth)`

- 无站点主导航
- 居中 auth card
- 最简布局与重定向逻辑

#### `(cms)`

- sidebar + header + main shell
- 统一权限守卫
- 更高信息密度

#### `(design)`

- 设计规范文档
- 文档型 layout
- 用于沉淀规范、约束与实现说明

---

## 10. 布局规范

### 10.1 Public Site Layout

核心布局元素：

- 固定顶栏 `SiteHeader`
- 内容容器 `max-w-7xl`
- section 间距大，首屏留白充足
- 页脚具备品牌、社交、版权信息

响应式：

- `lg` 以上显示完整导航
- `md` 以下折叠菜单为 Drawer / Navigation Menu
- TOC 仅在 `lg` 以上显示

### 10.2 CMS Layout

核心布局元素：

- 固定侧栏 `CmsSidebar`
- 顶部操作栏 `CmsHeader`
- 内容区 `main`
- 移动端用 drawer sidebar

后台页面共用模式：

- 页面标题区
- 操作区
- 过滤区
- 内容区
- 分页区

### 10.3 Auth Layout

认证页特征：

- 单卡片居中
- 背景带 gradient + grid ambience
- 表单输入较大，强调焦点态
- 次要动作采用 text link

---

## 11. 业务组件拆分明细

### 11.1 Public Site

#### 导航类

- `site-header`
- `site-mobile-nav`
- `site-footer`
- `social-links`

#### 内容展示类

- `article-card`
- `article-row`
- `project-card`
- `friend-card`
- `release-entry`
- `author-meta`
- `toc-nav`

#### 转化类

- `newsletter-form`
- `contact-cta`
- `friend-submit-form`

### 11.2 CMS

#### 壳层类

- `cms-sidebar`
- `cms-header`
- `cms-page-header`
- `cms-section-card`

#### 数据展示类

- `stats-grid`
- `activity-feed`
- `articles-table`
- `taxonomy-table`
- `comments-table`
- `users-table`
- `chart-card`

#### 表单类

- `article-editor-form`
- `settings-general-form`
- `settings-seo-form`
- `settings-appearance-form`
- `auth-form`

---

## 12. 现有代码映射建议

### 12.1 已经存在且可继续沿用

- [`components/ui/button.tsx`](../components/ui/button.tsx)
- [`components/ui/input.tsx`](../components/ui/input.tsx)
- [`components/ui/select.tsx`](../components/ui/select.tsx)
- [`components/ui/table.tsx`](../components/ui/table.tsx)
- [`components/ui/dialog.tsx`](../components/ui/dialog.tsx)
- [`components/ui/avatar.tsx`](../components/ui/avatar.tsx)
- [`components/ui/card.tsx`](../components/ui/card.tsx)
- [`components/ui/pagination.tsx`](../components/ui/pagination.tsx)

### 12.2 需要补齐的基础能力

- `textarea`
- `checkbox`
- `switch`
- `dropdown-menu`
- `tabs`
- `tooltip`
- `popover`
- `scroll-area`
- `sheet/drawer`
- `skeleton`
- `empty-state`

### 12.3 Design Spec 页面现状

设计系统相关展示组件已从仓库中移除，当前只保留设计文档路由页：

- [`app/(design)/design-spec/page.tsx`](../app/(design)/design-spec/page.tsx)

后续如果需要恢复可视化设计规范页，建议不要回到单个大型 showcase 文件，而是复用现有层次：

- `components/shared`
- `components/layouts`
- `components/ui`

由文档页按章节组合，而不是维护一套独立展示专用组件体系。

---

## 13. 交互动效规范

### 13.1 Public Site

- 页面进入：`opacity + translateY`
- 卡片 hover：`border / shadow / spotlight`
- CTA：允许 `primary glow`
- 背景：允许 `morph blob`，但透明度必须低

### 13.2 CMS

- 统计卡片：轻微上浮
- dropdown/dialog：scale + fade
- sidebar mobile：slide
- 表格交互：hover 高亮，不做重动画

### 13.3 可访问性要求

- hover 特效必须有非颜色的焦点表达
- `focus-visible` 统一 ring
- 所有 icon button 提供 `aria-label`
- Dialog / Dropdown / Select 全部使用 Radix 提供键盘可访问性

---

## 14. 设计系统落地优先级

### Phase 1

- 统一 `styles/global.css` token
- 完善 `components/ui`
- 建立 `components/layouts`
- 建立 `(site)` 路由组

### Phase 2

- 抽离 public business components
- 抽离 cms business components
- 将 design iteration 中的通用样式改造成 variant 组件

### Phase 3

- 完善 `design-spec` 页面
- 增加 motion/effects 文档
- 补充空状态、错误态、加载态

---

## 15. 结论

`.superdesign` 中的设计稿已经足够形成一套完整产品设计语言。推荐的最终收敛方式不是继续维护一批独立 HTML 原型，而是将其统一抽象为：

- 一个基于 Tailwind CSS v4 token 的主题层
- 一套基于 CVA 的 variant-driven 原子组件层
- 一套基于 Radix 的可访问性交互层
- 一套按 `ui / shared / layouts / site / cms / features` 拆分的组件层
- 一套按 `(site) / (cms-auth) / (cms) / (design)` 划分的 App Router 路由组

这套结构既能覆盖当前 `.superdesign` 全部页面，也与当前仓库已经存在的 `components/ui`、`app/(cms)`、`app/(cms-auth)`、`app/(design)` 保持一致，后续可以直接作为实现蓝图推进。

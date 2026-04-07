# Chen Serif 设计系统首版实施方案

## 概要

- 交付一套基于 `.superdesign` 全量稿件的首版站点：博客前台、CMS 后台、设计规范页全部落地，数据先使用本地 typed mock。
- 采用 shadcn/ui 风格的代码组织，不引入生成式黑盒组件库：组件代码直接放在项目内并可持续演进。
- 视觉基线完全继承 `.superdesign` 的深色 Chen Serif 风格：`Newsreader + Inter + JetBrains Mono/Space Grotesk`、emerald 强调色、玻璃卡片、spotlight/shimmer/morph blob 动效。
- 交互原语统一改为 `@base-ui/react`；Markdown 编辑与展示统一用 `@bytemd/react`。

## 实施方案

- 建立 App Router 分层：
  `app/(site)` 承载 `/`、`/articles`、`/article/[slug]`、`/projects`、`/about`、`/changelog`、`/friends`、`/design-spec`；
  `app/(cms)` 承载 `/cms/login`、`/cms/register`、`/cms/dashboard`、`/cms/articles`、`/cms/categories`、`/cms/tags`、`/cms/comments`、`/cms/users`、`/cms/analytics`、`/cms/settings`、`/cms/article/new`。
- 建立 shadcn 风格组件目录：
  `components/ui` 放原子/交互基础件；
  `components/blocks` 放业务块；
  `components/layout` 放页面壳与导航；
  `components/editor` 放 ByteMD 封装；
  `components/modals` 放 NiceModal 管理的弹层。
- 在 `app/globals.css` 用 Tailwind v4 `@import "tailwindcss"` + `@theme` 建立 token 体系，补齐颜色、字体、间距、圆角、阴影、动效、布局宽度；同时注册字体 `@font-face` 与少量全局 utility/effect class。
- 原子组件按“样式归一 + 行为原语分离”实现：
  `button`、`input`、`textarea`、`badge`、`card`、`avatar`、`separator`、`skeleton`、`pagination`、`table`、`tabs`、`empty-state`、`form-field`、`toolbar`。
- 行为型组件优先包 `@base-ui/react` 的 `Dialog`、`Menu`、`NavigationMenu`、`Select`、`Field`、`ScrollArea`、`Tabs`、`Checkbox`、`RadioGroup`、`Switch`、`Popover`、`Tooltip`、`Toolbar`。
- 所有 Dialog/Alert/Drawer 严格遵守 AGENTS 规范：
  视觉和可访问性由 Base UI primitive 提供；
  生命周期与打开方式统一走 NiceModal；
  不在页面组件内保存外部 `open` 状态。
- 业务组件从 `.superdesign` 高复用块拆分：
  前台包括 `article-card`、`article-row`、`project-card`、`newsletter-form`、`toc-rail`、`hero-section`、`section-header`；
  CMS 包括 `cms-sidebar`、`cms-header`、`stat-card`、`activity-feed`、`resource-table`、`filter-bar`、`auth-form`、`settings-panel`。
- 页面实现策略：
  页面本身只负责组装布局和数据；
  搜索、筛选、分页、目录高亮、navbar 滚动状态、dropdown/menu、CMS 侧栏折叠等交互下沉到 client 组件或 hooks；
  非交互内容页尽量保持 server component。
- Markdown 方案：
  `components/editor/markdown-editor.tsx` 基于 `@bytemd/react` `Editor`，接入已安装插件 `gfm`、`frontmatter`、`breaks`、`highlight-ssr`、`medium-zoom`；
  `components/editor/markdown-viewer.tsx` 基于 `Viewer`；
  `/cms/article/new` 使用编辑器壳组件；
  `/article/[slug]` 用 mock markdown + viewer 渲染正文，并生成 TOC。
- 设计规范页 `/design-spec` 作为站内文档，不单独引入 Storybook；内容覆盖 tokens、字体、按钮、输入、卡片、表格、分页、弹层、动效和效果组件，作为后续开发的对照基准。
- Mock 数据集中在 `lib/mocks` 或 `lib/content`，导出明确类型：
  `ArticleSummary`、`ArticleDetail`、`ProjectItem`、`NavItem`、`CmsStat`、`TableRow`、`CommentItem`、`UserItem`、`SiteSettings`。
  页面和组件都只消费这些 typed contract，后续接 Prisma 时只替换数据源。

## 公共接口与类型约定

- `components/ui` 组件统一采用 shadcn 风格 API：以 `variant`、`size`、`tone`、`state` 为主，使用 `class-variance-authority` + `cn()`，不暴露散乱 class 组合。
- 链接/按钮类组件保留 `asChild` 或 Base UI `render` 组合能力，保证可与 `next/link`、菜单触发器、toolbar item 复用。
- 表格组件暴露列定义、空态、批量选择、行级 action 插槽；不在首版引入通用复杂 schema builder。
- 编辑器壳组件暴露 `value`、`onChange`、`mode`、`placeholder`、`disabled`、`previewOnly`，并把 ByteMD 样式主题化到 Chen Serif tokens。
- 布局组件只接收数据和 slot，不直接读取 mock 模块，防止后续接真实数据时耦合页面结构。

## 测试与验收

- 工程校验：`bun run lint`、`bun run build` 必须通过。
- 路由验收：前台 8 个页面、CMS 11 个页面全部可访问，无缺失布局或样式回退。
- 交互验收：导航菜单、更多下拉、分页、搜索/筛选、TOC 高亮、CMS 侧栏、NiceModal 弹层、ByteMD 编辑/预览可正常工作。
- 视觉验收：字体、色板、圆角、边框透明度、玻璃卡片、emerald glow、spotlight/shimmer/blob 特效与 `.superdesign` 主视觉一致。
- 可访问性验收：键盘可操作菜单/弹层/表单；表单字段具备 label、描述、错误信息；对比度不低于当前稿件基线。
- 首版不新增完整自动化测试框架；若实现过程中出现复杂状态逻辑，仅为关键 hooks 或数据转换补最小单测。

## 假设与默认

- 首版为 dark-first 单主题，不做 light mode 和主题切换。
- 首版只落视觉与交互结构，不接 Prisma、Better Auth、OSS；登录/CMS 先用 mock session 与 mock content。
- `@base-ui/react` 当前未安装，需要新增依赖并按其现行包名接入；项目中原 README 提到的 Radix 不再作为新组件基础。
- `@bytemd/react` 需要显式引入官方样式并做 token 覆盖。
- 设计规范页即文档站，组件源码组织和 API 以“项目内自有组件库”模式维护，而不是外部 npm 包模式。

## 参考

- Base UI 当前包名与组件体系：[v1.1.0 release](https://base-ui.com/react/overview/releases/v1-1-0)
- Base UI 对话框原语：[Dialog](https://base-ui.com/react/components/dialog)
- Base UI 导航原语：[Navigation Menu](https://base-ui.com/react/components/navigation-menu)
- Base UI 菜单原语：[Menu](https://base-ui.com/react/components/menu)
- ByteMD React 用法与样式要求：[ByteMD Docs](https://bytemd.js.org/)

# CMS UI 重构设计说明

- 日期：2026-04-16
- 范围：CMS 后台全量页面、CMS 共享布局、与 CMS 强相关的共享基础组件
- 依据：[DESIGN_SPEC.md](/Users/fuxiaochen/workspace/fuxiaochen/docs/DESIGN_SPEC.md)
- 方向选择：`B / 编辑型工作台（Editorial Workspace）`
- 信息密度：中等密度
- 重构目标：以 UI 与页面框架重构为主，统一 CMS 的设计语言，同时尽量保持现有功能、路由、数据流和操作路径稳定

## 1. 背景与目标

当前 CMS 已具备基础后台功能，但视觉和页面 framing 仍明显偏离 `Chen Serif` 规范，主要问题包括：

- 大量使用 `bg-white/3`、`bg-white/4`、`glass-card`、`backdrop-blur` 等玻璃态表达
- 列表页、编辑页、设置页、仪表盘和认证页缺乏统一的页面骨架
- 共享组件与业务页面里混杂了许多临时样式，导致后台页面像“很多块卡片拼起来”，而不是同一套工作台
- 表格、表单、空状态、错误状态和操作区没有形成一致的语言

本次重构的目标是：

- 让 CMS 全量页面统一到一套 `Editorial Workspace` 视觉框架
- 把层次来源从 blur、半透明底和装饰性强调，转移到排版、边界、分组和留白
- 升级 CMS 使用到的共享基础组件，但控制影响范围，避免前台站点被后台视觉带偏
- 为后续 CMS 实施计划提供明确、可执行的设计基线

## 2. 已确认的设计结论

### 2.1 重构范围

本次覆盖以下 CMS 页面与共享区域：

- `/cms`
- `/cms/dashboard`
- `/cms/articles`
- `/cms/article/new`
- `/cms/article/[id]`
- `/cms/categories`
- `/cms/tags`
- `/cms/projects`
- `/cms/project/new`
- `/cms/project/[id]`
- `/cms/changelog`
- `/cms/changelog/new`
- `/cms/changelog/[id]`
- `/cms/friends`
- `/cms/comments`
- `/cms/users`
- `/cms/analytics`
- `/cms/settings`
- `/cms/login`
- `/cms/register`
- `CmsShell`
- `CmsSidebar`
- `CmsHeader`
- CMS 各类 manager / form / editor / dialog 所依赖的共享基础 UI 组件

### 2.2 改造深度

本次采用“全量 CMS UI 重构，但不扩大成功能重做”的策略：

- 允许重构页面骨架、组件 framing、排版、间距、筛选区、操作区和反馈区
- 允许抽取 CMS 专属的复用组件，减少业务页中的散装样式
- 允许升级共享 `Button / Input / Select / Table / Tabs / Dialog / Badge / Switch / Checkbox / Card`
- 不改动 CMS 的核心功能职责、路由结构、API 层、数据模型与 NiceModal 使用模式

### 2.3 方向选择

CMS 采用 `B / 编辑型工作台` 作为整体方向。

最终界面应同时满足：

- 有工具感，但不过度压缩和运维化
- 有 editorial 气质，但不牺牲内容管理效率
- 用标题区、分组、摘要、侧栏和边线表达秩序
- 避免把后台做成 showcase、玻璃面板或高密度运维大盘

### 2.4 共享组件边界

共享基础组件允许升级，但必须遵守以下边界：

- 优先收敛到 `Chen Serif` token、边框、圆角、焦点态和动效规则
- 组件 API 尽量保持兼容，避免扩大到功能级重构
- 对前台站点的视觉影响必须可控，不能让前台页面整体转成后台观感
- CMS 专属布局和 framing 通过新增或重构 CMS 专属组件承接，而不是把所有视觉责任压到共享基础组件上

## 3. 整体体验与页面骨架

### 3.1 Editorial Workspace 总体结构

CMS 统一到一套稳定的后台工作台骨架：

1. 左侧分组导航
2. 右侧主工作区
3. 主工作区中的页面标题区
4. 页面标题区下方的操作 / 筛选 / 状态区
5. 主体内容区

不同页面的差异主要体现在内容模块，不体现在视觉语法切换。

### 3.2 左侧导航

CMS 左侧导航采用更安静、分组更清晰的文档式导航：

- 分组标题使用 `Space Grotesk` 风格的小号 uppercase label
- 当前项用弱底色、文字增强和细边界表达，不使用强高亮块或发光色块
- 图标保持细、简洁、几何化
- 底部用户区与快捷操作保留，但转为 solid surface + hairline border 语言

目标是让侧栏像一个结构清晰的系统目录，而不是一块强调色强烈的控制面板。

### 3.3 页面标题区

所有 CMS 页面共享统一的标题区表达：

- serif 页面标题
- 一段简短说明
- 与当前页面相关的主操作
- 轻量的次级状态、统计或刷新提示

标题区是 CMS 的共同语言。列表页、编辑页、设置页和仪表盘都应先进入这层 framing，再进入具体内容模块。

### 3.4 主体工作区

主体工作区遵循“主任务优先，次级信息辅助”的布局策略：

- 仪表盘：主数据区 + 次级活动 / 建议动作区
- 列表页：主表格 / 主列表区为视觉中心
- 编辑页：主编辑区为中心，发布与元信息在侧栏
- 设置页：长文档式 section 区为主体，导航为辅助

所有内容区优先使用实体表面、细边界、明确 section 标题和稳定间距，移除玻璃卡片叠层感。

## 4. 页面模式

### 4.1 Dashboard / 控制台首页

仪表盘统一为以下结构：

1. 页面标题区
2. 核心指标行
3. 最近内容 / 趋势 / 建议动作
4. 活动流或状态摘要

设计要求：

- 指标卡更像数据摘要块，而不是装饰卡片
- 最近文章与活动区共用统一 panel 语言
- loading / error / empty 使用一致的反馈框架

### 4.2 列表页

文章、分类、标签、项目、友链、评论、用户、更新日志等列表页统一为：

1. 页面标题区
2. 搜索 / 筛选 / 主按钮区
3. 轻量指标条或摘要信息
4. 主表格或主列表
5. 分页

设计要求：

- 搜索、筛选和刷新状态集中管理，不散落在多个局部卡片中
- 表格容器采用 solid surface，不使用半透明大底
- 行 hover 只做低对比提升，不做过重动效
- 状态列优先使用轻量 badge、文字和局部标记
- 空状态要说明为什么为空，以及下一步可以做什么

### 4.3 编辑页 / 详情页

文章、项目、更新日志等编辑页统一为：

1. 页面标题区
2. 主编辑区
3. 右侧发布 / 状态 / 元信息侧栏

设计要求：

- 标题与元数据 section、正文编辑 section、预览 section 使用一致的 section panel 语言
- 右侧侧栏保持稳定的操作顺序：发布、状态、分类或标签、补充元信息
- 预览与编辑 tabs 共享统一 tab 样式
- skeleton 保持固定布局，不使用 shimmer

### 4.4 设置页

设置页采用“左导航 + 右文档式长表单”模式：

- 左侧 section 导航采用文档目录式表达
- 右侧每个设置区块使用统一的 section panel
- sticky 操作条保留，但改为更克制的实体表面，不使用 blur
- toggle row、输入区、帮助文本、错误反馈都遵循同一套表单规则

设置页的目标不是像一个漂浮设置面板集合，而是像一份结构清晰的系统配置文档。

### 4.5 Analytics 页面

分析页保留数据展示能力，但统一为更安静的后台语言：

- 顶部为标题区和摘要统计
- 图表容器与指标区统一 panel 语言
- 数据点、趋势和当前时间粒度只做局部强调
- 不使用玻璃图表卡片或大面积亮底

### 4.6 Auth / Entry Flow

登录和注册页采用更简洁的入口页模式：

- 品牌感来自排版、边界、比例和 framing
- 去掉 `backdrop-blur`、发光按钮和过度装饰背景
- 保持短路径、低干扰和明确主操作
- 登录 / 注册卡片仍可居中，但必须是实体表面而非玻璃层

认证页应与 CMS 属于同一系统，而不是一个独立的营销式登录页。

## 5. 组件策略

### 5.1 升级共享基础组件

以下共享基础组件需要升级到更贴近 `Chen Serif` 的状态语言：

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Table`
- `Tabs`
- `Dialog`
- `Badge`
- `Switch`
- `Checkbox`
- `Card`
- `Menu` / 弹出菜单相关封装

升级重点：

- solid surface
- hairline border
- 一致的 44px 高度体系
- 克制的 hover / active / focus-visible
- 极淡 emerald ring
- 禁止 blur、glow、shimmer 和大面积发光强调

### 5.2 新增或重构 CMS 专属 framing 组件

为了避免业务页继续直接堆叠临时样式，需要补充 CMS 专属复用组件，例如：

- `cms-page-header`
- `cms-section-panel`
- `cms-metric-strip`
- `cms-filter-bar`
- `cms-empty-state`
- `cms-feedback-panel`
- `cms-editor-sidebar`
- `cms-status-summary`

这些组件负责把页面组织成稳定的后台语言，而不是让每个 manager / form 文件各自重复造容器样式。

### 5.3 Modal / Drawer / Popover

CMS 中所有弹层继续通过 NiceModal 管理，但视觉语言统一调整为：

- 深色 solid surface
- 清晰边界
- 克制阴影
- 无 blur overlay
- 标题、说明、操作区的 spacing 与表单页一致

## 6. 视觉规则与交互状态

### 6.1 表面与边界

CMS 层级主要由以下元素建立：

- `surface-1 / surface-2 / surface-3`
- `line/subtle / default / strong`
- serif 标题与 mono label 的层级差
- 纵向 section 间距

明确移除：

- `glass-card`
- `bg-white/3`、`bg-white/4` 作为主要表面语言
- `backdrop-blur`
- 发光按钮
- 鼠标跟随高亮

### 6.2 排版

CMS 的字体分工保持如下：

- 页面标题与重要区块标题：`Newsreader`
- 正文、说明、表格内容、输入内容：`Inter`
- 导航分组、表头、标签、meta、小型状态信息：`Space Grotesk` / mono token

后台的高级感应主要来自标题比例、对齐、留白和信息编排，而不是装饰效果。

### 6.3 状态模型

所有可交互元素尽量遵循统一状态集：

- `rest`
- `hover`
- `focus-visible`
- `active`
- `selected`
- `disabled`
- `loading`
- `error`
- `success`

统一表达规则：

- hover：边框略增强、底色略提升、轻微上浮
- focus-visible：边框增强 + 极淡 emerald ring
- active：轻微下压，不做剧烈反馈
- selected：弱底色 + 局部边线或文字增强
- disabled：降低对比但保持可读

### 6.4 Feedback / Empty / Loading

所有 CMS 反馈区采用一致结构：

- 图标
- 标题
- 短说明
- 主行动

要求：

- loading 采用固态 skeleton block
- error 不只靠颜色表达，必须说明如何恢复
- empty state 要同时说明“为什么为空”和“下一步可以做什么”
- success 通过 toast、inline 状态或小 banner 轻量表达

## 7. 实施边界与非目标

### 7.1 保持稳定的部分

以下内容默认保持稳定：

- Route Handler、service、repository、dto 分层
- 业务功能与权限逻辑
- NiceModal 管理方式
- 数据模型和 API 接口
- 主要表单字段与操作语义

### 7.2 非目标

本次不包含以下内容：

- 新增 CMS 功能模块
- 改写数据库模型
- 调整 CMS 的业务流程定义
- 对前台站点进行新一轮整站视觉重构

### 7.3 对前台站点的要求

由于共享基础组件会升级，必须满足：

- 前台站点构建仍通过
- 前台核心页面不出现明显的后台化观感
- 如果某些视觉变化对前台不合适，应通过变体、上下文样式或 CMS 专属组件解决，而不是放弃组件统一

## 8. 受影响的代码区域

后续实施计划应优先围绕以下区域展开：

- `app/(cms)/cms/**`
- `components/layout/cms-shell.tsx`
- `components/layout/cms-header.tsx`
- `components/layout/cms-sidebar.tsx`
- `components/blocks/cms-*.tsx`
- `components/blocks/auth-card.tsx`
- `components/blocks/article-editor-shell.tsx`
- `components/ui/button.tsx`
- `components/ui/button-variants.ts`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/select.tsx`
- `components/ui/table.tsx`
- `components/ui/tabs.tsx`
- `components/ui/dialog.tsx`
- `components/ui/badge.tsx`
- `components/ui/switch.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/card.tsx`
- `components/ui/menu.tsx`
- `app/globals.css`

## 9. 验收标准

当本次重构完成时，应满足以下结果：

- CMS 所有页面都能被识别为同一套 `Editorial Workspace`
- CMS 中主要玻璃态、blur、发光按钮和半透明主表面被移除
- 仪表盘、列表页、编辑页、设置页、认证页分别收敛到固定页面模式
- 表格、表单、筛选区、侧栏、空状态、错误状态和加载状态形成统一语言
- 共享基础组件升级后，CMS 复用成本下降，业务页中的临时样式明显减少
- 前台站点未被意外带偏，构建与基础浏览体验保持稳定

## 10. 一句话实施策略

先统一 CMS 骨架和共享状态语言，再逐类收敛列表页、编辑页、设置页和认证页，最后清理残留玻璃态与散装样式，确保 CMS 全量页面在同一设计系统下闭环。

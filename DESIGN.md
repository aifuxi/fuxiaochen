---
version: alpha
status: target
name: Fuxiaochen Afterglow
description: 受 Libraries.dev 启发的暗色、精密、克制的交互设计系统。
colors:
  primary: "#0066DF"
  primary-hover: "#006BE9"
  primary-pressed: "#005FD5"
  background: "#121212"
  surface: "#181818"
  surface-hover: "#1C1C1C"
  stage: "#131313"
  raised: "#2A2A2A"
  input: "#262626"
  input-hover: "#303030"
  foreground: "#F5F5F5"
  foreground-muted: "#B5B5B5"
  foreground-subtle: "#8F8F8F"
  outline: "#303030"
  scrollbar: "#737373"
  scrollbar-hover: "#929292"
  scrollbar-pressed: "#B5B5B5"
  focus: "#7DB4FF"
  success: "#73D6A1"
  danger: "#FF7B7B"
  syntax-keyword: "#C4A7E7"
  syntax-string: "#A3D9A5"
  syntax-number: "#F2C078"
  syntax-function: "#8FC7F4"
  syntax-comment: "#B5B5B5"
typography:
  display:
    fontFamily: Inter
    fontSize: 42px
    fontWeight: 500
    lineHeight: 45px
    letterSpacing: "-0.005em"
  display-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: 500
    lineHeight: 34px
    letterSpacing: "-0.005em"
  heading:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "-0.01em"
  title:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: 500
    lineHeight: 1.25
  mono:
    fontFamily: ui-monospace
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 14px
  form: 12px
  lg: 24px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 72px
control-sizes:
  small: 32px
  default: 40px
  compact: 36px
  form: 40px
  touch: 44px
motion:
  micro: 80ms
  quick: 150ms
  standard: 250ms
  expressive: 350ms
  ease: "cubic-bezier(0.22, 1, 0.36, 1)"
  lift-ease: "cubic-bezier(0.34, 1.36, 0.64, 1)"
  lift-max: 6px
scrollbar:
  trackWidth: 10px
  thumbWidth: 6px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    height: "{control-sizes.small}"
    padding: 12px
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.foreground}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.foreground}"
  button-secondary:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    height: "{control-sizes.small}"
    padding: 12px
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: 12px
  card-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.foreground}"
  card-stage:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.form}"
    height: "{control-sizes.form}"
    padding: 12px
  caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground-muted}"
  metadata:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground-subtle}"
  focus-indicator:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.background}"
  status-success:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
  status-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
---

# 共享设计规范

## 状态与职责

本文件规定已批准的**目标设计**。YAML 是目标 token 的唯一数值来源，不是运行时代码或生成输入；文档更新不会自动修改页面。2026-10-05 完成规范解耦；2026-10-06 已实施 Inter、前台导航、原生指针、首页与展示页构图，并同步共享 token。实施证据与实际验证范围集中记录在文末。

以 [Libraries.dev](https://libraries.dev/) 为主要视觉参考：近黑连续底色、低对比层级、精密胶囊材质、平实排版与克制的交互反馈。前台构图紧贴参考，后台与阅读页保留任务密度和阅读宽度。品牌资产、专有字体、产品插图、营销文案与付费功能不复制。

| 文档                                                                                                 | 负责的规则                                     |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                                                               | 执行方式、技术栈、工程安全及任务应读的文档     |
| 本文件                                                                                               | 共享 token、排版、材质、基础组件与通用交互     |
| [前台场景](docs/design/frontend.md)                                                                  | 前台、登录与展示页的布局、尺寸选择及组合       |
| [后台场景](docs/design/admin.md)                                                                     | 后台壳、工作区、业务卡片、编辑器与浮层布局     |
| [产品行为](docs/product/behavior.md)                                                                 | 字段、公开条件、业务状态、查询、保存与统计口径 |
| [数据库维护](docs/maintenance.md)、[媒体存储](docs/media-storage.md)、[部署指南](docs/deployment.md) | 数据格式、请求与存储机制、调度和运维           |

各文档按职责负责。场景文档可定义用途明确的布局、组件尺寸变体及共享颜色的用途组合，不另设基础颜色、字体或重复定义控件状态；共享设计变化先更新本文件，再在授权范围内同步实现。行为调整进入产品文档，技术调整进入对应工程文档。外部参考与[历史验收记录](docs/engineering/verification-history.md)是证据，不直接覆盖现行规范。

## Token 与运行时映射

YAML 保留基础值与语义组件引用，不同时保存新旧两套目标。下文数值是对 token 的解释；页面特有尺寸仅在对应场景维护。主题变量和组件 variant 引用 token，避免在页面重复实现基础状态。不新增 token 生成器或依赖。

| 目标 token        | 运行时对应                       | 同步要求                                                                                             |
| ----------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `colors.*`        | Tailwind v4 `--color-*`          | `foreground-muted`、`foreground-subtle` 分别映射 `--color-muted`、`--color-subtle`；其他颜色同名映射 |
| `typography.*`    | 字体变量与语义排版 class         | `--font-sans`、`--font-display` 使用下方字体栈；字号、行高、字重和字距一并映射，不仅同步 family      |
| `rounded.*`       | `--radius-*`                     | 包括 sm、md、form、lg、pill；组件通过变量选择圆角                                                    |
| `spacing.*`       | 本地间距变量或等值 Tailwind 间距 | 保留 Tailwind 原有间距尺度；token 对应值只维护一份                                                   |
| `control-sizes.*` | 本地组件 size / 触屏目标         | 按用途选择尺寸；YAML 记录桌面基值，form token 与 compact 控件在窄屏或粗指针条件下使用 touch          |
| `motion.*`        | 本地过渡时长、曲线与位移变量     | 按反馈职责选择，不在业务页面新增临时时长                                                             |
| `scrollbar.*`     | 滚动条轨道、滑块宽度             | 与 scrollbar 颜色 token 配合；平台不支持时使用系统兜底                                               |

映射已在 `app/globals.css` 接入：排版使用 `--text-*` 与 `.ds-display`、`.ds-heading`、`.ds-title`、`.ds-body`、`.ds-label`、`.ds-mono`；间距、尺寸与动效分别使用 `--space-*`、`--control-*` 与 `--motion-*`，滚动条使用 `--scrollbar-track-width` 和 `--scrollbar-thumb-width`。保留原 Tailwind 间距尺度与场景字号变体，页面无需重复共享状态。

`--control-form` 的桌面基值为 40px，`--control-compact` 为 36px；在 `(max-width: 600px), (pointer: coarse)` 条件下，form token 覆盖为 `--control-touch` 的 44px，compact 控件也使用 touch 高度。默认 Input、Select、Combobox、InputGroup、ColorInput 和 form Button 引用 form，工具栏显式选择 compact；ColorInput 的宽高以及附加图标操作的触屏宽高一并覆盖，避免只扩大高度造成窄目标或组合控件溢出。

## 品牌标识

品牌图标保留圆角字母 F，使用 background 底色与 foreground 字形。字形采用连续弧线、等粗笔画和圆润端点，保持两条横笔的长度差与清楚的负空间；背景仅保留外侧圆角，不增加内框、渐变或立体效果。

`app/icon.svg` 与 `public/logo.svg` 使用相同矢量内容；`app/apple-icon.png` 由该矢量导出为 180×180。更新标识时同步三份资源，并核对 16px、32px、48px 的辨识度；后台继续通过既有 32px 图片容器使用标识。

## 色彩与材质

`background` 为连续页面底色，`surface` 为展示卡或业务模块的默认灰阶表面，`stage` 仅为明确的展示舞台或场景定义的局部区。层级靠细线、留白与用途建立；`surface-hover` 只用于交互悬停，不作为另一种常驻卡片色。`raised` 用于次级按钮与浮层，输入使用 `input`，hover 使用 `input-hover`。灰阶基底是默认材质，不要求图标、标签、数据系列和重点信息全部使用灰色。

正文使用 `foreground`，说明文字使用 `foreground-muted`，元数据使用 `foreground-subtle`；必要的小字说明不能依赖 subtle。小字号正文、标签和混合底色上的文字需核对实际对比度，不能仅因使用共享 token 就视为可读。

输入占位文字使用 muted，保持在 input 与 input-hover 表面上可读；占位文字不代替可见字段标签。TabsPanel 接收键盘焦点时保留独立的 2px focus 轮廓与 2px 外距，不能以选中 Tab 代替面板焦点。

用色按信息职责组织，场景明确默认映射与需要强调的内容：

- **品牌与重点**：primary 用于主要 CTA、选中状态、交互指示和重要静态信息，例如“最新”“精选”徽标、关键指标或前三名标记。强调集中在相关文字、图标、边线或局部底色上，与默认灰阶层级共同组织页面，无需为每个静态标记另开许可。保留比参考站 `#0071FC` 略压暗的项目 primary，以满足浅色小字对比度；需要较亮蓝色文字时可复用 focus，但仍须核对实际底色上的对比度。
- **分类与数据**：栏目、更新类型、分类和数据系列允许使用共享颜色建立稳定映射；同一类别在同一场景及切换查询区间后保持一致，并保留文字或图例。分类识别可复用既有颜色，但应明确它表达类别，避免被误读为操作结果或告警。没有分类或强调需求时可使用 foreground-muted 等灰阶默认色。
- **状态与焦点**：success、danger 表达实际成功、有利结果、错误或风险，不能凭视觉需要制造业务状态。控件的 focus 指示始终独立于分类色、选中色与状态色，保留清晰的焦点轮廓。颜色不承担唯一识别，状态同时有文字或符号。

场景可以引用共享 token 组合文字、图标、边线、实心或淡彩底色；混合色以共享颜色和表面色为来源，并在场景规范中记录用途与混合方式。用户分类色属于数据标识，可用于局部色点、文字或淡底，不覆盖全局主题变量和控件状态色。确需新增基础颜色或语义角色时，统一在本文件定义并同步运行时，不在页面另建色板。当前局部强调复用既有 token，不新增基础颜色或修改 token 数值。

静态徽标通过文字和颜色表达信息，不自动继承按钮的材质阴影、hover、active、焦点状态或动画。已有日志类型映射与“最新”配色由前台、后台场景维护，适用上述通用规则。

Picker 与 Dialog 浮层依靠表面、边缘环及遮罩建立层次；外阴影沿用 `0 1px 3px rgba(0,0,0,.04)` 的轻微尺度，不使用大模糊投影。

展示 Card 由 surface 外壳、低对比内边线、轻微顶部高光和更暗的内舞台组成。舞台与外缘采用 card padding，说明区位于下方。后台业务 Card 默认使用 surface 与淡边线，无顶部高光、不套舞台；内部信息和局部标识可按上述职责使用颜色。连续工作区与字段分组的边界见后台场景。

信息链接使用本地 `CardLink`，与 Card 共用 surface 外壳、lg 圆角、低对比内边线和轻微顶部高光；图文直接组合，不强制套展示舞台。整卡保留真实链接语义，不嵌套其他操作。hover 使用 surface-hover，active 由 surface 与 background 各半混合压暗，文字保持 foreground；focus-visible 只增加独立轮廓，不覆盖既定圆角。减少动态效果时取消过渡，尺寸与内边距由场景定义。

次级操作胶囊在 raised 上保留 `0 1px 3px rgba(0,0,0,.04)` 外阴影、`inset 0 1px rgba(255,255,255,.04)` 顶部高光、`inset 0 -1px rgba(0,0,0,.06)` 底部暗线及 `inset 0 0 0 1px rgba(196,196,196,.1)` 边缘环。primary 操作胶囊保留外阴影与顶部高光，使用两层极浅白色内边线定义轮廓。hover 与 active 只改变必要底色，避免缩放导致细线抖动；ghost 无材质阴影。全站不使用大面积模糊阴影、重复光晕或装饰渐变，发光限于明确的效果演示。

## 排版与间距

标题、正文和标签使用 `"Inter", "PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`；display 与 sans 共用字体栈。中文使用系统兜底，不分发参考站 Saans。 Inter 通过 [根布局](app/layout.tsx) 的 `next/font/local` 加载，使用 [Inter 官方](https://rsms.me/inter/)提供的 4.1 可变字体文件 [InterVariable.woff2](app/fonts/InterVariable.woff2)，许可随 [OFL.txt](app/fonts/OFL.txt) 保留；浏览器字体请求由本项目提供。数字、参数和代码保持等宽字体，代码优先 `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`。

首页与展示页使用 display；小于 640px 使用 display-mobile。章节标题使用 heading。其余 title、body、label 与 mono 保留既有值；后台页标题、阅读正文与编辑标题属于场景变体，不回写共享 display。卡片标题可选 title 或场景明确的紧凑字号，描述低一级，不让所有内容争夺焦点。

标题简短，中文自然断行，不强制英文式大写，不裁切长标题。用 spacing 组织节奏；容器最大宽度、网格比例与阅读列宽只在场景文档维护，避免所有页面共用一个宽度。

按钮与标签采用 pill；展示外壳与独立业务模块采用 lg，舞台与输入采用 md / form，局部代码等使用场景声明的 sm。图标常用 16–20px，装饰图标不承担唯一的操作名称。默认输入采用填充表面，无常驻描边；焦点与错误提示必须可辨。

滚动条采用透明轨道、灰阶滑块与 pill 圆角，默认、hover、active 依次使用 scrollbar 颜色 token。保持可拖动轨道、较窄视觉滑块，不隐藏滚动条或改变滚动行为；支持标准属性的浏览器使用同色窄条，强制颜色模式交给系统。

## 通用交互与文案

可交互组件按语义覆盖 hover、active、focus-visible、disabled 与 `prefers-reduced-motion`；静态容器无需虚假状态。hover 轻微提亮，active 压暗，键盘焦点保留清晰的 2px focus 轮廓。选中状态不能代替焦点；禁用和加载同时有可读文字或状态说明。交互图标具有可读名称，装饰图形从辅助技术中隐藏。

使用原生指针及控件对应的 text、pointer、not-allowed 等语义，不隐藏系统指针、不挂载装饰光标。焦点、标签与真实点击区域由控件提供，指针不承担状态反馈。

时长与曲线选择 motion token：micro 用于微小反馈，quick 用于短状态切换，standard 用于面板或选中状态，expressive 用于展示性微卡位移。展示卡或首页微卡最大上浮 lift-max；后台工作区、业务卡、表格行与字段分组不入场、上浮或循环。

持续循环仅用于用户明确播放的效果舞台，不用于正文、导航和输入。相邻演示一次只播放一个效果；暂停后保留静态画面，动画层不截获事件。减少动态效果偏好下停止循环、平滑滚动、上浮、旋转、缩放与非必要过渡；同时取消内层对象的位移，不能只把过渡时长缩短。

界面文案描述操作、业务状态、输入要求和影响用户决定的限制。开发阶段、框架名称、持久化方式、内部请求标识与交付过程进入工程文档。删除影响、草稿保留、排期条件、采集开关和统计区间按产品规则可见。加载、空库、无匹配、失败、提交中、成功与冲突分别反馈，不用动画作为唯一状态信息。

## 基础组件

交互行为使用 Base UI，本地组件位于 `components/ui/`，导出可编辑、可组合的 variant；页面只组合组件并定义周边布局。

| 组件                                | 共享规则                                                                                                                                                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button                              | primary / secondary / ghost；small 用于紧凑 CTA，default 用于组件面板，compact 用于后台工具栏与页面操作，form 用于表单提交；粗指针或场景指定的窄屏目标至少 touch 高度；loading 与 disabled 保留说明                                                                                                                 |
| 展示 Card                           | 外壳、舞台、标题、描述、可选操作；可点击卡片为真实链接或按钮，含独立操作时不嵌套点击；悬停不改变内容布局                                                                                                                                                                                                            |
| 业务 Card                           | 默认 surface 与淡边线，内部信息和局部标识可按职责用色；无舞台及顶部高光，是否成卡取决于独立业务意义，具体见后台场景                                                                                                                                                                                                 |
| Tabs                                | raised 选中胶囊独立于文字，使用 standard / ease 滑动到选中项；文字只过渡颜色，面板短淡入且不阻塞内容；键盘可切换，reduced-motion 取消滑动                                                                                                                                                                           |
| Accordion / Dialog / Popover / Menu | Base UI 提供语义、定位与焦点管理；surface / raised 与 md / lg 按用途选择，Portal 避免裁切；关闭后的焦点恢复按场景执行                                                                                                                                                                                               |
| Input / Textarea                    | 单行 Input 使用 form 高度、水平内边距 12px；Textarea 四侧内边距 12px，高度由场景与内容决定，可纵向调整；两者使用 form 圆角与 input 填充，正常、错误、焦点和禁用状态遵循下方表单表面规则；字段有可见标签，错误文字通过 aria-describedby 关联                                                                         |
| Select / Combobox                   | form 触发器沿用 input，水平内边距 12px；菜单使用 raised，选项桌面至少高 40px、窄屏或粗指针至少高 44px；高亮默认灰阶提亮，也可用共享强调色区分当前高亮或选中，保留文字、勾选和独立焦点；附加图标操作桌面 32×32px、窄屏或粗指针 44×44px；Select 用于固定少量选项，Combobox 用于可输入筛选的固定选项；标签关联真实控件 |
| InputGroup                          | 输入、前后图标与附加操作共用完整表面；高度 form、圆角 form，搜索图标 16px、左侧留白 12px，附加图标按钮 small / ghost，桌面 32×32px、窄屏或粗指针 44×44px；内部输入保持透明，不重复边框或焦点环，错误标记与输入焦点由完整外框承载，附加按钮只显示自身焦点；点击非按钮附加区可聚焦输入                                |
| ColorInput                          | 使用 input 表面、form 圆角及 form 宽高，桌面 40×40px、窄屏或粗指针 44×44px；保留色块内边距和独立焦点，表面状态与相邻输入一致，错误与禁用不改变方形尺寸                                                                                                                                                              |
| Switch                              | 状态与名称由本地组件提供；触屏 variant 保留 44×24px 轨道与真实 44×44px 点击区，不用放大轨道代替扩大目标                                                                                                                                                                                                             |

Button、TabsList、SelectTrigger 与 InputGroup 沿用 `size="compact"` 的尺寸接口；Switch 的 `touchTarget` 只扩大触屏目标。普通表单和提交操作使用 form，工具栏及其中的保存操作使用 compact；同组操作沿用相同尺寸，代码块控件保留场景明确的独立尺寸。禁用组合控件时整个表面反馈一致，附加按钮保持独立操作语义。

### 表单表面状态

Input、Textarea、Select、InputGroup、Combobox 和 ColorInput 共用以下规则。尺寸、圆角及组件 props 保持各自既有定义；状态样式集中在共享样式，页面不重复绘制。

- 正常状态使用 input 表面，hover 提亮、active 压暗，鼠标聚焦可使用 primary 内边线。focus-visible 移除正常字段的 primary 内边线，保留独立的 2px focus 外轮廓与 2px 外距。
- `aria-invalid="true"` 或 Base UI 的 `[data-invalid]` 表达错误。错误态保持 input 灰底，以均匀的 1px danger 内边框标记，不混入红色背景、不绘制底部阴影线；hover、active、focus 和 focus-visible 都不能覆盖灰底或红色内框。错误标记与 focus-visible 外轮廓同时存在，错误文字通过 `aria-describedby` 关联真实控件。
- disabled 沿用控件的透明度和 not-allowed 指针反馈，已有错误内框继续保留，hover 和 active 不改变表面。删除错误属性后立即恢复当前正常交互状态，不复制业务错误到组件内部。
- InputGroup 与 Combobox 将内部输入的错误属性和输入焦点提升到完整外框；内部输入保持透明，不重复绘制边框或焦点环。附加按钮聚焦时只显示按钮自身的焦点，不触发组合外框的输入焦点。ColorInput 沿用同一表面状态，并保持既有 form 方形宽高。

文章标题的透明、无圆角画布输入属于显式场景例外，详见[后台写作工作区](docs/design/admin.md#文章列表与写作工作区)；其他表单字段沿用上述规则。

语法高亮只作用于代码区：关键字与标签对应 syntax-keyword，字符串对应 syntax-string，数字与字面量对应 syntax-number，函数与类型对应 syntax-function，注释对应 syntax-comment，其他文本用 foreground；不改变代码内容、选区或撤销历史。

## 参考基线与项目适配

采集日期：**2026-10-05（Asia/Shanghai）**。本次浏览器核对首页与 Border beam 组件页，桌面基线为 **1440×1000、100% 缩放**，另观察默认 780px 宽视口。移动构图和断点取自源码，未作为手机运行验收通过。

来源：[首页](https://libraries.dev/)、[组件页](https://libraries.dev/beam)、[共享样式](https://github.com/Jakubantalik/Libraries.dev/blob/main/sites/home/public/assets/site.css)、[首页结构及专属样式](https://github.com/Jakubantalik/Libraries.dev/blob/main/sites/home/index.html)。记录日期与实际页面数值构成本次基线；上游更新后重新采集，不自动改变本规范。

| 观察                                                           | 项目目标或显式适配                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 首页标题 Saans 42px / 45px、500、-0.005em；正文与控件 Inter    | 使用 Inter 与中文系统字体；display 保留参考尺度，专有标题字体列为有意差异 |
| 页面 #121212、卡片 #181818、舞台 #131313；外壳 24px、内层 14px | 保留 token 与低对比材质；业务 Card 明确采用独立变体                       |
| 首页 CTA 32px 胶囊与精密材质层                                 | 保留 small 与材质；primary 略压暗，触屏目标扩大                           |
| 桌面居中文案、五处散布微卡；手机 2–1–2 聚合                    | 前台场景规定相同构图，五微卡改为既有栏目入口并常显名称                    |
| 展示区最大 1008px、24px 间距；宽屏两张大卡开头                 | 展示页采用该比例；后台与博客阅读使用各自任务宽度                          |
| 普通导航链接，当前项局部胶囊                                   | 前台场景以此为目标；不沿用整组胶囊与蓝色短线                              |
| hover 提亮、微卡约上浮 6px；源码提供多档时长                   | 采用 motion 四档；循环限明确播放的演示，减少动态效果取消循环与所有位移    |

原胶囊导航图仅在前台场景的追溯说明中保留，VibeHub 不再作为现行指针依据。其他参考不扩展本次视觉目标。

2026-10-06 用户批准表单密度适配：普通桌面表单采用 40px 高、12px form 圆角与 12px 输入内边距，工具栏采用 36px，窄屏或粗指针保持 44px 点击目标。这是项目任务密度的选择；Card 外壳与舞台继续分别采用 lg 与 md，Textarea 的既有默认及场景高度保持。实现同步与实际运行结果另按验收记录追踪。

## 核对方法

同一场景比较时记录路由、数据快照、筛选条件、侧栏状态、滚动位置、视口和截图范围。桌面使用 1440×1000，窄屏使用 390×844，缩放 100%；等待字体、图片、布局与动效稳定，拒绝加载中间态。字号、行高、内边距和宽度通过 computed style 核对，未知密度的图片像素不直接视为 CSS 尺寸。

检查长文本、空集合、无匹配、加载、错误与真实可操作状态；业务流程见产品行为，前台与后台的断点和场景见各自验收清单。截图只证明已观察的视觉状态；键盘焦点、disabled、粗指针、reduced-motion、保存和回焦分别区分源码检查与运行验证，未执行不记为通过。使用已有数据或隔离临时数据，不为截图向常用数据库写入演示记录。

参考对齐同时核对布局与完整交互。先实际采集默认、触发、响应、结束与适配，再声明采用方式或有意差异；文档中的状态简述不能代替完整行为规格。采集、复用组件、状态矩阵、失败项重测及交付证据按 [UI 参考采集与回归](docs/engineering/ui-reference-verification.md) 执行。

## 实现同步清单

2026-10-06 完成以下实施，并针对交互遗漏回归修正。此表记录源码证据和验证边界，不形成第二套有效规则；运行记录见[视觉实施验收](docs/engineering/verification-history.md#视觉基线实施2026-10-06)及[逐项交互回归](docs/engineering/verification-history.md#参考采集与交互回归2026-10-06)。

| 项目                 | 已批准目标                                    | 实现证据                                                                                               | 实施范围                                                                             | 验证状态                                                                                     |
| -------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 字体与排版           | Inter、中文系统字体及 display / heading token | [根布局](app/layout.tsx)、[共享样式](app/globals.css)                                                  | 本地字体、主题变量、完整语义排版；保留后台与阅读场景字号                             | 已实施；首页与展示页字号、字体加载及后台字体运行核对通过                                     |
| 前台导航             | 普通链接、当前项局部胶囊                      | [SiteHeader](components/frontend/site-header.tsx)、[前台样式](<app/(frontend)/site.css>)               | 移除整组材质与蓝线，保留宽度测量与折叠菜单；长品牌换行、跨断点关闭与焦点兜底         | 已实施；当前项、移动排版、Escape 回焦、跨断点关闭及再次缩窗不重开运行通过                    |
| 指针                 | 全站原生语义指针                              | [根布局](app/layout.tsx)、[展示页](<app/(showcase)/design-spec/page.tsx>)                              | 删除 CursorEffect、专用样式、token 与遗留属性；展示系统指针示例                      | 已实施；普通区域、按钮、文本与禁用输入指针已运行核对；本次补验禁用 Tab 指针                  |
| 首页                 | 参考构图、五个既有栏目入口                    | [首页](<app/(frontend)/page.tsx>)、[前台样式](<app/(frontend)/site.css>)                               | 居中文案、散布微卡、窄屏 2–1–2；沿用公开设置，微卡不预取；上浮与标签展开反馈         | 已实施；布局边界、五卡 hover/focus-visible、完整命中区与栏目跳转核对通过                     |
| 展示页               | 居中首屏、1008px 网格与共享目标字体           | [展示页](<app/(showcase)/design-spec/page.tsx>)、[局部样式](<app/(showcase)/design-spec/showcase.css>) | 首屏、分段网格、官方效果启停与单舞台播放、离屏停止；样式作用域隔离                   | 已实施；网格、列明控件操作、播放/切换/暂停/重播/离屏停止通过；其他状态见回归矩阵             |
| Token 映射与基础状态 | 完整映射、尺寸变体与 reduced-motion           | [共享样式](app/globals.css)、[Button](components/ui/button.tsx)、[Card](components/ui/card.tsx)        | 圆角/控件/过渡引用变量，form Button；Accordion 状态与 Tab 禁用；减少动态效果取消变换 | 已实施；Tab/Switch 44px 及列明控件流程通过；按压视觉、粗指针及系统 reduced-motion 仅源码核对 |

长资料与空资料的布局边界经源码核对；当前数据库为空，非空文章正文与列表、后台编辑字号、登录表单、最大字段长度、200% 文本缩放和全面辅助技术未在本轮重新运行验收。实施完成不代表这些场景均已运行通过。

迁移说明：逐页视觉规格进入前台 / 后台场景；业务规则进入产品行为；正文格式与查询机制进入数据库维护；上传协议进入媒体存储；调度与备份执行条件引用部署指南。文章列宽和业务卡材质在后台场景只维护一次，历史验收事实保留。

2026-10-07 已优化用色规范，区分默认灰阶材质、品牌强调、分类识别和状态反馈。本次仅扩展规范许可，现有页面和 token 数值保持原状；新增可选强调未实施、未运行验收，具体范围见[用色规范优化记录](docs/engineering/verification-history.md#用色规范优化2026-10-07)。

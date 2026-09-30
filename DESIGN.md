---
version: alpha
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
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 3.5rem
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  heading:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.03em"
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
  form: 14px
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
pointer:
  size: 22px
  stateTransition: 120ms
  ringFill: "rgba(255,255,255,0.12)"
  ringBorder: "rgba(255,255,255,0.5)"
  ringHighlight: "rgba(255,255,255,0.22)"
  ringBlur: 6px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    height: 32px
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
    height: 32px
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
    height: 44px
    padding: 14px
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

## Overview

这是一个“暗色交互展厅”：中性的近黑背景让少量高精度动效成为主角。静态内容保持安静，用户把指针移到按钮、卡片或控件上时，表面才轻微提亮。蓝色只表示最重要的操作或当前状态。参考 [Libraries.dev](https://libraries.dev/) 的实际页面及其[开源实现](https://github.com/Jakubantalik/Libraries.dev)，借鉴其材质、节奏和交互原则；不复制品牌资产、文案或付费功能。

设计供 Fuxiaochen 项目的产品页和组件使用。`DESIGN.md` 的 YAML token 是准确值；下文解释使用方式。实现采用 Tailwind CSS v4 主题变量、Base UI 无样式行为原语，以及类似 shadcn/ui 的本地可编辑组件目录。

## Colors

`background` 是连续的页面底色，`surface` 是卡片外壳，`stage` 是卡片内嵌的展示区。三者只差少量亮度，靠边缘细线与顶部内高光建立层级。`surface-hover` 仅用于悬停，不能作为另一种常驻卡片色。`raised` 用于次级按钮和浮层。`input` 与 `input-hover` 是表单控件的填充表面，以亮度变化反馈悬停。按钮表面不能只用一块纯色填充：参考站的胶囊还叠加了底部暗线、顶部内高光和低对比内边线。

正文用 `foreground`，说明文字用 `foreground-muted`，元数据用 `foreground-subtle`。`primary` 只用于主要 CTA、选中状态及少量交互指示；不要把蓝色变成大面积背景。参考站使用 `#0071FC`；本系统将按钮蓝色略压暗至 `#0066DF`，确保浅色小字达到 WCAG AA 对比度。不要用 subtle 颜色承载小字号的必要说明。

## Typography

以平实、紧凑的无衬线文字承担信息。大标题采用 Space Grotesk 500，字距略收紧；这是项目已有的可用字体，用于近似参考站 Saans 的温和几何感，而非复制其字体文件。正文使用 Inter 优先的系统无衬线栈；数字、参数和代码使用等宽字体。卡片标题 13–16px、500 字重，描述应比标题安静，避免所有内容争夺焦点。

标题要短，留出大块空白。中文页面保持自然断行，不强制英文式全大写。标注、token 名和代码可保留英文。

## Layout

采用最大宽度约 1200px 的居中容器，桌面两侧至少 32px，窄屏至少 20px。主内容按 8px 基础间距组织；卡片网格使用 16–24px 间距。桌面可以并排展示 2–3 个组件案例，移动端改为单列。展示页导航应始终明确当前章节，章节之间保留 72px 左右的呼吸空间。

卡片内层舞台离外缘 12px。说明区放在舞台下方，不压在效果之上。复杂控件示例保持可操作，代码及 token 注释作为辅助内容。

### 登录页

登录页使用左右非对称构图：左侧为大字标题和由细线、轨道、单个蓝色核心组成的抽象门禁图形，右侧为独立的登录表单。图形使用已有 `background`、`surface`、`outline` 和少量 `primary`，不引入新颜色 token。桌面保留宽阔留白，窄屏纵向排列并缩小装饰图形；表单始终先于纯装饰内容进入键盘焦点顺序。用户名与密码采用现有 Input，提交按钮采用 primary Button。错误信息使用 `danger`，不通过颜色单独表达。装饰图形不持续循环；交互状态过渡遵循既有节奏，并在 `prefers-reduced-motion` 下取消位移。

### 管理后台

管理后台沿用暗色 token，不另设浅色主题。桌面使用约 220px 的固定侧栏和顶栏，内容区最大宽度 1200px；侧栏可收起至 68px。导航当前项以少量 `primary` 和中性提亮标识。窄屏由顶栏按钮打开侧栏抽屉，遮罩与关闭按钮都可退出，页面内容保持可滚动。

仪表盘以统计卡片、分析卡片和操作列表组织信息。统计卡在宽屏一行六列、中屏三列、窄屏两列；趋势与来源在宽屏采用约 2:1 排列，窄屏堆叠。信息卡保持 24px 外圆角、低对比边缘和充足内边距；数字用等宽字体，状态同时提供文字。图表和进度条使用现有 `primary`、`success` 与中性色，必要时使用 `danger` 表示待处理项目，不增加装饰性色板。

搜索、通知、编辑和模拟管理操作使用现有 Base UI 对话框及本地表单组件。所有可操作图标需有可读名称；按钮、导航和图表数据点覆盖 hover、active、focus-visible、disabled。动效遵循现有节奏，`prefers-reduced-motion` 下取消位移与非必要过渡。模拟操作必须明确标注，不能暗示真实上传、备份或服务器数据已变更。

### 文章管理

`/admin/posts` 复用管理后台侧栏、顶栏和页脚，当前导航随路由变化。仪表盘与内容管理共享当前会话的 mock 状态，站内切换保留操作结果，刷新恢复初始值。

页首提供内容管理标题、说明和新建文章操作；筛选卡包含全部文章、已发布、草稿箱、发布计划四个 Base UI Tabs，以及分类 Select 和关键词 Input。状态数量来自完整文章集合，筛选结果与分页数量来自同一份派生数据。桌面控件并排，空间不足时换行；390px 下状态栏可横向滚动，筛选控件纵向排列。

文章列表使用语义化表格：标题与标签、分类、状态、浏览量、时间和操作。表头使用 stage，行分隔沿用 outline，悬停仅提亮 surface；状态以文字和 success、focus 或中性色共同表达。窄屏允许表格容器横向滚动，页面本身不得溢出；标题可换行，编辑和删除按钮提供包含文章标题的可读名称。分页每页 8 条，空状态提供重置筛选或创建入口；删除后有效页码自动回退。

创建和编辑复用现有 Dialog、Input、Textarea 与 Select。表单包含标题、正文、分类、标签、发布状态，已排期时必填未来发布时间（北京时间）；排期只记录 mock 计划，不运行自动发布。删除需要确认，反馈说明操作仅影响当前会话。所有新控件继承本地组件的交互状态、焦点管理和减少动态效果支持。

### 评论管理

`/admin/comments` 复用后台布局与共享 mock 状态，默认展示待审核评论。筛选卡提供待审核、已发布、垃圾/拦截、全部四个 Base UI Tabs，数量来自完整评论集合；关键词 Input 同时搜索留言者、邮箱、正文和文章标题。桌面筛选控件并排，窄屏标签横向滚动、搜索框占满宽度。

语义化表格展示评论者、评论内容、状态及快捷审核与回复。评论者使用中性首字头像与邮箱；博主回复采用已有品牌头像。正文自然换行，文章与时间为辅助元数据。已通过用 success、已拒绝用 danger、待审核用中性色，同时显示状态文字。列表按现有每页 8 条分页，窄屏仅在表格容器内横向滚动，空状态可重置筛选；审核和删除后页码自动回退。

待审核评论可通过审核，未拒绝评论可标记垃圾，所有评论可模拟回复和确认删除。回复 Dialog 展示原评论、文章与可见标签的 Textarea，内容为空或只有空格时禁用提交；回复作为已通过的博主评论加入共享集合。反馈明确标注模拟，不发送邮件或调用外部 API。评论变化同步侧栏徽标、仪表盘待审核数量和列表；刷新恢复初始数据。弹窗与控件沿用本地组件焦点管理、禁用状态及减少动态效果支持。

### 媒体库

`/admin/media` 复用后台壳与当前会话的 mock 状态，刷新恢复初始素材。页首包含媒体资产库标题、说明和上传本地图片入口；搜索卡按文件名筛选并显示结果数量，空状态提供清空搜索和上传入口。

素材网格宽屏四列、中屏两至三列、390px 下单列，间距 16px。卡片外圆角 24px，缩略图舞台圆角 14px、高约 176px，下方依次展示文件名、分辨率与体积、时间和删除操作。预览与复制按钮在 hover、focus-within 时显示，触屏常显；卡片提亮但不持续动画，减少动态效果时取消图片缩放。

预览与删除确认使用本地 Base UI Dialog。预览图片完整显示，附体积、分辨率、北京时间和格式。复制操作复制图片 URL，成功后反馈，失败可重试。本地图片仅在浏览器内读取和预览，临时链接不作为永久外链；上传与删除明确标注模拟，不调用服务器。所有操作有可读名称及键盘焦点，窄屏不产生页面级横向溢出。

### 分类与标签

`/admin/categories` 复用后台布局壳。宽屏采用分类与标签双列卡片，窄屏纵向排列；卡片标题包含图标和数量徽标。分类提供名称输入、原生颜色选择、添加操作和语义化表格；标签提供输入与添加操作，以及 stage 内可换行的胶囊标签云。界面沿用现有暗色 token，分类颜色仅为用户数据色点，不改变主题。颜色控件使用 input 表面、14px 圆角与清晰焦点环，覆盖 hover、active、disabled 和减少动态效果。

此页使用独立 mock 数据及固定关联数量，不联动文章管理；刷新或重新挂载恢复初始值。名称去除首尾空格，空值与忽略大小写的重名显示关联字段错误。分类删除通过本地 Dialog 确认，标签直接移除；文案明确说明仅改变演示列表。空列表提供空状态；长名称自然换行，390px 下不产生页面级横向溢出。删除取消后焦点返回触发按钮，删除完成后返回新增分类输入；标签移除后焦点移至相邻移除按钮或新增标签输入。

### 数据分析

`/admin/analytics` 复用后台布局壳、Card 和 Base UI Tabs，默认近 30 天，可切换近 7 天与本季度。使用固定截至 2026-09-30 的独立 mock 快照，指标、趋势、设备比例和文章排行随范围同步更新，不与文章编辑状态联动。

四项统计卡宽屏四列、窄屏两列；双指标趋势与设备分布宽屏约 2:1，窄屏堆叠。PV 使用 primary，UV 使用 success，平板比例使用中性色；环比改善均用 success 与方向文字说明。折线图保持比例，在独立容器内横向滚动，数据点支持鼠标、触屏点击及键盘焦点，展示日期与双指标数值；范围切换清除旧提示。排行榜使用语义化表格，窄屏仅表格容器横向滚动，排名采用中性胶囊，完读率采用 success。所有数字使用等宽字体，页面标明演示数据与统计区间；动效和控件状态沿用已有规则。

### 访客日志

`/admin/visitors` 复用后台布局壳与本地 Card、Input、Button。页首展示实时访客日志标题与说明，三项统计为模拟在线人数、今日独立 IP 覆盖与搜索引擎爬虫；宽屏三列，窄屏单列。图标使用 stage 舞台与 success、focus、中性色，不引入新色板。

访问流卡包含静态状态点、明确的模拟心跳说明、暂停／恢复按钮与搜索框。每 4.5 秒更新模拟在线人数，每三次心跳插入一条日志，最多保留最新 16 条；暂停时保留现有快照，离开页面清理计时器。统计汇总为独立演示数据，不随搜索变化，不连接真实 WebSocket；重新挂载恢复初始数据。

表格展示 IP、地理位置、受访入口、浏览器与系统、停留时长及北京时间，采用 stage 表头、outline 分隔与 surface-hover 行反馈。IP 使用 focus，停留时长采用中性胶囊，数值与路径采用等宽字体。搜索忽略首尾空格与大小写，每页 10 条，筛选后回到第一页，空状态可清空搜索。390px 下控件纵向排列，仅表格容器横向滚动，页面不溢出；状态点不循环动画，交互继承本地组件的全部状态与减少动态效果支持。

### 友情链接

`/admin/friends-links` 复用后台布局壳、Card 与本地 Base UI 控件。页首提供标题、说明和新增入口；筛选卡包含分类、健康状态 Select 与关键词 Input，支持按名称、地址、简介组合筛选。桌面筛选并排，窄屏纵向排列。列表展示站点图标、名称与地址、简介、分类、健康状态和审核／编辑／删除操作，每页 8 条；仅表格容器横向滚动，390px 下页面不溢出。

站点图标使用现有本地图片作为 mock 素材，缺失或加载失败使用 Lucide Link2。分类用中性胶囊，正常用 success、异常用 danger、待审核用中性色，同时保留状态文字；URL 用 focus 色并覆盖 hover、active 与 focus-visible。新增与编辑使用 Dialog、Input、Textarea、Select，字段包含名称、HTTP(S) 地址、可选图标地址、简介、分类和状态；空名称与无效地址显示关联字段错误。删除经 Dialog 确认，取消后焦点返回触发按钮，触发按钮消失时回到新增入口。审核仅将 mock 状态设为正常，不执行健康检测。

mock 列表由 AdminWorkspace 保存，后台站内切换保留，刷新恢复初始数据。筛选重置页码，删除、编辑和审核后有效页码回退；空状态提供重置与新增入口，反馈明确说明当前会话模拟操作。控件、弹窗、减少动态效果与焦点规则沿用现有设计系统。

### 更新日志

`/admin/changelog` 复用后台布局壳、Card、Input、Button 和本地 Base UI Dialog、Select。页首提供系统版本迭代日志标题、说明与发布新版本入口；筛选卡搜索版本号、主题和更新条目，忽略首尾空格与大小写，显示筛选后的里程碑数量。空状态可清空搜索。宽屏搜索与数量并排，390px 下纵向排列，发布按钮占满宽度。

版本记录使用语义化时间线：版本号、类型胶囊、主题、逐条更新清单和日期。时间线细线使用 outline，功能特性使用 focus，安全加固使用 danger，性能优化使用 success，缺陷修复使用中性色，同时显示类型文字；更新条目圆点采用 primary。桌面标题同行换行，窄屏主题独占一行，长版本号和正文自然折行，不产生页面级横向溢出。

发布弹窗包含必填版本号与更新主题、四种更新类型和每行一条的可选更新清单；空值或仅空格显示关联字段错误并聚焦第一个错误字段。提交前去除首尾空格和空行，未填写清单时使用常规优化文案。新记录以北京时间日期插入最前，成功后清空搜索以显示新记录。状态保存在 AdminWorkspace，后台站内切换保留，刷新恢复初始 mock 数据；发布不部署软件、不调用服务器，反馈明确标注模拟。取消或关闭后焦点返回发布按钮，控件状态及减少动态效果沿用现有设计系统。

### 系统设置

`/admin/settings` 复用后台布局壳和本地 Card、Base UI Tabs、Input、Textarea、Switch、Button。页首提供保存所有变更操作；设置卡包含个人资料与站点信息、系统偏好与自动化、高阶开发与 API 凭证三个分组。宽屏资料字段两列，头像预览、头像地址和简介占满整行；窄屏字段单列、标签栏横向滚动、保存按钮占满宽度。头像使用本地初始素材，输入 HTTP(S) 图片地址实时预览，加载失败显示 Lucide UserRound。

系统偏好使用 stage 行展示说明与开关，每页数量限定 1–100 的整数。名称与昵称不能为空，头像地址允许留空或 HTTP(S) 地址；保存时切换到首个错误分组，显示关联错误并聚焦字段。保存一次提交所有分组，已保存 mock 状态由 AdminWorkspace 保留，站内切换保留，刷新恢复初始值；未保存草稿在离开页面后丢弃。界面明确说明演示范围，不启动备份、不影响前台、不调用服务。

开发分组提供可关闭的信息提示、模拟 AI 服务状态与遮蔽的凭证占位，以及当前项目的设计系统和字体信息；不得显示真实密钥或宣称已连接真实服务。样式使用现有暗色 token、24px 外卡和 14px stage，所有控件沿用焦点、禁用和减少动态效果规范。

## Elevation & Depth

不依赖大面积模糊阴影。卡片由暗色表面、1px 内边线、轻微顶部内高光组成；舞台再下沉一级。悬停时背景从 `#181818` 提亮到 `#1C1C1C`，位移最多 4–6px。发光只出现在被展示的效果或焦点处，不给每张卡片加光晕。

按钮的材质要比卡片更精密：灰色胶囊在 `#2A2A2A` 上叠加 `0 1px 3px rgba(0,0,0,.04)` 的外阴影、`inset 0 1px rgba(255,255,255,.04)` 的顶部高光、`inset 0 -1px rgba(0,0,0,.06)` 的底部暗线与 `inset 0 0 0 1px rgba(196,196,196,.1)` 的边缘环。蓝色胶囊保留外阴影和顶部高光，以两层极浅白色内边线定义轮廓。hover 与 pressed 仅变更底色，避免缩放使细边线抖动。ghost 保持无材质阴影。

动效采用先快后慢的 `cubic-bezier(0.22, 1, 0.36, 1)`。反馈节奏分为 80ms micro、150ms quick、250ms standard、350ms expressive；卡片上浮可用 `cubic-bezier(0.34, 1.36, 0.64, 1)`。持续循环只用于明确展示动画的舞台，不用于正文、导航或输入控件。支持 `prefers-reduced-motion`：停止循环、缩短或取消位移，保留状态变化的可理解性。

### 指针反馈

参考 [VibeHub](https://vibe-hub.org/) 的桌面指针状态：普通区域显示品牌蓝色箭头；悬停可点击元素时，箭头在 120ms 内淡出并切换为 22px 圆环；进入文本输入区时切换为细竖线。圆环采用中性半透明材质：12% 白色填充、50% 白色细边、轻微内高光和 6px 背景模糊，呈现小滑块般的透明感，不使用蓝色。位置直接跟随真实指针，状态切换才使用短过渡，不添加拖尾或持续循环。效果层不截获事件，也不参与布局。

仅在支持 hover 的精确鼠标设备上启用，并在第一次鼠标移动后替换系统指针；触屏、粗指针、`prefers-reduced-motion`、页面动效开关关闭时使用原生指针。离开窗口或窗口失焦时隐藏效果。禁用控件保留 `not-allowed` 指针；可编辑文本、链接及按钮的语义不能由装饰指针代替，键盘 `focus-visible` 仍需清晰可见。

## Shapes

交互按钮与标签使用完整胶囊圆角；外层卡片 24px，内嵌舞台和表单输入框 14px。圆角是层级语言的一部分：外壳比内层更圆，按钮比两者更圆。图标线条轻、尺寸 16–20px。默认输入框以填充表面代替描边；聚焦与错误状态的边缘提示必须可辨，不能只靠发光表示焦点。

### 滚动条

页面与内部滚动容器共用窄轨道、透明底色和中性灰滑块；滑块使用胶囊圆角，默认、悬停、按下逐级提亮，不借用表示操作的蓝色。桌面端轨道保留 10px 可拖动宽度，滑块视觉宽度约 6px；不隐藏滚动条，也不让装饰样式改变滚动行为。支持标准滚动条属性的浏览器使用相同的颜色与窄宽度；强制颜色模式交给系统绘制。滚动条没有持续动画，因此减少动态效果偏好下无需额外运动。

## Components

- **Button：** primary、secondary、ghost 三种层级，small 32px 和 default 40px 两种高度。首页式 CTA 优先使用 32px、13px/500 文字、12px 水平内边距和 11px 组间距；40px 版本用于组件面板。hover 提亮、active 压暗底色，材质层持续存在；键盘 `focus-visible` 使用清晰的 2px 焦点环。loading 与 disabled 不能只改颜色，需保留文字或状态说明。
- **Card：** 外壳、舞台、标题、描述、可选操作四部分。可点击卡片应是整块链接或按钮；卡片内有独立操作时，外层不要再做嵌套点击。悬停提亮或上浮，内容不跳动。
- **Tabs：** 轨道内的选中胶囊是独立于文字的底层，随选中项的位置与宽度以 `cubic-bezier(0.22, 1, 0.36, 1)` 滑动 250ms；文字只做颜色过渡，不让背景在两个 Tab 间瞬间跳变。胶囊使用 `#2A2A2A` 表面和轻微顶部内高光，键盘可切换。切换面板使用短暂淡入，不能让内容被动画延迟阻塞；`prefers-reduced-motion` 下取消滑动。
- **Accordion / Dialog / Switch：** 交互语义与焦点管理由 Base UI 负责，视觉由本地组件文件和 Tailwind class 负责。浮层沿用 surface 材质与 14–24px 圆角。
- **Select / Combobox：** 由 Base UI 提供选择、筛选、键盘导航与弹层定位；本地组件封装触发器、输入区、菜单和选项。触发器与输入区沿用 44px 的 input 填充表面及 14px 圆角，弹层沿用 raised 材质；高亮项使用中性提亮，选中项保留文字与勾选标记。Select 用于少量固定选项，Combobox 用于需要输入筛选的固定选项；可见标签与控件语义必须关联。覆盖 hover、active、focus-visible、disabled 和减少动态效果偏好。
- **Motion demo：** 边框流光使用 `border-beam`，柔和光球使用 `thinking-orbs`，悬停浮起沿用本地 CSS。相邻展示卡一次只播放一个效果；边框流光遵循减少动态效果偏好并关闭循环，光球暂停后保留静态画面。动画层不截获指针事件，装饰图形从辅助技术中隐藏。Hero 中的微型图形保留现有 CSS 演示，不叠加第三种效果库。
- **Pointer feedback：** 在根布局挂载一个全站共用的装饰层，由鼠标目标的语义决定箭头、圆环或文本光标。交互状态与页面动效开关保持同步；不改变真实控件的点击区域、焦点、禁用行为。
- **Pointer preview：** 动效章节提供普通表面、可点击按钮和可输入文本框三个目标，便于直接检查指针状态。文本框沿用既有 input token，保留 hover 表面提亮、active 压暗、focus-visible 焦点环与 disabled 状态。
- **InputGroup：** 将单行输入框、前后图标、文字与操作按钮组合为一个完整控件。沿用 Input 的 44px 高度、14px 圆角和 input 填充表面，搜索图标为 16px、左侧间距 14px；右侧图标按钮为 32px ghost。背景、hover、active、错误标记与输入焦点统一作用于外框，内部输入区不再绘制独立背景或焦点环；键盘聚焦输入区时显示完整的 2px 焦点轮廓，附加按钮保留自身焦点提示。装饰图标不进入焦点顺序，点击图标或附加区空白可聚焦输入框，按钮操作独立。禁用时整个表面保持禁用反馈，减少动态效果模式关闭过渡。页面仅负责宽度与周边布局，不重复实现基础状态。
- **Form preview：** 表单章节组合 Input、Textarea、Select、Combobox、Switch 与 Button，展示可填写的完整表单、固定选项和输入筛选，以及输入框的默认、错误和禁用状态。Input 和 Textarea 使用无常驻描边的填充表面与 14px 圆角，hover 提亮、按下压暗、聚焦显示蓝色内边线，键盘 `focus-visible` 改用清晰的单层焦点环；Textarea 可纵向调整高度。字段使用可见标签；错误以 danger 底部标记和文字同时表达，并通过 `aria-invalid`、`aria-describedby` 关联；预览提交仅显示本地反馈。

组件以 `components/ui/` 为单元组织，导出清晰的 variant API；业务页面仅组合组件，不重复写基础状态样式。Tailwind 主题变量应与本文件同步。

## Do's and Don'ts

- **Do：** 让绝大部分界面保持中性，交互发生时才显露亮度与动感。
- **Do：** 同时设计 hover、active、focus、disabled 与 reduced-motion 状态。
- **Do：** 使用双层卡片结构展示交互样例，确保每个样例真实可操作。
- **Don't：** 在每个容器上叠加渐变、毛玻璃、强阴影或循环动画。
- **Don't：** 让动画承担唯一的状态反馈，或因动画影响阅读和点击。
- **Don't：** 直接复制参考站的商标、专有字体、产品插图及营销文案。

## Reference observations

以下是对 [Libraries.dev 首页](https://libraries.dev/) 与其 [首页样式源码](https://github.com/Jakubantalik/Libraries.dev/blob/main/sites/home/public/assets/site.css)、[首页结构及专属样式](https://github.com/Jakubantalik/Libraries.dev/blob/main/sites/home/index.html) 的核对结果，供后续设计决策参考：

| 观察       | 参考站做法                                                                                                              | 本系统采用方式                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 页面与卡片 | `#121212` 页面、`#181818` 外壳、`#131313` 内舞台；外壳 24px、舞台 14px 圆角，内高光和极细边线                           | 直接建立 surface / stage 两层组件，保持低对比材质                       |
| 按钮       | 首页 CTA 为 32px 胶囊，灰色 Browse 和蓝色 Get Pro access；表面有叠加内边线、顶部高光和底部暗线，hover / active 只改底色 | 保留完整材质层及 32px small 与 40px default；蓝色略压暗以满足小字对比度 |
| 卡片       | 外层与内舞台间隔 12px；hover 表面提亮到 `#1C1C1C`，说明区保持稳定                                                       | 卡片只提亮与最多上浮 6px，说明文字不移动布局                            |
| 悬浮预览   | 首页预览 tile 悬停上浮约 6px，350ms 弹性曲线；标签以缩放和透明度出现                                                    | 在展示型卡片中使用同一节奏；常规信息卡不循环动画                        |
| 动效节奏   | 源码提供 80、150、250、350、400、500ms 阶梯与 `cubic-bezier(0.22,1,0.36,1)`                                             | 使用 80–350ms 操作节奏；长循环仅用于效果预览                            |
| 可访问性   | 源码多处针对 `prefers-reduced-motion` 关闭过渡                                                                          | 所有组件保留焦点状态，并对减少动态效果偏好停止循环及位移                |

另参考 [VibeHub 首页](https://vibe-hub.org/) 的实际交互与页面样式：桌面端隐藏原生指针，以绝对跟随的箭头和 120ms 淡入缩放切换圆环、文本竖线；本项目沿用这一交互结构，箭头与文本光标使用自身 `primary` 色，圆环使用中性透明材质。

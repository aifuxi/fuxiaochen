---
version: alpha
status: target
name: 付小晨 Semi Modern
description: 以本地 Semi UI Vue default + modern 为色盘及组件视觉基准，保留 Base UI 语义，按已批准场景组织页面构图。
# colors 为默认深色目标值；color-modes.light 为浅色覆盖。
# 完整原始语义变量、来源及 MIT 归属见 app/semi-theme-tokens.css。
colors:
  primary: "#54A9FF"
  primary-hover: "#7FC1FF"
  primary-active: "#A9D7FF"
  primary-light-default: "rgba(84, 169, 255, 0.2)"
  primary-light-hover: "rgba(84, 169, 255, 0.3)"
  primary-light-active: "rgba(84, 169, 255, 0.4)"
  primary-disabled: "#135CB8"
  primary-light: "rgba(84, 169, 255, 0.2)"
  secondary: "#40B4F3"
  secondary-hover: "#6EC8F6"
  secondary-active: "#9DDCF9"
  secondary-light-default: "rgba(64, 180, 243, 0.2)"
  secondary-light-hover: "rgba(64, 180, 243, 0.3)"
  secondary-light-active: "rgba(64, 180, 243, 0.4)"
  secondary-disabled: "#0366A9"
  secondary-light: "rgba(64, 180, 243, 0.2)"
  tertiary: "#888D92"
  tertiary-hover: "#A7ABB0"
  tertiary-active: "#C6CACD"
  tertiary-light-default: "rgba(136, 141, 146, 0.2)"
  tertiary-light-hover: "rgba(136, 141, 146, 0.3)"
  tertiary-light-active: "rgba(136, 141, 146, 0.4)"
  tertiary-disabled: "#2E3238"
  tertiary-light: "rgba(136, 141, 146, 0.2)"
  info: "#54A9FF"
  info-hover: "#7FC1FF"
  info-active: "#A9D7FF"
  info-light-default: "rgba(84, 169, 255, 0.2)"
  info-light-hover: "rgba(84, 169, 255, 0.3)"
  info-light-active: "rgba(84, 169, 255, 0.4)"
  info-disabled: "#135CB8"
  info-light: "rgba(84, 169, 255, 0.2)"
  success: "#5DC264"
  success-hover: "#7FD184"
  success-active: "#A6E1A8"
  success-light-default: "rgba(93, 194, 100, 0.2)"
  success-light-hover: "rgba(93, 194, 100, 0.3)"
  success-light-active: "rgba(93, 194, 100, 0.4)"
  success-disabled: "#277731"
  success-light: "rgba(93, 194, 100, 0.2)"
  danger: "#FC725A"
  danger-hover: "#FD9983"
  danger-active: "#FDBEAC"
  danger-light-default: "rgba(252, 114, 90, 0.2)"
  danger-light-hover: "rgba(252, 114, 90, 0.3)"
  danger-light-active: "rgba(252, 114, 90, 0.4)"
  danger-disabled: "#2E3238"
  danger-light: "rgba(252, 114, 90, 0.2)"
  warning: "#FFAE43"
  warning-hover: "#FFC772"
  warning-active: "#FFDDA1"
  warning-light-default: "rgba(255, 174, 67, 0.2)"
  warning-light-hover: "rgba(255, 174, 67, 0.3)"
  warning-light-active: "rgba(255, 174, 67, 0.4)"
  warning-disabled: "#2E3238"
  warning-light: "rgba(255, 174, 67, 0.2)"
  bg-0: "#16161A"
  bg-1: "#232429"
  bg-2: "#35363C"
  bg-3: "#43444A"
  bg-4: "#4F5159"
  text-0: "#F9F9F9"
  text-1: "rgba(249, 249, 249, 0.8)"
  text-2: "rgba(249, 249, 249, 0.6)"
  text-3: "rgba(249, 249, 249, 0.35)"
  fill-0: "rgba(255, 255, 255, 0.12)"
  fill-1: "rgba(255, 255, 255, 0.16)"
  fill-2: "rgba(255, 255, 255, 0.2)"
  disabled-text: "rgba(249, 249, 249, 0.35)"
  disabled-border: "#2E3238"
  disabled-bg: "#2E3238"
  disabled-fill: "rgba(230, 232, 234, 0.04)"
  primary-pressed: "#A9D7FF"
  primary-foreground: "#E4E7F5"
  primary-hover-foreground: "#E4E7F5"
  background: "#16161A"
  surface: "#16161A"
  surface-hover: "rgba(255, 255, 255, 0.12)"
  stage: "rgba(255, 255, 255, 0.12)"
  raised: "#43444A"
  raised-hover: "rgba(255, 255, 255, 0.12)"
  raised-pressed: "rgba(255, 255, 255, 0.16)"
  input: "rgba(255, 255, 255, 0.12)"
  input-hover: "rgba(255, 255, 255, 0.16)"
  input-active: "rgba(255, 255, 255, 0.2)"
  foreground: "#F9F9F9"
  foreground-reading: "rgba(249, 249, 249, 0.8)"
  foreground-muted: "rgba(249, 249, 249, 0.6)"
  foreground-subtle: "rgba(249, 249, 249, 0.35)"
  caption: "rgba(249, 249, 249, 0.6)"
  metadata: "rgba(249, 249, 249, 0.6)"
  outline: "rgba(255, 255, 255, 0.08)"
  border: "rgba(255, 255, 255, 0.08)"
  scrollbar: "rgba(136, 141, 146, 0.3)"
  scrollbar-hover: "rgba(136, 141, 146, 0.5)"
  scrollbar-pressed: "rgba(136, 141, 146, 0.7)"
  focus: "#54A9FF"
  focus-text: "#A9D7FF"
  success-text: "#A6E1A8"
  danger-text: "#FDBEAC"
  switch-track: "rgba(255, 255, 255, 0.12)"
  tabs-track: "rgba(255, 255, 255, 0.12)"
  highlight-hover: "rgba(255, 255, 255, 0.12)"
  highlight-pressed: "rgba(255, 255, 255, 0.16)"
  overlay: "#43444A"
  backdrop: "rgba(22, 22, 26, 0.6)"
  tooltip: "#C6CACD"
  tooltip-foreground: "#16161A"
  syntax-keyword: "#DDA0E1"
  syntax-string: "#A6E1A8"
  syntax-number: "#FFDDA1"
  syntax-function: "#A9D7FF"
  syntax-comment: "rgba(249, 249, 249, 0.6)"
color-modes:
  light:
    primary: "#0064FA"
    primary-hover: "#0062D6"
    primary-active: "#004FB3"
    primary-light-default: "#EAF5FF"
    primary-light-hover: "#CBE7FE"
    primary-light-active: "#98CDFD"
    primary-disabled: "#98CDFD"
    primary-light: "#EAF5FF"
    secondary: "#0095EE"
    secondary-hover: "#007BCA"
    secondary-active: "#0063A7"
    secondary-light-default: "#E9F7FD"
    secondary-light-hover: "#C9ECFC"
    secondary-light-active: "#95D8F8"
    secondary-disabled: "#95D8F8"
    secondary-light: "#E9F7FD"
    tertiary: "#6B7075"
    tertiary-hover: "#555B61"
    tertiary-active: "#41464C"
    tertiary-light-default: "#F9F9F9"
    tertiary-light-hover: "#E6E8EA"
    tertiary-light-active: "#C6CACD"
    tertiary-disabled: "#E6E8EA"
    tertiary-light: "#F9F9F9"
    info: "#0064FA"
    info-hover: "#0062D6"
    info-active: "#004FB3"
    info-light-default: "#EAF5FF"
    info-light-hover: "#CBE7FE"
    info-light-active: "#98CDFD"
    info-disabled: "#98CDFD"
    info-light: "#EAF5FF"
    success: "#3BB346"
    success-hover: "#30953B"
    success-active: "#25772F"
    success-light-default: "#ECF7EC"
    success-light-hover: "#D0F0D1"
    success-light-active: "#A4E0A7"
    success-disabled: "#A4E0A7"
    success-light: "#ECF7EC"
    danger: "#F93920"
    danger-hover: "#D52515"
    danger-active: "#B2140C"
    danger-light-default: "#FEF2ED"
    danger-light-hover: "#FEDDD2"
    danger-light-active: "#FDB7A5"
    danger-disabled: "#E6E8EA"
    danger-light: "#FEF2ED"
    warning: "#FC8800"
    warning-hover: "#D26700"
    warning-active: "#A84A00"
    warning-light-default: "#FFF8EA"
    warning-light-hover: "#FEEECC"
    warning-light-active: "#FED998"
    warning-disabled: "#E6E8EA"
    warning-light: "#FFF8EA"
    bg-0: "#FFFFFF"
    bg-1: "#FFFFFF"
    bg-2: "#FFFFFF"
    bg-3: "#FFFFFF"
    bg-4: "#FFFFFF"
    text-0: "#1C1F23"
    text-1: "rgba(28, 31, 35, 0.8)"
    text-2: "rgba(28, 31, 35, 0.62)"
    text-3: "rgba(28, 31, 35, 0.35)"
    fill-0: "rgba(46, 50, 56, 0.05)"
    fill-1: "rgba(46, 50, 56, 0.09)"
    fill-2: "rgba(46, 50, 56, 0.13)"
    disabled-text: "rgba(28, 31, 35, 0.35)"
    disabled-border: "#E6E8EA"
    disabled-bg: "#E6E8EA"
    disabled-fill: "rgba(46, 50, 56, 0.04)"
    primary-pressed: "#004FB3"
    primary-foreground: "#FFFFFF"
    primary-hover-foreground: "#FFFFFF"
    background: "#FFFFFF"
    surface: "#FFFFFF"
    surface-hover: "rgba(46, 50, 56, 0.05)"
    stage: "rgba(46, 50, 56, 0.05)"
    raised: "#FFFFFF"
    raised-hover: "rgba(46, 50, 56, 0.05)"
    raised-pressed: "rgba(46, 50, 56, 0.09)"
    input: "rgba(46, 50, 56, 0.05)"
    input-hover: "rgba(46, 50, 56, 0.09)"
    input-active: "rgba(46, 50, 56, 0.13)"
    foreground: "#1C1F23"
    foreground-reading: "rgba(28, 31, 35, 0.8)"
    foreground-muted: "rgba(28, 31, 35, 0.62)"
    foreground-subtle: "rgba(28, 31, 35, 0.35)"
    caption: "rgba(28, 31, 35, 0.62)"
    metadata: "rgba(28, 31, 35, 0.62)"
    outline: "rgba(28, 31, 35, 0.08)"
    border: "rgba(28, 31, 35, 0.08)"
    scrollbar: "rgba(107, 112, 117, 0.3)"
    scrollbar-hover: "rgba(107, 112, 117, 0.5)"
    scrollbar-pressed: "rgba(107, 112, 117, 0.7)"
    focus: "#0064FA"
    focus-text: "#004FB3"
    success-text: "#25772F"
    danger-text: "#B2140C"
    switch-track: "rgba(46, 50, 56, 0.05)"
    tabs-track: "rgba(46, 50, 56, 0.05)"
    highlight-hover: "rgba(46, 50, 56, 0.05)"
    highlight-pressed: "rgba(46, 50, 56, 0.09)"
    overlay: "#FFFFFF"
    backdrop: "rgba(22, 22, 26, 0.6)"
    tooltip: "#41464C"
    tooltip-foreground: "#FFFFFF"
    syntax-keyword: "#71168A"
    syntax-string: "#25772F"
    syntax-number: "#A84A00"
    syntax-function: "#004FB3"
    syntax-comment: "rgba(28, 31, 35, 0.62)"
shadows:
  dark:
    elevated: "inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 14px rgba(0, 0, 0, 0.25)"
    button-solid: "inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(0, 0, 0, 0.14), 0 2px 4px rgba(0, 0, 0, 0.22)"
    button-light: "inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 1px 2px rgba(0, 0, 0, 0.16)"
    card: "inset 0 1px 0 rgba(255, 255, 255, 0.045), inset 0 0 0 1px rgba(255, 255, 255, 0.045), 0 1px 3px rgba(0, 0, 0, 0.16)"
    modal: "inset 0 1px 0 rgba(255, 255, 255, 0.055), inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 14px rgba(0, 0, 0, 0.25)"
    tooltip: "inset 0 1px 0 rgba(255, 255, 255, 0.28), inset 0 0 0 1px rgba(0, 0, 0, 0.06)"
    popup: "inset 0 1px 0 rgba(255, 255, 255, 0.075), inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 14px rgba(0, 0, 0, 0.25)"
    notice: "inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 14px rgba(0, 0, 0, 0.25)"
    toast: "inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 14px rgba(0, 0, 0, 0.25)"
  light:
    elevated: "0 0 1px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(0, 0, 0, 0.1)"
    button-solid: "inset 0 1px 0 rgba(255, 255, 255, 0.38), inset 0 -1px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.1)"
    button-light: "inset 0 1px 0 rgba(255, 255, 255, 0.18), inset 0 0 0 1px rgba(0, 0, 0, 0.035), 0 1px 2px rgba(0, 0, 0, 0.04)"
    card: "inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.025), 0 1px 3px rgba(0, 0, 0, 0.035)"
    modal: "inset 0 1px 0 rgba(255, 255, 255, 0.26), 0 0 1px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(0, 0, 0, 0.1)"
    tooltip: "inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.04)"
    popup: "inset 0 1px 0 rgba(255, 255, 255, 0.42), inset 0 0 0 1px rgba(0, 0, 0, 0.025), 0 0 1px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(0, 0, 0, 0.1)"
    notice: "0 0 1px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(0, 0, 0, 0.1)"
    toast: "0 0 1px rgba(0, 0, 0, 0.3), 0 4px 14px rgba(0, 0, 0, 0.1)"
typography:
  control:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  display:
    fontFamily: Source Sans Pro
    fontSize: 42px
    fontWeight: 500
    lineHeight: 45px
    letterSpacing: "-0.005em"
  display-mobile:
    fontFamily: Source Sans Pro
    fontSize: 30px
    fontWeight: 500
    lineHeight: 34px
    letterSpacing: "-0.005em"
  heading:
    fontFamily: Source Sans Pro
    fontSize: 30px
    fontWeight: 500
    lineHeight: 1.16
    letterSpacing: "-0.01em"
  title:
    fontFamily: Source Sans Pro
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: Source Sans Pro
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Source Sans Pro
    fontSize: 0.8125rem
    fontWeight: 500
    lineHeight: 1.25
  mono:
    fontFamily: ui-monospace
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: 4px
  sm: 8px
  md: 16px
  form: 12px
  lg: 24px
  pill: 9999px
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
  small: 24px
  default: 40px
  large: 40px
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
cursor:
  size: 28px
  hotspotX: 5
  hotspotY: 4
  strokeWidth: 1.75px
  shadowOffsetY: 1px
  shadowBlur: 1.5px
  shadowOpacity: 0.35
scrollbar:
  trackWidth: 10px
  thumbWidth: 6px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.form}"
    height: "{control-sizes.default}"
    padding: 12px
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.primary-hover-foreground}"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.fill-0}"
    textColor: "{colors.text-1}"
    rounded: "{rounded.form}"
    height: "{control-sizes.default}"
    padding: 12px
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
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
    textColor: "{colors.caption}"
  metadata:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.metadata}"
  focus-indicator:
    backgroundColor: "{colors.focus}"
    textColor: "{colors.background}"
  status-success:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success-text}"
  status-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger-text}"
---

# 共享设计规范

## 状态与职责

本文件规定已批准的**目标设计**。YAML 记录本站语义角色的目标值，运行时唯一数值来源是 `app/semi-theme-tokens.css` 中从固定 Semi 基线适配的原始 token；文档不是生成输入，更新文档不会自动修改页面。2026-10-05 完成规范解耦；2026-10-06 已实施共享无衬线字体、前台导航、原生指针、首页与展示页构图，并同步共享 token。实施证据与实际验证范围集中记录在文末。

色盘与基础组件的视觉参考为本地 [Semi UI Vue 文档站](http://127.0.0.1:4321/zh-CN/advanced/customize-theme) 实际使用的 **default + modern**，以本地源码为精确依据。Libraries.dev 继续作为既有前台构图与已接入演示效果的历史参考；页面信息架构、阅读宽度、业务规则与 Base UI 交互语义保持。品牌资产、产品插图与营销文案不复制。

| 文档                                                                                                 | 负责的规则                                     |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [AGENTS.md](AGENTS.md)                                                                               | 执行方式、技术栈、工程安全及任务应读的文档     |
| 本文件                                                                                               | 共享 token、排版、材质、基础组件与通用交互     |
| [前台场景](docs/design/frontend.md)                                                                  | 前台、登录与展示页的布局、尺寸选择及组合       |
| [后台场景](docs/design/admin.md)                                                                     | 后台壳、工作区、业务卡片、编辑器与浮层布局     |
| [产品行为](docs/product/behavior.md)                                                                 | 字段、公开条件、业务状态、查询、保存与统计口径 |
| [数据库维护](docs/maintenance.md)、[媒体存储](docs/media-storage.md)、[部署指南](docs/deployment.md) | 数据格式、请求与存储机制、调度和运维           |

各文档按职责负责。场景文档可定义用途明确的布局、组件尺寸变体及共享颜色的用途组合，不另设基础颜色、字体或重复定义控件状态；共享设计变化先更新本文件，再在授权范围内同步实现。行为调整进入产品文档，技术调整进入对应工程文档。外部参考与[历史验收记录](docs/engineering/verification-history.md)是证据，不直接覆盖现行规范。

2026-10-15 用户授权将当前项目的深浅色色盘及输入框、按钮、弹窗、Toast 等组件皮肤对齐本地 Semi UI Vue 文档站，明确参考是默认主题叠加 modern。授权覆盖共享 token、组件尺寸、圆角、边框、填充、阴影、排版和交互状态；继续以 Base UI 封装本地组件，不引入 Vue 或 Semi 组件运行时。前台、登录、后台与展示页统一消费共享实现，页面布局、数据流及业务操作保持。

2026-10-16 用户明确恢复项目表单密度：普通桌面按钮和单行表单控件高 40px，compact 工具栏控件高 36px，表单圆角 12px；窄屏与粗指针操作目标保持 44px。颜色、边框、填充、高光、阴影和状态继续使用 Semi default + modern；small=24px、large=40px、页面明确的 32px CTA 与工作台图标复制尺寸保持各自场景，Card、弹层、菜单和 Switch 不随表单密度调整。

2026-10-17 用户批准前台独立预览并授权应用到正式页面。前台改为阅读导向的首页、直接分类与可展开标签、开放式列表与时间线；旧五微卡和独立分类／标签栏目退为历史，布局与数据规则分别由前台场景和产品文档维护。共享色盘、字体、Base UI 与其余页面保持；前台首页 CTA 使用普通 40px，不再保留旧 32px 例外。前台深色首页实心 CTA 与“最新”徽标用现有 background 作深色文字，精选使用 primary-light 与 focus-text，保证亮蓝底上的文字可读；这项明确组合仅限前台，不改共享 primary-foreground 数值或后台皮肤。

此前“禁止常驻浅色描边及所有 inset 边缘”的限制已由本次视觉授权替代。采用参考组件实际包含的边框、细边缘、高光与阴影：普通 Modal 保留实体边框，modern 按钮及独立 bordered Card 保留轻微内侧层次；默认填充 Input 的静止边框仍透明。分隔线只承担参考组件或现有业务结构中的分组职责，不额外装饰页面。

## 品牌资产

站点沿用用户提供的 `FC-logo-smooth.svg` 中的 FC 连续曲线字标，保留原始比例、轮廓、镂空与留白。前台导航与后台侧栏共用 [BrandLogo](components/brand-logo.tsx) 内联 SVG：背景透明，只展示原字标路径，通过 `fill="currentColor"` 继承所在位置的文字颜色，随深浅主题及链接状态同步。页面显示尺寸与间距由前后台场景规定。

`public/logo.svg` 保留原始黑色圆角方形底与白色字标，作为品牌源资产；浏览器 favicon 继续使用同内容的 `app/icon.svg`，Apple 主屏幕图标使用由该 SVG 导出的 180×180px `app/apple-icon.png`。这两类系统图标保持固定配色，不继承页面主题。字标造型更新时同步页面组件、源资产与系统图标；仅调整页面展示时，按授权范围保留系统图标。

2026-10-13 已替换上述资产及前台通用书本标识。验证范围见[FC 品牌资产替换记录](docs/engineering/verification-history.md#fc-品牌资产替换2026-10-13)。

2026-10-14 已按用户授权将页面 logo 改为透明背景、文字同色；系统图标保留原样。实际回归范围见[页面 logo 透明化与文字同色](docs/engineering/verification-history.md#页面-logo-透明化与文字同色2026-10-14)。

## Token 与运行时映射

YAML 的 `colors` 记录默认深色角色，`color-modes.light` 记录浅色覆盖；原始 `--semi-*` 与本站 `--color-*` 别名集中于 `app/semi-theme-tokens.css`。该 CSS 仅包含当前组件消费到的色盘、完整通用语义色及 modern 材质，不预装图表或 AI 专用色。语义组件引用同一角色，不保留旧色盘作为第二套目标。下文数值是对 token 的解释；页面特有尺寸仅在对应场景维护。主题变量和组件 variant 引用 token，避免在页面重复实现基础状态。不新增 token 生成器或依赖。

| 目标 token                           | 运行时对应                        | 同步要求                                                                                                                             |
| ------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `colors.*` / `color-modes.light.*`   | Tailwind v4 `--color-*`           | `foreground-muted`、`foreground-subtle` 分别映射 `--color-muted`、`--color-subtle`；其余角色同名映射，由 `html[data-theme]` 覆盖模式 |
| `shadows.dark.*` / `shadows.light.*` | `--shadow-*`                      | 采用 Semi elevated 和 modern 对应容器层次；Toast 使用 elevated，Tooltip 仅内侧边缘                                                   |
| `typography.*`                       | 字体变量与语义排版 class          | 页面使用 `--font-sans` / `--font-display`，基础组件使用 `--font-control`；字号、行高与字重按用途映射                                 |
| `rounded.*`                          | `--radius-*`                      | xs=4、sm=8、form=12、md=16、lg=24、pill=9999；组件通过变量选择圆角                                                                   |
| `spacing.*`                          | 本地间距变量或等值 Tailwind 间距  | 保留 Tailwind 原有间距尺度；token 对应值只维护一份                                                                                   |
| `control-sizes.*`                    | 本地组件 size / 触屏目标          | 按用途选择尺寸；YAML 记录桌面基值，form token 与 compact 控件在窄屏或粗指针条件下使用 touch                                          |
| `motion.*`                           | 本地过渡时长、曲线与位移变量      | 按反馈职责选择，不在业务页面新增临时时长                                                                                             |
| `cursor.*`                           | `public/cursors/` SVG 与 CSS 热点 | 造型资产沿用共享颜色；尺寸、描边、阴影和热点同步，CSS 变量按语义选择资产                                                             |
| `scrollbar.*`                        | 滚动条轨道、滑块宽度              | 与 scrollbar 颜色 token 配合；平台不支持时使用系统兜底                                                                               |

色盘与材质由 `app/globals.css` 导入 `app/semi-theme-tokens.css`，Tailwind 只注册语义映射；排版使用 `--text-*` 与 `.ds-display`、`.ds-heading`、`.ds-title`、`.ds-body`、`.ds-label`、`.ds-mono`；间距、尺寸与动效分别使用 `--space-*`、`--control-*` 与 `--motion-*`，滚动条使用 `--scrollbar-track-width` 和 `--scrollbar-thumb-width`。保留原 Tailwind 间距尺度与场景字号变体，页面无需重复共享状态。

`--control-small` / `--control-large` 保留 Semi 的 24 / 40px；`--control-default` 与 `--control-form` 采用项目普通桌面密度 40px，`--control-compact` 为工具栏密度 36px。按钮、Tabs 触发项、表单和附加图标操作引用 `--radius-form` 的 12px，`--radius-sm` 保持 8px 供其他组件使用；在 `(max-width: 600px), (pointer: coarse)` 条件下，form token 覆盖为 `--control-touch` 的 44px，compact 控件也使用 touch 高度。默认 Input、Select、Combobox、InputGroup、ColorInput 和 form Button 引用 form，工具栏显式选择 compact；ColorInput 的宽高以及附加图标操作的触屏宽高一并覆盖，避免只扩大高度造成窄目标或组合控件溢出。

## 深浅模式

全站以 `html` 的 `data-theme="dark"` 或 `data-theme="light"` 为统一主题根，默认深色；`ThemeProvider` 管理显式选择，以站点独立的 `fuxiaochen:theme` 保存本地偏好，在首次绘制前应用保存值，避免先绘制另一模式。首次兼容此前 design-spec 的独立偏好，之后统一读写站点偏好。偏好读取或写入不可用时，切换仍在当前页面生效。只提供深色、浅色两态，不增加跟随系统或按时间自动切换。

前台导航、登录页和后台顶栏复用本地 `ThemeToggle`；`/design-spec` 同样读写全局选择。切换入口用太阳／月亮与可访问名称说明目标模式，保留 hover、active、focus-visible、disabled 及触屏目标。切换只更新主题，不触发导航、重播页面入场、清空表单、重置筛选、关闭浮层或改变滚动位置。body 下的 Portal 与原生表单通过统一主题根继承相同模式，`color-scheme`、文本选择、滚动条和指针同步。

新增切换入口放在现有操作区；不移动或改造页面主布局。长站名、移动菜单、后台顶栏收缩和登录短屏仍按原场景边界工作。颜色模式偏好与后台业务设置独立，不写入业务数据库。此节规定目标行为；运行通过范围以本轮验证证据为准。

## 色彩与材质

当前色盘以本地 `semi-ui-vue/vendor/semi-design` 固定的 Semi Design v2.102.0 为默认层，再叠加 `packages/theme-modern/src/index.scss`；加载顺序以文档站 `apps/docs/.vitepress/theme/styles/site.css` 为证。modern 不另设色盘，它覆盖 4 / 8 / 16 / 24px 圆角，并为部分按钮、Card、浮层和 Modal 增加轻微内侧层次。不能仅载入 modern 或只替换主色；两个模式的背景、文字、fill、边框、禁用、成功、危险、警告、信息、遮罩与交互状态一并映射。

此前 `COLOR_TOKENS.md`、`ai_studio_code.html` 与工作台局部去描边方案均为历史参考，不构成第二套现行视觉规范。保留本站必要的小字适配角色：`success-text` / `danger-text` 使用源色盘 green-7 / red-7，`focus-text` 使用 link-active；语法高亮也从源色盘选择较深的浅色模式颜色。除这些可读性适配与页面既有字体外，组件按参考实际状态使用语义变量；独立 HTML 历史快照不随此次运行时组件迁移重做。

`background` 和 `surface` 对应 bg-0；Card 依靠参考中的边缘和阴影建立层级。`stage` 为 fill-0 的局部展示区，`surface-hover` 仅用于可交互卡片的悬停。`raised` 对应 Popover、Dropdown 和 Toast 的 bg-3，Modal 使用 bg-2；次级按钮不复用 raised，而采用 fill-0。输入默认、hover、active 分别使用 fill-0 / fill-1 / fill-2。灰阶基底是默认材质，不要求图标、标签、数据系列和重点信息全部使用灰色。

界面正文使用 `foreground`，连续阅读的文章正文使用 `foreground-reading`，必要说明与占位使用 `caption`，日期、计数和辅助元信息使用 `metadata`。参考原始 `foreground-muted` 与 `foreground-subtle` 保留色值，用于色板、非文字细节及经核对可读的场合；浅色必要小字不直接使用 subtle 或低对比的 muted。小字号正文、标签和混合底色上的文字需核对实际对比度，不能仅因使用共享 token 就视为可读。

输入占位文字对应 Semi text-2，必要说明和可见标签保持独立；占位文字不代替可见字段标签。TabsPanel 接收键盘焦点时保留独立的 2px focus 轮廓与 2px 外距，不能以选中 Tab 代替面板焦点。

`focus` 对应 Semi focus-border，用于独立焦点提示；小号链接、后台选中导航及统计强调文字使用 `focus-text`（link-active）。焦点反馈不改变分类数据颜色或真实操作语义。

用色按信息职责组织，场景明确默认映射与需要强调的内容：

- **品牌与重点**：primary 用于主要 CTA、选中状态、交互指示和重要静态信息，例如“最新”“精选”徽标、关键指标或前三名标记。强调集中在相关文字、图标、边线或局部底色上，与默认灰阶层级共同组织页面，无需为每个静态标记另开许可。本轮以本地 Semi default + modern 的深浅色语义替换旧色盘；实心 primary 按钮和静态徽标默认使用 primary-foreground（前台已批准的对比度组合见上文），主按钮悬停使用 primary-hover-foreground，避免浅色模式继承页面深色文字。强调文字使用对应模式角色，并核对实际底色上的对比度。
- **分类与数据**：栏目、更新类型、分类和数据系列允许使用共享颜色建立稳定映射；同一类别在同一场景及切换查询区间后保持一致，并保留文字或图例。分类识别可复用既有颜色，但应明确它表达类别，避免被误读为操作结果或告警。没有分类或强调需求时，必要文字使用 caption / metadata 等灰阶阅读角色。
- **状态与焦点**：success、danger 保留参考原色用于图标、状态点及已有视觉标记；必要的成功、危险小字分别使用 success-text、danger-text。它们表达实际成功、有利结果、错误或风险，不能凭视觉需要制造业务状态。控件的 focus 指示始终独立于分类色、选中色与状态色，保留清晰的焦点轮廓。颜色不承担唯一识别，状态同时有文字或符号。

场景可以引用共享 token 组合文字、图标、边线、实心或淡彩底色；混合色以共享颜色和表面色为来源，并在场景规范中记录用途与混合方式。用户分类色属于数据标识，可用于局部色点、文字或淡底，不覆盖全局主题变量和控件状态色。确需新增基础颜色或语义角色时，统一在本文件定义并同步运行时，不在页面另建色板。局部强调统一引用当前共享角色，不自行维护深浅两套页面色板。

静态徽标通过文字和颜色表达信息，不自动继承按钮的材质阴影、hover、active、焦点状态或动画。已有日志类型映射与“最新”配色由前台、后台场景维护，适用上述通用规则。

Picker、Popover 与 Menu 使用 bg-3、md 圆角及 `--shadow-popup`（modern overlay 内侧边缘 + elevated）。Dialog 使用 bg-2、lg 圆角、border 和 `--shadow-modal`，普通 Modal 的浅高光保留，遮罩使用 backdrop；`overlay` 作为浮层实体表面的兼容角色对应 bg-3。Toast 使用 bg-3、md 圆角与 elevated 投影，关闭按钮使用共享 form 圆角 12px；light 彩色变体使用语义浅底和 1px 对应语义色边框；不额外叠加 modern overlay 边缘。模式切换不重建浮层，不改变关闭、保存和焦点恢复行为。

独立 bordered Card 使用 surface、md 圆角、border 及 `--shadow-card`，遵循 modern 的淡边缘与轻微高光，不叠加旧有大阴影；无边框或分组网格 Card 不强加相同材质。已有展示卡舞台、业务模块结构及页面留白保持。`CardLink` 继续是真实链接，保留独立操作的既有组合边界，hover/active 只改变填充，focus-visible 显示独立轮廓。

Button 的 primary 对应 Semi primary solid：主色填充、白字、form 圆角与 `--shadow-button-solid`；secondary 对应 tertiary light：fill-0、text-1 与 `--shadow-button-light`；ghost 对应 tertiary borderless，静止透明，hover/active 出现填充时才显示 light 材质。disabled 使用明确的禁用色且不带 modern 材质，focus-visible 始终独立。默认文字 14px / 20px、600 字重；不再默认采用旧胶囊材质。全站不新增无职责的大阴影、循环光晕或装饰渐变，发光限于既有明确的演示。

## 排版与间距

页面标题、正文和标签继续使用 `"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`；display 与 sans 共用字体栈。中文由系统字体兜底，不显式优先指定苹方或微软雅黑。2026-10-15 按用户要求统一替换原首选字体，现行实现、设计工作台、独立 HTML 与项目内字体示例均使用 Source Sans Pro；字号、行高、字距、颜色和等宽字体保持。

在 [共享样式](app/globals.css) 中通过 `@font-face` 加载 jsDelivr 上固定版本的 `@fontsource/source-sans-pro@5.3.0`，仅声明 Latin 子集，使用 Fontsource 官方 `unicode-range`。该包提供静态的 200、300、400、600、700、900 六档字重，分别声明 normal 与 italic，不使用可变字体范围或不存在的 500 字重文件；现有 500 字重按 CSS 字体匹配规则使用 400，不伪装为可变字重。采用 `font-display: swap`，CDN 不可用时继续使用系统兜底；中文与 Latin 子集以外的字符沿用共享回退栈。[根布局](app/layout.tsx) 继续预连接 CDN，页面字体不新增依赖或本地文件，控件 Inter 另按下段加载；独立 HTML 为离线交付内嵌相同字体，并保留包内 [OFL-1.1 许可](https://cdn.jsdelivr.net/npm/@fontsource/source-sans-pro@5.3.0/LICENSE)。数字、参数和代码保持等宽字体，代码优先 `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`。

基础组件内部使用 `--font-control` 的 Semi 字体栈：`"Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif`。Inter 的 Regular / SemiBold 从本地参考资源加载，并保留字体 OFL 许可；不新增远程字体请求。控件文字默认 14px / 20px；Button 600、输入 400、Tabs 400 且选中 600。页面的 Source Sans Pro、标题尺度和阅读排版保持，这是明确的项目适配。

此前字体加载方式与子集调整属于历史事实，见[旧无衬线字体 CDN 替换记录](docs/engineering/verification-history.md#旧无衬线字体-cdn-替换2026-10-09)和[旧无衬线字体子集精简记录](docs/engineering/verification-history.md#旧无衬线字体子集精简2026-10-09)。本次字体替换的实际验证范围见[Source Sans Pro 字体统一](docs/engineering/verification-history.md#source-sans-pro-字体统一2026-10-15)，不将旧字体的验收结果当作新字体的运行证据。

首页与展示页使用 display；小于 640px 使用 display-mobile。章节标题使用 heading。其余 title、body、label 与 mono 保留既有值；后台页标题、阅读正文与编辑标题属于场景变体，不回写共享 display。卡片标题可选 title 或场景明确的紧凑字号，描述低一级，不让所有内容争夺焦点。

标题简短，中文自然断行，不强制英文式大写，不裁切长标题。用 spacing 组织节奏；容器最大宽度、网格比例与阅读列宽只在场景文档维护，避免所有页面共用一个宽度。

按钮、Tabs、输入及附加图标操作采用项目 form=12px；Card 与小型浮层采用 md=16px；Modal 采用 lg=24px；胶囊只用于明确的标签、徽标及圆形控件。既有场景外壳在共享材质范围内更新，页面网格与间距保持。图标常用 16–20px，装饰图标不承担唯一的操作名称。默认输入采用填充表面与透明静止边框；焦点、错误、禁用分别使用源语义色，不受旧绝对无描边限制。

滚动条采用透明轨道、灰阶滑块与 pill 圆角，默认、hover、active 依次使用 scrollbar 颜色 token。保持可拖动轨道、较窄视觉滑块，不隐藏滚动条或改变滚动行为；支持标准属性的浏览器使用同色窄条，强制颜色模式交给系统。

## 共用文章正文排版

前台文章正文与后台 Tiptap 正文共用 `app/article-prose.css` 的 `article-prose`，独立于界面 body、文章主标题与工具栏。字体使用共享 sans，普通段落、列表内容与表格数据使用 foreground-reading；标题、粗体、表头与代码文字使用 foreground，引用使用 caption，普通列表序号和圆点使用 metadata。语法高亮继续使用共享 syntax 颜色；任务 checkbox 保持原有状态配色。采用 Hugging Face 的正文与强调层级，配色适配本次共享冷灰蓝深浅色背景。正文在桌面和手机使用同一比例：`1.05rem`、无单位行高 `1.75`，强调字重 600。不修改根字号；字号使用 rem，随内容变化的留白使用 em。

2026-10-17 的文章编辑器是明确的编辑场景变体：继续共享字体、颜色和内容语义，字号与块间距按后台场景覆盖为 16px / 26px 等写作密度；下表继续规定前台阅读基线，不把编辑变体推广到前台或其他页面。

正文新增预设灰、红、橙、黄、绿、蓝、紫色及相应背景高亮。运行时角色 `--article-*` 在 `app/semi-theme-tokens.css` 绑定现有 caption、danger-text、syntax-number、success-text、focus-text 和 syntax-keyword；黄色深色用 Semi yellow-4，浅色用 yellow-2。背景从对应前景色混合透明色派生，灰色使用 fill-0。持久化只接受这些角色，不接受任意 CSS。主动设置的文字色由嵌套强调与链接继承，默认格式仍沿用原有层级。高亮块共享这些角色，文字保持 foreground-reading，不另设场景色盘。

| 正文元素         | 字号     | 无单位行高 | 上／下外距     |
| ---------------- | -------- | ---------- | -------------- |
| H1               | 1.5rem   | 1.3333     | 2em／1.7rem    |
| H2               | 1.25rem  | 1.4        | 2em／1.45rem   |
| H3               | 1.125rem | 1.5556     | 1.6em／1.3rem  |
| H4–H6            | 1.05rem  | 1.5        | 1.5em／1.2rem  |
| 段落、普通列表   | 继承     | 继承       | 1.25em／1.25em |
| 引用             | 继承     | 继承       | 1.6em／1.6em   |
| 独立图片段落     | 继承     | 继承       | 2em／2em       |
| 分隔线           | 继承     | 继承       | 3em／3em       |
| 代码块、表格容器 | —        | —          | 1.5rem／1.5rem |

标题与分隔线后的首个块取消额外上外距；正文首尾清除多余外距。列表采用 1.625em 起始缩进，条目上下 0.5em，嵌套列表与列表内连续段落上下 0.75em；列表、任务内容与引用内部首尾清零。任务项基线对齐，checkbox 与内容间距 0.5em，无普通列表缩进。图片保留原有尺寸和比例，只有文档中仅含一张图片的段落应用独立块留白；文字中的图片保持行内语义。后台仅通过 decorations 增加临时样式标记，不改变保存内容。

引用保留 3px outline 起始边线与 1em 起始内距。行内代码为 0.875em；代码块为 0.875rem／1.7143，使用共享 mono；表格为 0.875rem／1.75，单元格内段落首尾无外距，连续段落间距 0.5em。场景规范维护代码内边距、工具栏、表格布局与圆角；代码和宽表格只在各自容器内横向滚动。

正文链接默认 focus-text 文字与下划线，偏移 0.1875em；hover 使用 foreground 与 2px 下划线，active 使用 primary，focus-visible 保留独立的 2px focus 轮廓、4px 外距与 4px 圆角。颜色过渡引用 quick／ease，减少动态效果时取消。前台链接沿用实际跳转，后台沿用链接编辑行为，不新增标题锚点或整页复制。

以上规则于 2026-10-09 实施。参考值、项目适配与运行验证范围见[文章正文相对单位统一记录](docs/engineering/verification-history.md#文章正文相对单位统一2026-10-09)；旧正文验收保留历史事实。

## 通用交互与文案

可交互组件按语义覆盖 hover、active、focus-visible、disabled 与 `prefers-reduced-motion`；静态容器无需虚假状态。hover 轻微提亮，active 压暗，键盘焦点保留清晰的 2px focus 轮廓。选中状态不能代替焦点；禁用和加载同时有可读文字或状态说明。交互图标具有可读名称，装饰图形从辅助技术中隐藏。

精细指针且支持 hover、未启用 forced-colors 时，全站使用 Afterglow CSS SVG 指针：28×28px 画布、热点 (5, 4)、圆角斜箭头和柔和阴影。三态使用相同路径、尺寸、foreground 描边和热点，以保持可见外轮廓一致，避免浏览态整块浅色造成视觉偏大；默认使用当前模式的 raised 填充，可点击区域 primary 填充，按下使用 primary-pressed，松开恢复操作色、移出恢复所在区域指针。深浅模式各有默认、操作、按下三态资产，颜色对应 YAML 的共享 token；切换主题时同步选择 `public/cursors/` 对应资产，不改变箭头路径、尺寸、热点与鼠标语义。

采用 [Recent](https://recent.design/) 的圆润箭头、描边和 CSS 光标方式，按本项目深浅主题与操作语义适配；没有鼠标跟随层、尾迹或循环动画。输入框、Textarea 和 contenteditable 使用 text；禁用控件覆盖原生 disabled、aria-disabled 与 Base UI data-disabled，使用 not-allowed；拖拽、缩放及浏览器文本选择继续使用其语义。粗指针、无 hover、forced-colors 和资产加载失败时使用系统光标，减少动态效果下静态光标不变。焦点、标签与真实点击区域仍由控件提供，颜色不是唯一操作提示。参考多人在线指针、头像与聊天不在本次范围。

时长与曲线选择 motion token：micro 用于微小反馈，quick 用于短状态切换，standard 用于面板或选中状态，expressive 用于展示性微卡位移。展示卡最大上浮 lift-max；前台正文与首页近期文章不增加上浮，后台业务卡、表格行与字段分组不单独入场、上浮或循环。

全站使用 Motion 14.0.0。已提交的 pathname 变化时，当前可见的页面 main（登录页使用现有 login-panel，避免全屏 main 的位移增加滚动溢出）按 standard / ease 整体淡入，从 lift-max 向上归位；导航、侧栏、顶栏与页脚静止，不新增容器或按路径重挂载。首次 SSR 与 hydration 直接显示，筛选、分页、hash、刷新与轮询不重播；流式后续内容直接显示，不补第二轮入场。页面动画完成、连续导航、卸载或减少动态效果时取消实例并恢复原有内联样式，保留原生导航、缓存、滚动与草稿保护。

Menu、Popover、Select、Combobox 浮层按 quick / ease 仅过渡透明度，由 Base UI 的公开 open / transitionStatus 驱动，保留挂载、关闭与焦点恢复；首次默认打开直接可见，instant 状态即时切换。同步加载 LazyMotion / domAnimation，使用轻量 m 组件；自定义 render 扩展点由调用方负责呈现与动效；与 Motion 手势同名的原生动画／拖拽事件沿用静态 div，以保留 DOM 事件语义。Dialog、Tabs、Accordion 与既有 hover 保留原效果，不重复叠加，不新增滚动显示或长列表错峰。减少动态效果显式跳过全部新增动画并取消运行实例；不以隐藏 SSR 正文等待客户端。token 或动画能力不可用时直接静态显示。

根元素启用平滑滚动时，`html` 同步声明 `data-scroll-behavior="smooth"`，由 Next.js 在路由滚动处理期间临时切换为即时滚动，并在处理后恢复原样式，避免页面切换与历史位置恢复出现非预期滑动。

持续循环仅用于用户明确播放的效果舞台，不用于正文、导航和输入。相邻演示一次只播放一个效果；暂停后保留静态画面，动画层不截获事件。减少动态效果偏好下停止循环、平滑滚动、上浮、旋转、缩放与非必要过渡；同时取消内层对象的位移，不能只把过渡时长缩短。

界面文案描述操作、业务状态、输入要求和影响用户决定的限制。开发阶段、框架名称、持久化方式、内部请求标识与交付过程进入工程文档。删除影响、草稿保留、第三方统计开关按产品规则可见。加载、空库、无匹配、失败、提交中、成功与冲突分别反馈，不用动画作为唯一状态信息。

## 基础组件

交互行为使用 Base UI，本地组件位于 `components/ui/`，导出可编辑、可组合的 variant；页面只组合组件并定义周边布局。

| 组件                                | 共享规则                                                                                                                                                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button                              | primary / secondary / ghost；small 保留 24px，default 用于普通 40px 操作，compact 用于 36px 工具栏与页面操作，form 用于 40px 表单提交；显式场景尺寸按对应文档执行；粗指针或场景指定的窄屏目标至少 touch 高度；loading 与 disabled 保留说明                                                                          |
| 展示 Card                           | 外壳、舞台、标题、描述、可选操作；可点击卡片为真实链接或按钮，含独立操作时不嵌套点击；悬停不改变内容布局                                                                                                                                                                                                            |
| 业务 Card                           | 默认 surface、border 与 modern card 淡边缘；内部信息和局部标识可按职责用色；不自动套展示舞台，是否成卡取决于独立业务意义，具体见后台场景                                                                                                                                                                            |
| Tabs                                | 选中状态通过共享填充、文字与字重区分，控件采用 Semi 排版与材质、项目 form 圆角和 default / compact 高度；面板切换保留既有键盘行为与不阻塞内容的反馈，reduced-motion 取消位移                                                                                                                                        |
| Accordion / Dialog / Popover / Menu | Base UI 提供语义、定位与焦点管理；Dialog 使用 bg-2 / lg / modal 阴影，其他浮层使用 bg-3 / md / popup 阴影，Portal 避免裁切；关闭后的焦点恢复按场景执行                                                                                                                                                              |
| Input / Textarea                    | 单行 Input 使用 form 高度、水平内边距 12px；Textarea 上下内边距 5px、左右 12px，高度由场景与内容决定，可纵向调整；两者使用 form 圆角与 input 填充，正常、错误、焦点和禁用状态遵循下方表单表面规则；字段有可见标签，错误文字通过 aria-describedby 关联                                                               |
| Select / Combobox                   | form 触发器沿用 input，水平内边距 12px；菜单使用 raised，选项桌面至少高 36px、窄屏或粗指针至少高 44px；高亮默认灰阶提亮，也可用共享强调色区分当前高亮或选中，保留文字、勾选和独立焦点；附加图标操作桌面 24×24px、窄屏或粗指针 44×44px；Select 用于固定少量选项，Combobox 用于可输入筛选的固定选项；标签关联真实控件 |
| InputGroup                          | 输入、前后图标与附加操作共用完整表面；高度 form、圆角 form，搜索图标 16px、左侧留白 12px，附加图标按钮 small / ghost，桌面 24×24px、窄屏或粗指针 44×44px；内部输入保持透明，不重复边框或焦点环，错误标记与输入焦点由完整外框承载，附加按钮只显示自身焦点；点击非按钮附加区可聚焦输入                                |
| ColorInput                          | 使用 input 表面、form 圆角及 form 宽高，桌面 40×40px、窄屏或粗指针 44×44px；保留色块内边距和独立焦点，表面状态与相邻输入一致，错误与禁用不改变方形尺寸                                                                                                                                                              |
| Switch                              | 状态与名称由本地组件提供；滑块使用 Semi 白色，轨道引用 fill-0 / success；触屏 variant 保留 40×24px 轨道与真实 44×44px 点击区，不用放大轨道代替扩大目标                                                                                                                                                              |

Button、TabsList、SelectTrigger 与 InputGroup 沿用 `size="compact"` 的尺寸接口；Switch 的 `touchTarget` 只扩大触屏目标。普通表单和提交操作使用 form，工具栏及其中的保存操作使用 compact；同组操作沿用相同尺寸，前台与编辑器代码工具栏的语言选择和复制控件统一使用 compact 高 36px、form 圆角 12px，窄屏或粗指针高 44px；不再保留代码工具的 32px / 24px 高度或 8px 圆角例外。专用内嵌操作与关闭图标继续保留明确的 small 尺寸。禁用组合控件时整个表面反馈一致，附加按钮保持独立操作语义。

### 图标名称提示

本地 `Tooltip` 基于 Base UI，名称提示使用 Semi grey-7 表面、bg-0 文字、md 圆角、上下 sm／左右 md 内边距、14px／20px 与 `--shadow-tooltip` 内侧边缘，不额外添加外投影。提示宽度不超过 240px 与视口减 24px，Portal 定位并保留碰撞留白。只使用 quick 时长的透明度过渡，减少动态效果时取消过渡，不放大或移动触发控件。提示不包含可交互内容，始终保留触发对象的可访问名称；支持悬停、键盘聚焦、Escape 和失焦关闭，具体方向和等待时间由场景规定。

### 表单表面状态

Input、Textarea、Select、InputGroup、Combobox 和 ColorInput 共用以下规则。尺寸与圆角使用上方项目密度及共享角色，Semi 配色、边框和材质保持，组件 props 保持既有契约；状态样式集中在共享样式，页面不重复绘制。

- 正常状态使用 fill-0，hover 使用 fill-1、active 使用 fill-2；聚焦使用 fill-0 与 1px focus-border，键盘 focus-visible 沿用 Semi 的内侧焦点边框。错误字段聚焦时使用 danger 边框，并保留错误底色与说明；按钮等独立操作继续按各自规则显示 2px 焦点轮廓。
- `aria-invalid="true"` 或 Base UI 的 `[data-invalid]` 表达错误。按 Semi 使用 danger-light-default，hover/active 使用对应 danger-light 状态，焦点保留 danger 边框；错误标记与键盘焦点同时可见，错误文字通过 `aria-describedby` 关联真实控件，不复制业务错误到组件内部。
- disabled 使用 disabled-fill / disabled-text 与 not-allowed 指针，hover 和 active 不改变表面；仅在参考状态需要时使用透明度，避免整控件统一变淡而改变源色。删除错误或禁用属性后立即恢复当前正常交互状态。
- InputGroup 与 Combobox 将内部输入的错误属性和输入焦点提升到完整外框；内部输入保持透明，不重复绘制边框或焦点环。附加按钮聚焦时只显示按钮自身的焦点，不触发组合外框的输入焦点。ColorInput 沿用同一表面状态，并保持既有 form 方形宽高。

文章标题的透明、无圆角画布输入属于显式场景例外，详见[后台写作工作区](docs/design/admin.md#文章列表与写作工作区)；其他表单字段沿用上述规则。

语法高亮按模式选择共享 syntax token；浅色改用能在 surface / input 上阅读的紫、绿、棕与蓝色系，保持原有语法分类与高亮行为。语法高亮只作用于代码区：关键字与标签对应 syntax-keyword，字符串对应 syntax-string，数字与字面量对应 syntax-number，函数与类型对应 syntax-function，注释对应 syntax-comment，其他文本用 foreground；不改变代码内容、选区或撤销历史。

## 参考基线与项目适配

### Semi 组件视觉基线（2026-10-15）

参考入口为 [本地定制主题页](http://127.0.0.1:4321/zh-CN/advanced/customize-theme)，对应仓库为 `../semi-ui-vue`。精确来源：默认 [palette](../semi-ui-vue/vendor/semi-design/packages/semi-theme-default/scss/_palette.scss)、[global](../semi-ui-vue/vendor/semi-design/packages/semi-theme-default/scss/global.scss)、[Foundation 组件规则](../semi-ui-vue/vendor/semi-design/packages/semi-foundation/)，以及本地 [modern](../semi-ui-vue/packages/theme-modern/src/index.scss)。固定上游为 `v2.102.0` / `cdfba6e520fc83ad871b30f51f36d8af3aaa5a21`；不自动跟随在线新版。文档站先载入 default，再载入 modern，见 [site.css](../semi-ui-vue/apps/docs/.vitepress/theme/styles/site.css)。

适配只移植视觉数值与对应状态：Base UI 继续负责语义、键盘、定位、焦点和 Portal；本站公开组件接口与业务动作保留。默认深色、显式浅色选择、普通 40px / compact 36px / form 12px 圆角、44px 触屏目标、页面 Source Sans Pro 和既有页面构图属于本站适配；不复制文档站导航、侧栏、文章布局或 Vue 组件实现。

来源代码使用 MIT：默认层归属 `Copyright (c) 2021 DouyinFE`，本地 modern 归属 `Copyright (c) 2026 aifuxi`。移植的 CSS 保留两方版权与完整许可声明；Inter 另随本地字体保留 OFL 许可。不将其描述为本站原创或 Semi 官方 modern 主题。

本节记录已实施的视觉基线与源码来源。实际参考操作、页面运行、键盘/disabled/reduced-motion 和业务操作分别见 [Semi 主题迁移验收](docs/engineering/verification-history.md#semi-默认主题叠加-modern-视觉迁移2026-10-15)；未执行项不得从源码或截图推定通过。

### 既有页面构图参考（历史）

采集日期：**2026-10-05（Asia/Shanghai）**。本次浏览器核对首页与 Border beam 组件页，桌面基线为 **1440×1000、100% 缩放**，另观察默认 780px 宽视口。移动构图和断点取自源码，未作为手机运行验收通过。

来源：[首页](https://libraries.dev/)、[组件页](https://libraries.dev/beam)、[共享样式](https://github.com/Jakubantalik/Libraries.dev/blob/main/sites/home/public/assets/site.css)、[首页结构及专属样式](https://github.com/Jakubantalik/Libraries.dev/blob/main/sites/home/index.html)。记录日期与实际页面数值构成本次基线；上游更新后重新采集，不自动改变本规范。

| 观察                                                                    | 项目目标或显式适配                                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 首页标题 Saans 42px / 45px、500、-0.005em；正文与控件为参考站无衬线字体 | 使用 Source Sans Pro 与中文系统字体；display 保留参考尺度，专有标题字体列为有意差异         |
| 页面 #121212、卡片 #181818、舞台 #131313；外壳 24px、内层 14px          | 原色值与14px圆角保留为历史参考；组件色盘、圆角与材质以本次 Semi 目标替代                    |
| 首页 CTA 32px 胶囊与精密材质层                                          | CTA 保留显式32px场景尺寸；胶囊与旧材质由 Semi form 圆角和 modern 材质替代，触屏目标保持扩大 |
| 桌面居中文案、五处散布微卡；手机 2–1–2 聚合                             | 前台场景规定相同构图，五微卡改为既有栏目入口并常显名称                                      |
| 展示区最大 1008px、24px 间距；宽屏两张大卡开头                          | 展示页采用该比例；后台与博客阅读使用各自任务宽度                                            |
| 普通导航链接，当前项局部胶囊                                            | 前台场景以此为目标；不沿用整组胶囊与蓝色短线                                                |
| hover 提亮、微卡约上浮 6px；源码提供多档时长                            | 采用 motion 四档；循环限明确播放的演示，减少动态效果取消循环与所有位移                      |

原胶囊导航图仅在前台场景的追溯说明中保留，VibeHub 不再作为现行指针依据。此表仅保留历史构图依据，五微卡与 32px 首页 CTA 已由 2026-10-17 批准的前台方案取代；旧颜色、组件尺寸与材料不覆盖当前规范。

历史记录（2026-10-15 迁移时尺寸曾由 Semi 基线替代，2026-10-16 已重新授权恢复上述项目密度）：2026-10-06 用户批准表单密度适配：普通桌面表单采用 40px 高、12px form 圆角与 12px 输入内边距，工具栏采用 36px，窄屏或粗指针保持 44px 点击目标。这是项目任务密度的选择；Card 外壳与舞台继续分别采用 lg 与 md，Textarea 的既有默认及场景高度保持。实现同步与实际运行结果另按验收记录追踪。

## 核对方法

同一场景比较时记录路由、数据快照、筛选条件、侧栏状态、滚动位置、视口和截图范围。桌面使用 1440×1000，窄屏使用 390×844，缩放 100%；等待字体、图片、布局与动效稳定，拒绝加载中间态。字号、行高、内边距和宽度通过 computed style 核对，未知密度的图片像素不直接视为 CSS 尺寸。

检查长文本、空集合、无匹配、加载、错误与真实可操作状态；业务流程见产品行为，前台与后台的断点和场景见各自验收清单。截图只证明已观察的视觉状态；键盘焦点、disabled、粗指针、reduced-motion、保存和回焦分别区分源码检查与运行验证，未执行不记为通过。使用已有数据或隔离临时数据，不为截图向常用数据库写入演示记录。

参考对齐同时核对布局与完整交互。先实际采集默认、触发、响应、结束与适配，再声明采用方式或有意差异；文档中的状态简述不能代替完整行为规格。采集、复用组件、状态矩阵、失败项重测及交付证据按 [UI 参考采集与回归](docs/engineering/ui-reference-verification.md) 执行。

## 实现同步清单

2026-10-06 完成以下实施，并针对交互遗漏回归修正。此表记录源码证据和验证边界，不形成第二套有效规则；运行记录见[视觉实施验收](docs/engineering/verification-history.md#视觉基线实施2026-10-06)及[逐项交互回归](docs/engineering/verification-history.md#参考采集与交互回归2026-10-06)。

| 项目                 | 已批准目标                                                   | 实现证据                                                                                               | 实施范围                                                                             | 验证状态                                                                                     |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 字体与排版           | 当时的共享无衬线字体、中文系统字体及 display / heading token | [根布局](app/layout.tsx)、[共享样式](app/globals.css)                                                  | 本地字体、主题变量、完整语义排版；保留后台与阅读场景字号                             | 已实施；首页与展示页字号、字体加载及后台字体运行核对通过                                     |
| 前台导航             | 普通链接、当前项局部胶囊                                     | [SiteHeader](components/frontend/site-header.tsx)、[前台样式](<app/(frontend)/site.css>)               | 移除整组材质与蓝线，保留宽度测量与折叠菜单；长品牌换行、跨断点关闭与焦点兜底         | 已实施；当前项、移动排版、Escape 回焦、跨断点关闭及再次缩窗不重开运行通过                    |
| 指针                 | 全站原生语义指针                                             | [根布局](app/layout.tsx)、[展示页](<app/(showcase)/design-spec/page.tsx>)                              | 删除 CursorEffect、专用样式、token 与遗留属性；展示系统指针示例                      | 已实施；普通区域、按钮、文本与禁用输入指针已运行核对；本次补验禁用 Tab 指针                  |
| 首页                 | 作者介绍、写作图与三篇真实近期文章                           | [首页](<app/(frontend)/page.tsx>)、[前台样式](<app/(frontend)/site.css>)                               | 双列 Hero、手机单列；公开查询、40px CTA、现有图片与字体                              | 2026-10-17 已实施；本轮实际范围见前台改版验证，不复用五微卡旧验收                            |
| 展示页               | 独立两栏工作台与局部视觉变体                                 | [展示页](<app/(showcase)/design-spec/page.tsx>)、[局部样式](<app/(showcase)/design-spec/showcase.css>) | 固定目录、单项预览、移动目录与局部浮层；官方效果启停、互斥与离屏暂停                 | 已实施；目录、列明组件交互及首页/登录页隔离对照通过；边界见设计工作台验收                    |
| Token 映射与基础状态 | 完整映射、尺寸变体与 reduced-motion                          | [共享样式](app/globals.css)、[Button](components/ui/button.tsx)、[Card](components/ui/card.tsx)        | 圆角/控件/过渡引用变量，form Button；Accordion 状态与 Tab 禁用；减少动态效果取消变换 | 已实施；Tab/Switch 44px 及列明控件流程通过；按压视觉、粗指针及系统 reduced-motion 仅源码核对 |

长资料与空资料的布局边界经源码核对；当前数据库为空，非空文章正文与列表、后台编辑字号、登录表单、最大字段长度、200% 文本缩放和全面辅助技术未在本轮重新运行验收。实施完成不代表这些场景均已运行通过。

迁移说明：逐页视觉规格进入前台 / 后台场景；业务规则进入产品行为；正文格式与查询机制进入数据库维护；上传协议进入媒体存储；调度与备份执行条件引用部署指南。文章列宽和业务卡材质在后台场景只维护一次，历史验收事实保留。

2026-10-07 已优化用色规范，区分默认灰阶材质、品牌强调、分类识别和状态反馈。本次仅扩展规范许可，现有页面和 token 数值保持原状；新增可选强调未实施、未运行验收，具体范围见[用色规范优化记录](docs/engineering/verification-history.md#用色规范优化2026-10-07)。

2026-10-09 按用户要求将指针更新为 Recent 风格的 Afterglow CSS SVG 造型，并适配全站操作与编辑语义。当前实现、运行回归及剩余边界见 [Recent 指针适配](docs/engineering/verification-history.md#recent-指针适配2026-10-09)；上表保留 2026-10-06 的历史事实。

历史记录：2026-10-14 将 `/design-spec` 的深浅色色盘提升为共享目标，并要求前台、登录页、后台与展示页采用同一模式选择。字体、圆角、间距、布局、控件尺寸、既有材料结构与业务交互保持；本轮不重做局部工作台视觉。源码接入与运行验证见[全站深浅色色盘与模式切换](docs/engineering/verification-history.md#全站深浅色色盘与模式切换2026-10-14)，尚未核对的路由与流程不记为通过。

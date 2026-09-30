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
  foreground: "#F5F5F5"
  foreground-muted: "#B5B5B5"
  foreground-subtle: "#8F8F8F"
  outline: "#303030"
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
    backgroundColor: "{colors.stage}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    height: 40px
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

## Overview

这是一个“暗色交互展厅”：中性的近黑背景让少量高精度动效成为主角。静态内容保持安静，用户把指针移到按钮、卡片或控件上时，表面才轻微提亮。蓝色只表示最重要的操作或当前状态。参考 [Libraries.dev](https://libraries.dev/) 的实际页面及其[开源实现](https://github.com/Jakubantalik/Libraries.dev)，借鉴其材质、节奏和交互原则；不复制品牌资产、文案或付费功能。

设计供 Fuxiaochen 项目的产品页和组件使用。`DESIGN.md` 的 YAML token 是准确值；下文解释使用方式。实现采用 Tailwind CSS v4 主题变量、Base UI 无样式行为原语，以及类似 shadcn/ui 的本地可编辑组件目录。

## Colors

`background` 是连续的页面底色，`surface` 是卡片外壳，`stage` 是卡片内嵌的展示区。三者只差少量亮度，靠边缘细线与顶部内高光建立层级。`surface-hover` 仅用于悬停，不能作为另一种常驻卡片色。`raised` 用于次级按钮和浮层。按钮表面不能只用一块纯色填充：参考站的胶囊还叠加了底部暗线、顶部内高光和低对比内边线。

正文用 `foreground`，说明文字用 `foreground-muted`，元数据用 `foreground-subtle`。`primary` 只用于主要 CTA、选中状态及少量交互指示；不要把蓝色变成大面积背景。参考站使用 `#0071FC`；本系统将按钮蓝色略压暗至 `#0066DF`，确保浅色小字达到 WCAG AA 对比度。不要用 subtle 颜色承载小字号的必要说明。

## Typography

以平实、紧凑的无衬线文字承担信息。大标题采用 Space Grotesk 500，字距略收紧；这是项目已有的可用字体，用于近似参考站 Saans 的温和几何感，而非复制其字体文件。正文使用 Inter 优先的系统无衬线栈；数字、参数和代码使用等宽字体。卡片标题 13–16px、500 字重，描述应比标题安静，避免所有内容争夺焦点。

标题要短，留出大块空白。中文页面保持自然断行，不强制英文式全大写。标注、token 名和代码可保留英文。

## Layout

采用最大宽度约 1200px 的居中容器，桌面两侧至少 32px，窄屏至少 20px。主内容按 8px 基础间距组织；卡片网格使用 16–24px 间距。桌面可以并排展示 2–3 个组件案例，移动端改为单列。展示页导航应始终明确当前章节，章节之间保留 72px 左右的呼吸空间。

卡片内层舞台离外缘 12px。说明区放在舞台下方，不压在效果之上。复杂控件示例保持可操作，代码及 token 注释作为辅助内容。

### 登录页

登录页使用左右非对称构图：左侧为大字标题和由细线、轨道、单个蓝色核心组成的抽象门禁图形，右侧为独立的登录表单。图形使用已有 `background`、`surface`、`outline` 和少量 `primary`，不引入新颜色 token。桌面保留宽阔留白，窄屏纵向排列并缩小装饰图形；表单始终先于纯装饰内容进入键盘焦点顺序。用户名与密码采用现有 Input，提交按钮采用 primary Button。错误信息使用 `danger`，不通过颜色单独表达。装饰图形不持续循环；交互状态过渡遵循既有节奏，并在 `prefers-reduced-motion` 下取消位移。

## Elevation & Depth

不依赖大面积模糊阴影。卡片由暗色表面、1px 内边线、轻微顶部内高光组成；舞台再下沉一级。悬停时背景从 `#181818` 提亮到 `#1C1C1C`，位移最多 4–6px。发光只出现在被展示的效果或焦点处，不给每张卡片加光晕。

按钮的材质要比卡片更精密：灰色胶囊在 `#2A2A2A` 上叠加 `0 1px 3px rgba(0,0,0,.04)` 的外阴影、`inset 0 1px rgba(255,255,255,.04)` 的顶部高光、`inset 0 -1px rgba(0,0,0,.06)` 的底部暗线与 `inset 0 0 0 1px rgba(196,196,196,.1)` 的边缘环。蓝色胶囊保留外阴影和顶部高光，以两层极浅白色内边线定义轮廓。hover 与 pressed 仅变更底色，避免缩放使细边线抖动。ghost 保持无材质阴影。

动效采用先快后慢的 `cubic-bezier(0.22, 1, 0.36, 1)`。反馈节奏分为 80ms micro、150ms quick、250ms standard、350ms expressive；卡片上浮可用 `cubic-bezier(0.34, 1.36, 0.64, 1)`。持续循环只用于明确展示动画的舞台，不用于正文、导航或输入控件。支持 `prefers-reduced-motion`：停止循环、缩短或取消位移，保留状态变化的可理解性。

### 指针反馈

参考 [VibeHub](https://vibe-hub.org/) 的桌面指针状态：普通区域显示品牌蓝色箭头；悬停可点击元素时，箭头在 120ms 内淡出并切换为 22px 圆环；进入文本输入区时切换为细竖线。圆环采用中性半透明材质：12% 白色填充、50% 白色细边、轻微内高光和 6px 背景模糊，呈现小滑块般的透明感，不使用蓝色。位置直接跟随真实指针，状态切换才使用短过渡，不添加拖尾或持续循环。效果层不截获事件，也不参与布局。

仅在支持 hover 的精确鼠标设备上启用，并在第一次鼠标移动后替换系统指针；触屏、粗指针、`prefers-reduced-motion`、页面动效开关关闭时使用原生指针。离开窗口或窗口失焦时隐藏效果。禁用控件保留 `not-allowed` 指针；可编辑文本、链接及按钮的语义不能由装饰指针代替，键盘 `focus-visible` 仍需清晰可见。

## Shapes

交互按钮与标签使用完整胶囊圆角；外层卡片 24px，内嵌舞台 14px，输入框 8px。圆角是层级语言的一部分：外壳比内层更圆，按钮比两者更圆。图标线条轻、尺寸 16–20px。边框与焦点环必须可辨，不能只靠发光表示焦点。

## Components

- **Button：** primary、secondary、ghost 三种层级，small 32px 和 default 40px 两种高度。首页式 CTA 优先使用 32px、13px/500 文字、12px 水平内边距和 11px 组间距；40px 版本用于组件面板。hover 提亮、active 压暗底色，材质层持续存在；键盘 `focus-visible` 使用清晰的 2px 焦点环。loading 与 disabled 不能只改颜色，需保留文字或状态说明。
- **Card：** 外壳、舞台、标题、描述、可选操作四部分。可点击卡片应是整块链接或按钮；卡片内有独立操作时，外层不要再做嵌套点击。悬停提亮或上浮，内容不跳动。
- **Tabs：** 轨道内的选中胶囊是独立于文字的底层，随选中项的位置与宽度以 `cubic-bezier(0.22, 1, 0.36, 1)` 滑动 250ms；文字只做颜色过渡，不让背景在两个 Tab 间瞬间跳变。胶囊使用 `#2A2A2A` 表面和轻微顶部内高光，键盘可切换。切换面板使用短暂淡入，不能让内容被动画延迟阻塞；`prefers-reduced-motion` 下取消滑动。
- **Accordion / Dialog / Switch：** 交互语义与焦点管理由 Base UI 负责，视觉由本地组件文件和 Tailwind class 负责。浮层沿用 surface 材质与 14–24px 圆角。
- **Motion demo：** 边框流光使用 `border-beam`，柔和光球使用 `thinking-orbs`，悬停浮起沿用本地 CSS。相邻展示卡一次只播放一个效果；边框流光遵循减少动态效果偏好并关闭循环，光球暂停后保留静态画面。动画层不截获指针事件，装饰图形从辅助技术中隐藏。Hero 中的微型图形保留现有 CSS 演示，不叠加第三种效果库。
- **Pointer feedback：** 在根布局挂载一个全站共用的装饰层，由鼠标目标的语义决定箭头、圆环或文本光标。交互状态与页面动效开关保持同步；不改变真实控件的点击区域、焦点、禁用行为。
- **Pointer preview：** 动效章节提供普通表面、可点击按钮和可输入文本框三个目标，便于直接检查指针状态。文本框沿用既有 input token，保留 hover 边线、active / focus-visible 焦点环与 disabled 状态。
- **Form preview：** 表单章节组合 Input、Textarea、Switch 与 Button，展示可填写的完整表单及输入框的默认、错误和禁用状态。Textarea 沿用 input 的表面、边框、8px 圆角和焦点样式，可纵向调整高度。字段使用可见标签；错误以 danger 边框和文字同时表达，并通过 `aria-invalid`、`aria-describedby` 关联；预览提交仅显示本地反馈。

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

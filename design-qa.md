# 更新日志页面视觉核验

final result: passed

## 对照依据

- 参考页面：http://localhost:6121/admin/changelog；实现：http://localhost:3000/admin/changelog。
- 视觉规范：`DESIGN.md`。按需求复用当前后台壳、暗色 token、本地 Base UI 组件；浅色 Semi 表面、品牌、字体和部分 mock 文案的变化属于明确的项目适配。
- 状态：初始 5 条 mock 记录，搜索为空；桌面与窄屏均检查完整时间线。
- 桌面 CSS 视口 1440 × 1000；源截图 `/tmp/changelog-qa/source-desktop.jpg`（1434 × 1372），实现 `/tmp/changelog-qa/implementation-desktop.jpg`（1430 × 1513）。截图为完整页面，浏览器滚动条使内容宽度略有差异；按相同 720px 宽度缩放并排，不据此判断像素级差异。
- 移动 CSS 视口 390 × 844；源截图 `/tmp/changelog-qa/source-mobile.jpg`（380 × 1996），实现 `/tmp/changelog-qa/implementation-mobile.jpg`（380 × 2035）。内容像素与 CSS 尺寸约 1:1，无双倍密度；并排统一缩放至 390px 宽度。
- 完整对照：`/tmp/changelog-qa/comparison-desktop.jpg`、`/tmp/changelog-qa/comparison-mobile.jpg`；局部标题、筛选卡与时间线对照：`/tmp/changelog-qa/comparison-detail.jpg`。

## 结果

没有未解决的 P0/P1/P2 问题。

- 字体与文字层级：沿用项目 Space Grotesk、正文与等宽字体；版本号、主题、清单和日期层级清楚，窄屏自然换行。
- 间距与布局：保留页首、搜索卡、时间线卡和发布弹窗结构；使用项目 24px 卡片、14px 输入框与胶囊按钮。窄屏搜索与计数纵向排列，正文不会被截断。
- 颜色：全部取自项目 token；功能、安全与性能同时用类型文字和既有语义色标记，无新色板。
- 素材：此页没有独立图像素材，复用后台品牌素材与既有 Lucide 图标。
- 文案：保留参考页的版本与更新记录结构；模拟数据、会话生命周期和发布行为均明确说明。

## 检查与修正记录

发布表单采用 grid 标签时，必填标记可能独占一行；已将标签文字与标记包装在同一个 span，修正后检查移动端弹窗，字段与类型选择间距正常。

浏览器检查已覆盖：版本搜索忽略大小写与首尾空格、无匹配及清空搜索、空表单校验与首个错误字段聚焦、四项类型菜单、模拟发布置顶、空条目默认文案、北京时间日期、发布后焦点返回、站内切换保留记录与刷新恢复 5 条初始数据。390px 视口下 document scrollWidth 为 380px，没有页面级横向溢出；浏览器 error 日志为空。

静态验证：`npx tsc --noEmit`、`npm run lint`、相关文件 `oxfmt --check`、`git diff --check` 均通过。未添加或运行自动化测试。

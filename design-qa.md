# 系统设置页视觉与交互核对

final result: passed

## 比较依据

- 参考页面：http://localhost:6121/admin/settings；参考源码 `semi-shiguang-notes/src/components/SettingsPanel.tsx`，通过 CodeGraph 查询。
- 实现页面：http://localhost:3000/admin/settings；视觉规范以本项目 `DESIGN.md` 为准。
- 参考图片：`/tmp/fuxiaochen-settings-qa/source-desktop.jpg`、`/tmp/fuxiaochen-settings-qa/source-mobile.jpg`。
- 实现图片：`/tmp/fuxiaochen-settings-qa/implementation-desktop.jpg`、`/tmp/fuxiaochen-settings-qa/implementation-mobile.jpg`。
- CSS 视口：桌面 1280 × 900；移动 390 × 844。全页截图分别为参考桌面 1280 × 900、实现桌面 1270 × 1032、参考移动 384 × 1178、实现移动 380 × 1236。截图约为 1:1 CSS 像素，滚动条占宽和全页高度存在差异，未拉伸归一化。
- 状态：个人资料分组、初始数据。源页浅色、实现暗色是用户指定沿用当前设计系统的结果。
- 桌面、移动参考与实现图片均在同一次比较输入中查看。另查看系统偏好与开发分组的实际浏览器画面；表单标签与输入区在全页图片中清晰可读，无需额外裁剪。

## 核对结论

未发现需要修复的 P0/P1/P2 问题。三个设置分组、资料双列／单列结构、头像预览、系统开关与数量字段、开发状态区均对应参考功能结构。

- 字体：采用当前项目 Space Grotesk、Inter 与 ui-monospace，标题、正文、辅助文本层级清晰。
- 布局：沿用当前后台壳、内容宽度、24px 卡片和 14px 内舞台；44px 输入框、胶囊标签与水平滚动标签栏遵循本项目规范，属于有意适配，未照搬 Semi Design。390px 下页面无横向溢出，长开发信息可换行。
- 颜色：使用既有暗色 token，主操作为 primary，错误为 danger，模拟就绪为 success，并提供文字反馈。
- 图片：初始头像复用本地 `/avatar.avif`，保持圆形裁切；空地址与无效地址使用 Lucide 默认头像，不引入参考站品牌或远程初始素材。
- 文案：保留设置字段含义；设计系统信息改为本项目实际依赖；AI 状态、凭证占位、自动备份与保存反馈均明确演示范围。

## 验证记录

- 浏览器操作确认：跨分组保留草稿；一次保存同时提交资料和偏好；站内离开并返回后已保存值保留；刷新恢复初始值。
- 浏览器操作确认：数量 0 拒绝保存；数量 24 正常保存；两个开关可切换并保留。空白站点名称和非 HTTP(S) 头像地址被拦截，从开发分组提交时切回资料分组并聚焦首个错误字段。
- 浏览器操作确认：空头像回退、开发提示关闭、移动端标签切换可用。
- 实现页浏览器 error 日志为空。头像加载失败回退已检查源码，未额外请求故障外链。
- `npx tsc --noEmit`、改动文件 `oxlint` 与 `git diff --check` 通过；WebStorm 对设置组件未报告错误。
- 未添加或运行自动化测试。减少动态效果与 disabled 状态通过复用组件及源码检查确认，未模拟系统偏好。

## 比较历史

本次视觉比较未发现 P0/P1/P2 差异，无视觉修复迭代。实施中的类型和 lint 问题在浏览器核对前已修复。共享 Switch 与 Tabs 补齐 hover、active、disabled 状态，沿用全局减少动态效果规则。

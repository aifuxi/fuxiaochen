# 编辑器图片直传简化验证

验证日期：2026-10-15。复用当前项目 `http://localhost:3000` 的开发服务；浏览器操作使用独立新建文章标签页，未向常用数据库保存测试文章。数据库集成测试只使用临时目录中的独立 SQLite 文件。

## 已实现

- 删除独立媒体页面、侧栏／工作台媒体入口、全局上传队列、素材选择列表、完成核验／引用／删除 API 和媒体清理 CLI。
- 编辑器支持上传后直接插入及完整 HTTP／HTTPS 图片 URL；替代文字、进度、错误、取消和显式重试由本地 Dialog、Input、Button 与原生 progress 表达。
- 浏览器直接 PUT 正式对象，应用只签发地址；不计算摘要，不下载、HEAD、解码或检查文件大小和像素，不创建新媒体记录。图片／文章删除不操作 OSS。
- 保留认证、同源请求保护、JSON 请求约束、Content-Type HTTP 头格式与每分钟签名限流；合法本站图片链接无需媒体记录，文章、设置和友链保存入口一致适配。
- 保留旧媒体表、迁移历史、历史文件和已有正文链接；不执行结构迁移或历史对象清理。OSS_SERVER_ENDPOINT 及其 mode 已退出运行配置，仅需上传 endpoint。

签名参数参考 [AWS SDK v3 预签名公开 API](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-s3-request-presigner/)，上传时声明 MIME 参考 [OSS PutObject 接口](https://www.alibabacloud.com/help/zh/oss/developer-reference/putobject)。实现与测试使用项目已安装版本，未新增或升级依赖。

## 运行通过

| 验证                    | 结果与证据                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 真实 OSS 直传与自动插入 | 上传 320×160、5101 字节的非敏感 PNG 后弹窗关闭，正文出现图片，DOM 的 complete 为 true、naturalWidth 为 320、naturalHeight 为 160；Content-Type 为 image/png          |
| 删除正文图片保留 OSS    | 在正文选中图片后 Backspace 移除，正文回到空文档；随后对原永久地址执行 HEAD，返回 200。没有调用应用删除接口                                                           |
| URL 插入、错误及撤销    | javascript: URL 显示关联字段错误并聚焦输入框；完整站内 HTTP 图片 URL 与替代文字能插入，删除后撤销恢复图片                                                            |
| 取消上传与焦点          | 选择文件后点击「取消上传」，弹窗关闭、正文仍为空、焦点回到编辑器；Escape 关闭空闲弹窗同样回正文                                                                      |
| 桌面与窄屏              | 浅色／深色分别检查 1440×1000 和 390×844。窄屏弹窗宽 340px，表单输入及按钮实际高度均为 44px，页面没有横向溢出                                                         |
| 后台入口                | 新建文章及工作台实际加载，侧栏无媒体库，工作台常用操作仅保留分类标签与数据库备份；构建路由表不再包含 /admin/media                                                    |
| 浏览器传输边界测试      | npm run test:media：4/4，通过原始 File 直传、进度、失败重试、签名后取消、传输中取消和签名接口错误；模拟 XHR／签名响应，不请求云端                                    |
| SQLite 回归             | npm run test:sqlite：29/29，包含签名无文件读取与媒体记录、登录鉴权／限流、无记录图片链接保存，以及正文／文章删除不调用 OSS；原有内容、设置、友链、备份与事务检查通过 |
| 静态与构建              | npm run lint、npm run typecheck、NEXT_BUILD_DIR=.next-build npm run build 通过。删除路由后使用 next typegen 更新旧的生成类型                                         |
| 运维 CLI 打包           | 将 scripts/package-runtime.mjs 输出到独立临时目录成功，追踪 602 个文件，运行 manifest 不包含 media:cleanup                                                           |

真实测试文件保留在 OSS：`media/10fe0cb8-0b6a-4a9f-9b4d-08e5b0f6711c`。取消期间如果对象已经完成上传也遵循保留规则，本次不回收任何 OSS 对象。

截图保存在当前 Codex 会话的可视化目录：`oss-direct-upload.png`、`image-insert-dialog.png` 和 `image-insert-mobile-dark.png`。截图仅证明已观察的布局和图片结果，不代替交互测试。

## 仅源码核对、未验证与既有问题

- hover、active、focus-visible、disabled 与减少动态效果复用共享组件；已观察字段焦点和上传期间禁用状态，其余指针／系统偏好组合仅源码核对。新上传区没有额外动画。
- 服务端保存与删除通过隔离数据库测试；常用数据库没有保存测试文章。真实网络失败后的按钮重试、超时、签名过期、生产域名／ECS RAM Role 和生产部署未验证；相应传输失败及取消由模拟边界测试覆盖。
- 额外执行 npm run test:login，27/28 通过。tests/better-auth.test.ts 的迁移断言仍固定为 4，而 HEAD 中 drizzle/meta/_journal.json 已有 5 条，导致该项失败；本次不修改认证测试或迁移历史。
- 向本地已有 .next-build/standalone 叠加 CLI 打包时，pnpm 依赖链接与 Next 追踪出的实体目录发生 cp 冲突。独立空临时目录打包通过；未据此宣称完整容器打包或部署通过，本次仅移除 CLI 入口，不改动原打包复制逻辑。
- 外部媒体清理调度与 Bucket 权限未自动修改；升级时停用原媒体清理任务。旧 staging/ 生命周期可保留，media/ 不设置自动过期。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 开发服务器启动与复用

- 每次启动开发服务器前，必须先检查当前项目是否已有运行中的开发服务器，结合 IDE 运行状态、进程、监听端口或服务响应确认其所属项目和可用性。
- 已有可用的开发服务器时，优先复用；仅在确认当前项目的开发服务器未启动时，才启动新的实例，避免重复启动。
- 启动时优先通过当前项目对应的 IDE 运行配置执行；IDE 启动能力不可用、没有适用的运行配置或启动失败时，再使用项目既有的命令行启动方式。失败后兜底启动前，须再次检查是否已有实例运行。
- 启动后根据实际运行状态或服务响应确认成功，并记录可复用的访问地址；不能仅凭启动命令已提交认定服务已就绪。

## 项目设计系统

- 所有新增或修改的界面以仓库根目录的 `DESIGN.md` 为视觉与交互规范来源；先阅读其 token 与各章节说明，再实现 UI。
- Tailwind CSS v4 变量须与 `DESIGN.md` 同步。交互基础组件使用 Base UI，按 `components/ui/` 中可编辑、可组合的本地组件方式组织。
- 组件必须覆盖 hover、active、focus-visible、disabled 和 `prefers-reduced-motion`；新设计规则先更新 `DESIGN.md`，再更新实现。

## 后台技术栈与开发约定

- 后台 API 使用 Hono，输入校验使用 Zod，数据库访问使用 Prisma 8 + SQLite。
- 实现前阅读对应版本的官方文档及已安装包的类型定义；不能套用 Prisma 7 的配置、查询和迁移方式。
- Prisma 8 使用 `@prisma/orm-sqlite`、contract、`prisma contract emit` 和 Prisma 8 迁移流程；CLI 配置与服务端运行时必须显式使用同一数据库路径。
- 依赖锁定经核对兼容的具体版本并提交 lockfile；不假设 Prisma CLI 与数据库包的最新版本号相同。记录所用版本的 RC、experimental 状态，不擅自降级到 Prisma 7。
- SQLite 使用 Node.js runtime；数据库连接在开发热更新中复用，CLI 完成后释放连接。数据库代码和秘密不得进入客户端。
- Hono 路由、输入校验和业务逻辑职责分离；从 Zod schema 推导类型，业务处理只使用校验后的输入。统一处理错误，不向客户端暴露内部异常。

## 后台鉴权与登录范围

- 密码使用现代密码哈希算法；会话令牌使用加密安全随机值，数据库只保存令牌哈希。退出撤销当前会话，重置密码撤销该账号的全部会话。
- 页面、API 和数据访问入口按需执行服务端鉴权，不能只依赖 layout 校验。
- Cookie 安全属性、同源校验、请求体限制及登录限流属于登录实现要求。
- 登录持久化任务不自动包含其他后台 Mock 数据迁移；具体字段、错误码和限流参数放在实现与相关文档中，本文件保留长期项目约定。

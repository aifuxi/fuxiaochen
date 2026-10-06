<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 语言与 Git

- 默认使用中文沟通、编写文档和代码注释；项目已有明确语言约定时遵循该约定，技术名词、命令、路径、配置键名和代码标识符保留常用写法。
- Git 提交使用 `type(scope): 中文描述`，遵循 Conventional Commits；优先使用项目既有 scope，没有合适 scope 时可省略。

## 开发服务器启动与复用

- 每次启动开发服务器前，必须先检查当前项目是否已有运行中的开发服务器，结合 IDE 运行状态、进程、监听端口或服务响应确认其所属项目和可用性。
- 已有可用的开发服务器时，优先复用；仅在确认当前项目的开发服务器未启动时，才启动新的实例，避免重复启动。
- 启动时优先通过当前项目对应的 IDE 运行配置执行；IDE 启动能力不可用、没有适用的运行配置或启动失败时，再使用项目既有的命令行启动方式。失败后兜底启动前，须再次检查是否已有实例运行。
- 启动后根据实际运行状态或服务响应确认成功，并记录可复用的访问地址；不能仅凭启动命令已提交认定服务已就绪。

## 项目设计系统

- UI 任务先阅读 [共享设计规范](DESIGN.md)，再按任务阅读 [前台、登录与展示页场景](docs/design/frontend.md) 或 [后台场景](docs/design/admin.md)，无需读取无关业务章节。
- 行为变化阅读 [产品行为](docs/product/behavior.md)；技术变化按需阅读 [数据库维护](docs/maintenance.md)、[媒体存储](docs/media-storage.md) 和 [部署指南](docs/deployment.md)。各文档按职责负责，场景规格只声明布局与显式变体，不另设共享 token。
- Tailwind CSS v4 主题变量在授权的 UI 实现范围内与 `DESIGN.md` 的目标 token 同步。交互基础组件使用 Base UI，按 `components/ui/` 中可编辑、可组合的本地组件方式组织。
- 可交互组件按语义覆盖 hover、active、focus-visible、disabled 和 `prefers-reduced-motion`；静态内容不添加虚假交互状态。
- 共享设计规则更新 `DESIGN.md`，页面布局更新对应场景，业务规则更新产品文档。UI 实现任务在授权范围内同步规范与代码；纯规范任务可记录已批准但待实施的目标，必须注明实现差异与验证状态，不顺带扩大改动范围。
- 参考站对齐任务必须按 [UI 参考采集与回归](docs/engineering/ui-reference-verification.md) 执行：先实际操作参考，再记录布局和交互目标。文档只写布局或简写 hover 时，不能据此省略参考中的交互；规范差异须明确说明采用、适配或不在范围内的依据。
- 使用已有组件或效果前先核对本地组件、已安装依赖和相关 skill。Libraries.dev 已有的效果使用 `libraries-dev` skill、对应参考和安装版本的公开 API，不另写等价效果或绑定库内部 keyframes；普通语义状态仍由本地基础组件负责。
- 交付前按本次改动清单回归受影响页面和共享组件消费者，验证触发、状态变化、结束或复位及真实操作结果。修复后重测该项及关联流程，不能只检查新增代码。
- 验证记录区分已实现、运行通过、仅源码核对、未验证和不适用。截图、类型检查或构建通过不能证明交互通过；完成结论须对应明确证据及剩余范围。

## 后台技术栈与开发约定

- 后台 API 使用 Hono，输入校验使用 Zod，数据库访问使用 Prisma 8 + PostgreSQL。
- 实现前阅读对应版本的官方文档及已安装包的类型定义；不能套用 Prisma 7 的配置、查询和迁移方式。
- Prisma 8 使用 `@prisma/orm-postgres`、contract、`prisma contract emit` 和 Prisma 8 迁移流程；CLI 配置与服务端运行时必须显式使用同一 `DATABASE_URL`。
- 依赖锁定经核对兼容的具体版本并提交 lockfile；不假设 Prisma CLI 与数据库包的最新版本号相同。记录所用版本的 RC、experimental 状态，不擅自降级到 Prisma 7。
- PostgreSQL 使用 Node.js runtime；数据库连接在开发热更新中复用，CLI 完成后释放连接。数据库代码和秘密不得进入客户端。
- Hono 路由、输入校验和业务逻辑职责分离；从 Zod schema 推导类型，业务处理只使用校验后的输入。统一处理错误，不向客户端暴露内部异常。

## 后台鉴权与登录范围

- 密码使用现代密码哈希算法；会话令牌使用加密安全随机值，数据库只保存令牌哈希。退出撤销当前会话，重置密码撤销该账号的全部会话。
- 页面、API 和数据访问入口按需执行服务端鉴权，不能只依赖 layout 校验。
- Cookie 安全属性、同源校验、请求体限制及登录限流属于登录实现要求。
- 登录持久化任务不自动包含其他后台 Mock 数据迁移；具体字段、错误码和限流参数放在实现与相关文档中，本文件保留长期项目约定。

## PostgreSQL 开发与运维

- 本地 PostgreSQL 使用 `compose.dev.yaml`，通过 `npm run db:up` 启动或复用，端口固定为 `127.0.0.1:15433:5432`；Next.js 在电脑上运行。
- 线上应用连接 `postgres:5432`，数据库不发布宿主机端口；应用与数据库凭据不得进入构建或 Git。
- 所有业务写入经 `writeTransaction`／`authTransaction`，使用同一事务级 advisory lock，覆盖 Web 与 CLI。
- 备份使用 PostgreSQL 18 客户端工具，恢复只接受独立空库；不自动删除旧 SQLite 文件、卷或 OSS 对象。

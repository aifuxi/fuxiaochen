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

- 后台 API 使用 Hono，输入校验使用 Zod，数据库访问使用 SQLite + Drizzle ORM + better-sqlite3。
- 实现前阅读对应版本官方文档与已安装类型；依赖锁定具体兼容版本并提交 lockfile。schema 在 `lib/database/schema.ts`，生成且审查 SQL 迁移后提交 `drizzle/`。
- 数据库使用 Node.js runtime，开发热更新复用连接，CLI 完成后关闭连接；数据库代码不得进入客户端。
- SQLite 驱动使用同步事务；事务回调不能 async、返回 Promise 或执行网络操作。异步密码校验、OSS 等操作先在事务外完成，再在写事务内复核状态。
- Hono 路由、输入校验和业务逻辑职责分离；从 Zod schema 推导类型，统一处理错误，不向客户端暴露内部异常。

## 后台鉴权与登录范围

- 后台认证与会话使用 Better Auth；项目只保留表单契约、业务权限及 SQLite 同步事务/哈希存储适配。Passkey 等扩展使用官方插件，单独验证注册、撤销与恢复流程，不继续扩大自研认证机制。
- 密码使用现代密码哈希算法；会话令牌使用加密安全随机值，数据库只保存令牌哈希。退出撤销当前会话，重置密码撤销该账号的全部会话。
- 页面、API 和数据访问入口按需执行服务端鉴权，不能只依赖 layout 校验。
- Cookie 安全属性、同源校验、请求体限制及登录限流属于登录实现要求。
- 登录持久化任务不自动包含其他后台 Mock 数据迁移；具体字段、错误码和限流参数放在实现与相关文档中，本文件保留长期项目约定。

## SQLite 开发与运维

- `DATABASE_PATH` 必须显式指向 SQLite 文件；普通连接、迁移和验证不创建缺失文件，首次初始化由 `db:init` 独占创建。测试只使用临时目录中的独立文件。
- 数据库启用 WAL、外键、FULL 同步和明确的锁等待时间。所有业务写入经 `writeTransaction`／`authTransaction` 的同步 IMMEDIATE 事务，跨 Web 和 CLI 由 SQLite 文件锁串行化。
- 时间保存为 UTC 毫秒，业务读取为 Date；整数读写校验 JavaScript 安全范围。统计继续按 Asia/Shanghai 分日。
- 迁移历史 hash 必须匹配；SQLite 表重建迁移在事务外暂时关闭外键，提交前检查完整性与全部外键，最终恢复开关。不能在已有事务内运行迁移。
- 在线备份使用一致性快照，备份/恢复使用完整 integrity_check；恢复只接受独立新文件并撤销登录会话。不覆盖或自动删除旧 SQLite、PostgreSQL 卷、备份或 OSS 对象。
- PostgreSQL 导出仅使用显式 `MIGRATION_SOURCE_DATABASE_URL` 和只读一致性快照，不加载业务 `.env`；SQLite 导入只发布独立的新文件，导入后逐字段核对。演练只使用专用新测试实例，禁止复用现有开发库或线上库。
- 生产 `runtime` 为单镜像，包含 standalone Web 和追踪后的维护 CLI；Compose 仅一个 app，使用明确的外部新 SQLite 卷，不接管旧 PostgreSQL/SQLite 卷。
- 容器 serve 每次已有库启动先备份、迁移并完整校验；默认拒绝缺失文件，仅全新站点显式 `SQLITE_INITIALIZE=1` 可初始化。迁移前在 IMMEDIATE 锁内复核备份期间没有其他提交；启动/迁移失败不启动 Web 且保留完整备份。
- entrypoint 使用实例/维护 flock，禁止同库多 Web、滚动升级及在线结构迁移；日常 CLI 可共享维护锁。不要绕过入口或删除锁文件；SQLite 使用本机持久磁盘，不支持多机/NFS。
- 当前已完成基础层、查询适配、迁移工具与单镜像/Portainer 本地验证；线上数据切换、生产部署和真实服务器验证尚未执行。
- Prisma 依赖、源码及旧 PostgreSQL 实现已移除。PostgreSQL → SQLite 工具仅使用 `pg` 和 `lib/database-transfer/source-contract.json` 中的固定源库基线；旧源库 control marker 的只读核验属于迁移兼容性，不引入旧 ORM。

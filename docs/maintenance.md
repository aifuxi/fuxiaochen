# 数据库维护

## Prisma 8 与迁移

模型源为 `prisma/contract.ts`，配置为 `prisma.config.ts`，生成目录为 `generated/prisma/`。CLI 与应用共用 `DATABASE_URL`，配置从项目根目录 `.env` 或部署环境读取，不使用 `DATABASE_PATH`。生成 contract 和构建无需在线数据库；数据库命令必须配置连接 URL。

使用 Prisma CLI `8.0.0-rc.19`、PostgreSQL runtime `@prisma/orm-postgres@8.0.0-rc.14`，仍处于 RC 阶段。`package.json` 的 overrides 对齐 toolchain `8.0.0-rc.14` 和 CLI engine `0.6.2`，升级前核对官方文档与安装类型，不降级至 Prisma 7。

PostgreSQL 使用独立的初始迁移，不复用 SQLite 的迁移 ledger/marker。旧数据库和旧备份保留；`db:restore` 仅接受 PostgreSQL 备份。SQLite 数据切换使用下面的独立导入命令，不使用旧正文或历史 OSS 图片迁移命令。

```sh
npm run db:generate
# 显式指定当前已应用迁移的目标 hash，或先设置 db ref。
npm run db:plan -- --name describe-change --from <当前目标hash>
# 审查新增 migration.ts、ops.json、migration.json 与 contract 快照。
npm run db:migrate
```

初始迁移已经提交，空库直接运行 `db:migrate`。`migration plan` 是离线命令，没有 ref 时可能按空库规划；不得对已有迁移历史无起点地生成第二份初始迁移。`db migrate` 默认不推进 ref，可使用 `prisma migration ref set db <hash>` 设置下次规划起点。迁移入口使用顶层 `await MigrationCLI.run(...)`。

提交 contract 源、迁移和快照，不提交 `generated/`、环境文件、数据库或备份。迁移后重启应用，使连接加载新 contract。

## SQLite 数据导入 PostgreSQL

`db:import-sqlite` 仅用于把旧 Prisma SQLite schema 的一致性快照导入当前 PostgreSQL contract。适配的旧源包含 22 张业务表，支持文章摘要与精选字段、SEO 字段及日志状态字段尚未新增的版本；未知表、未知列、缺失旧字段、无效正文、悬空关系、不安全整数及非 UTC ISO 时间均拒绝。源必须由 SQLite backup API 导出，包含 WAL 中已提交的数据；不能用单独复制主文件代替。导入只读打开源，并拒绝带非空 WAL/journal 的输入。

```sh
# 只预检源和映射，不连接 PostgreSQL；可在未配置 DATABASE_URL 时运行。
npm run db:import-sqlite -- --source /absolute/release/source.sqlite --dry-run --report /absolute/release/preflight.json
# 将 DATABASE_URL 配置为独立目标库，以当前应用账号创建结构。
npm run db:migrate
npm run db:import-sqlite -- --source /absolute/release/source.sqlite --apply --report /absolute/release/import.json
npm run db:import-sqlite -- --source /absolute/release/source.sqlite --verify --report /absolute/release/verify.json
```

`--source`、唯一的模式参数及 `--report` 必填。报告目录预先创建并由服务账号独占；报告以 0600 独占创建，拒绝覆盖已有文件或源快照，失败后重试使用新报告路径。报告包含源 SHA-256、目标主机与库名、contract hash、每表数量和数据摘要，不包含账号密码哈希、正文、访客信息或数据库凭据。`--dry-run` 的 `targetChecked=false`、`targetCount=null`，只证明源校验通过；`--apply` 和 `--verify` 先运行官方 `db verify`，校验当前 contract 与结构。

正式导入前停止旧应用、外部调度及所有 SQLite 写入，再取得最终快照；演练快照不能代替最终快照。目标先通过当前正式迁移建立结构，但 22 张业务表必须全部为空；不要提前启动新 Web、初始化管理员或运行调度。全部写入共用 `writeTransaction` 的 advisory lock，锁后再次拒绝非空目标，提交前逐表核对数量及所有字段摘要；任一步失败整笔回滚。重复 `--apply` 拒绝覆盖，已导入库使用 `--verify`。源摘要在预检、写入前和提交前再次核对。CLI 退出关闭 SQLite、ORM 和报告文件。

保留管理员 id、用户名、Argon2id 密码哈希、全部业务 ID/关系/时间/版本、媒体元数据、通知不透明 ID 与已读记录，以及 `visit_session`/`page_visit` 访问统计。未存在的新字段补齐：文章 `summary=""`、`isFeatured=0`、`featuredOrder=0`；SEO 五列 NULL；日志 `status="published"`、`revision=1`、`updatedAt=NULL`。原有字段不从本地开发库补写。鉴权 `session`、四张限流表、`backup_run` 和 SQLite 内部表不导入；管理员使用原密码重新登录。运维设置保留版本和时间，但 `autoBackup=0`、`schedulerLastRunAt=NULL`，验收后再恢复调度。

OSS 对象保留原位置，沿用原 Bucket、公开域名及对象键；此命令不上传、删除或重写媒体。切换前保留旧镜像、配置、SQLite 卷与最终快照，切换后生成 PostgreSQL 备份并保存异地副本。外部写入重新开放前可以恢复旧 SQLite 应用；新 PostgreSQL 已接收业务写入后不能直接切回旧 SQLite，须先冻结写入、备份并核对增量。恢复 PostgreSQL 仍使用匹配 contract 的应用版本和独立空库，不能删除生产卷解决失败。

## 连接与事务

2026-10-06 增量迁移 `20261006T0523_add_site_seo` 为 `site_setting` 新增搜索描述、分享图与三项站长验证字段。数据库列允许 NULL，服务层映射为空字符串；既有资料和设置保持原值。生成新 contract 后执行 `npm run db:migrate`，再重启应用加载新 contract。

应用连接使用惰性初始化并在开发热更新中复用；CLI 使用 `finally` 关闭连接。所有业务写入必须经 `writeTransaction`／`authTransaction`，先取得固定事务级 advisory lock `734825101` 再读取和写入。Web、管理员命令与外部调度共用该锁，提交或回滚时自动释放。

数据位于 `public` schema。时间使用带时区时间戳与 JavaScript `Date`，原整数使用 `pg/int8number@1`，超出 JavaScript 安全整数范围时拒绝转换。JSON 文档仍保存为经过业务校验的文本，查询时转换为 jsonb。搜索使用 `strpos(lower(...), lower(...))`，关键词中的 `%`、`_` 不作为通配符；统计按 `Asia/Shanghai` 分日。

## 账号与工具

```sh
npm run admin:init
npm run admin:reset-password
npm run media:cleanup -- --dry-run
npm run analytics:cleanup
npm run posts:publish-due
```

账号管理交互输入密码；重置密码撤销该账号全部会话。媒体清理操作 OSS 对象，先核对 dry-run。排期和统计清理均使用与 Web 相同的 PostgreSQL。

备份、恢复和部署步骤见 [部署指南](deployment.md)。参考 [Prisma PostgreSQL 扩展](https://www.prisma.io/extensions/postgresql)、[Prisma 8 contract](https://www.prisma.io/docs/orm/contract-authoring/typescript-schema-builder)、[PostgreSQL advisory locks](https://www.postgresql.org/docs/18/explicit-locking.html)。

## 正文格式与查询机制

正文保存为带格式与版本的 Tiptap JSON 文本；`lib/posts/document.ts` 序列化 `{ format: "fuxiaochen-tiptap", version: 1, document, text }`，读取时校验格式、版本及完整节点结构。编辑器、服务端校验和前台静态渲染共用内容节点定义；正文搜索使用归一化的纯文本，不查询标记结构。当前编辑、前台渲染和搜索不读取旧 Markdown，Markdown 仅作为导入格式，不在本轮恢复旧数据迁移。

Markdown 导入由 `lib/posts/markdown-document.ts` 解析为同一种文档，支持 GFM；原始 HTML 和不支持的语法保留为文字，不执行。导入合并后再次校验完整文档，链接与图片使用共享 URL 校验。导入上限、插入语义、保存状态与失败保留见 [产品行为](product/behavior.md)，编辑器和正文布局分别见 [后台场景](design/admin.md) 与 [前台场景](design/frontend.md)。

后台筛选和搜索使用业务查询入口，查询条件变化时取消旧请求，避免旧结果覆盖新条件。访客记录每 10 秒查询，页面隐藏、卸载或暂停时停止轮询，恢复时立即刷新；暂停只冻结后台查询，不关闭前台采集。产品状态、分页和统计口径由产品文档维护，轮询不作为视觉动效。

## 草稿与更新日志增量迁移

2026-10-07 的 `20261007T0840_admin_drafts_release_states` 包含五项操作：文章 `slug`、`categoryId` 放宽为可空，日志新增 `status`（默认 `published`）、`revision`（默认 `1`）、可空 `updatedAt`。既有文章字段、分类关联、日志内容和创建时间不改写；旧日志的修改时间在应用读取时回退为创建时间。不删除表、记录或约束中的外键与唯一索引。

目标 contract 为 `2908a7712d8c234e7671488cc7e62c5552ae2f7b838a6e8788aef33ca9e2416e`，起点为 `eaa0e043a6985448dcc638cef2f4279c89a5c6ede8cf63570cd33de7d09a7bb8`。代码须与迁移一起启用，重新生成 contract 并在迁移后重启应用连接。已在独立空库及含旧文章、日志的独立库运行验证。2026-10-07 经用户批准在本地 `fuxiaochen_dev` 完成备份、迁移、结构与原有数据核对，并通过原有 WebStorm 配置重启应用；未执行线上迁移。验收与备份标识见[第二轮验收记录](engineering/admin-second-pass-verification.md)。

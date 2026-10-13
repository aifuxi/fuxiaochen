# 数据库维护

当前应用已使用 SQLite + Drizzle + better-sqlite3。以下新机制用于本地适配；历史 PostgreSQL 机制保留作迁移对照，不表示线上已切换。

## SQLite 基础层与迁移

schema 为 `lib/database/schema.ts`，连接与写事务为 `lib/database/index.ts`，SQL 迁移和开发快照位于 `drizzle/`。Drizzle ORM 0.45.4、drizzle-kit 0.31.11、better-sqlite3 13.0.3 使用固定版本。Kit 只离线生成 SQL，生产运行不需要 CLI 或生成 Prisma contract。

`DATABASE_PATH` 必须显式指向 SQLite 文件；当前阶段不自动创建或接管数据库。`db:init` 使用独占文件创建，拒绝覆盖已有文件；普通连接、`db:migrate`、`db:verify` 拒绝缺失文件和历史无迁移 ledger 的文件。现有 `.env` 和旧 SQLite/PostgreSQL 数据保留，本阶段不自动导入。

```sh
# 首次显式初始化独立文件，所在目录需已创建。
npm run db:init
# schema 变化后离线生成 SQL，审查 SQL、journal 和 snapshot，再提交。
npm run db:generate -- --name describe-change
# 停止应用和调度，先备份，再迁移已有 SQLite 文件。
npm run db:migrate
npm run db:verify
```

迁移使用 Drizzle 公开 migration reader 读取已提交 SQL 和 SHA-256，以 SQLite IMMEDIATE 事务执行并保存 ledger。拒绝历史 hash 变化、未知版本与已有事务内调用。表重建时先在事务外暂时关闭外键，避免 DROP 父表级联删子记录；提交前核对完整性、全部外键与预期结构，失败全部回滚，最终恢复外键开关。版本已升级的数据库不能靠换回旧应用直接回退。

连接启用 WAL、foreign_keys、synchronous=FULL 和 5 秒 busy timeout，开发热更新复用连接。所有业务写入经同步 `writeTransaction` / `authTransaction`，支持嵌套 savepoint；类型和运行时均拒绝 async 回调或 Promise。密码校验和 OSS 操作位于事务外，事务内复核状态。时间为 UTC 毫秒并映射 Date，整数读写检查安全范围；北京时间统计不变。连接注册 Unicode lower 保留搜索大小写语义，`instr` 保留 `%`/`_` 字面匹配，JSON 文本通过 `json_extract`/`json_each` 检索。

SQLite 备份使用 better-sqlite3 在线 backup API，生成 `database.sqlite` 与 `manifest.json`；manifest 记录格式、迁移版本、大小与摘要。显式校验、备份和恢复使用 `integrity_check`，普通连接使用快速完整性校验加版本/结构/外键检查。恢复指定绝对 `RESTORE_DATABASE_PATH`，目标必须独立且不存在，拒绝已有文件、主库、源库和遗留 WAL；成功后撤销会话、关闭自动备份并标记中断任务。PostgreSQL 备份格式不兼容，旧备份必须使用匹配旧版本恢复。

PostgreSQL → SQLite 离线迁移工具已实现并在独立测试库演练，操作见下节。单镜像运维打包和启动自动备份/迁移尚未实施，生产部署说明仍为历史方案，不能直接用于当前源码。

## PostgreSQL → SQLite 离线迁移

入口为 `scripts/postgres-transfer.ts`，实现位于 `lib/database-transfer/`。工具依赖 Node.js 24、已安装的 `pg`、better-sqlite3 与 tsx，不调用 Prisma CLI，不修改 `prisma/` 或连接应用数据库。当前已完成专用 PostgreSQL 18.6 与临时 SQLite 的演练，未连接线上数据库；验收见 [迁移工具验证记录](engineering/postgres-sqlite-transfer-verification.md)。

### 源库与归档

导出只接受显式 `MIGRATION_SOURCE_DATABASE_URL`，不加载项目 `.env`，也不回退到 `DATABASE_URL`。建议使用只具 SELECT 和 schema USAGE 权限的独立读取账号，须能读取 22 张 `public` 业务表及存在的 `prisma_contract.marker`。连接设置默认只读，在 `REPEATABLE READ READ ONLY` 事务中取得统一快照；ACCESS SHARE 锁防止导出过程中修改表结构，正常业务写入仍可继续。演练导出不能替代正式冻结写入后的最终导出。

工具核对源字段、原生类型、NULL、主键、唯一约束、外键及引用动作，与已提交的 PostgreSQL contract `2908a771…e2416e` 一致；存在 Prisma marker 时也必须匹配。未知业务表、行级安全、分区、继承、空管理员库、整数溢出和无法保留的亚毫秒时间会拒绝导出。时间通过 PostgreSQL 数值投影转换为 UTC 毫秒，不经 JavaScript Date 解析器静默丢弃精度。

导出目录必须不存在，父目录预先创建。22 份 JSONL 按原主键排序并使用固定字段顺序的规范 JSON 编码，最后生成 `manifest.json`，记录快照、源 contract、目标 SQLite migration hash、每表数量、字节数和 SHA-256。导入拒绝非规范编码，防止小数被 JSON 解析舍入、重复字段被覆盖。只有完整且匹配的 manifest 才能导入；失败目录保留供检查，重试使用新目录。目录为 0700，归档文件和报告为 0600。归档含密码哈希、正文及访客信息，应保存到服务账号私有目录，不提交 Git。

以下示例需在项目根目录运行；先创建私有目录和权限为 0600 的 `/absolute/private/transfer.env`，其中仅配置明确的独立源连接 `MIGRATION_SOURCE_DATABASE_URL`。不要在命令行、日志或 Git 中放入 URL 凭据。

```sh
# 导出显式指定的源库，不读取项目 .env；目录和报告均使用新的路径。
node --env-file=/absolute/private/transfer.env --conditions=react-server --import tsx \
  scripts/postgres-transfer.ts --export \
  --directory /absolute/private/snapshot \
  --report /absolute/private/export.json

# 只预检归档、全部关系、唯一值与映射；不打开或创建目标库。
npm run db:import-postgres -- \
  --directory /absolute/private/snapshot --target /absolute/private/site.sqlite \
  --dry-run --report /absolute/private/preflight.json

# 仅发布不存在的新文件；不要提前 db:init、admin:init 或启动应用。
npm run db:import-postgres -- \
  --directory /absolute/private/snapshot --target /absolute/private/site.sqlite \
  --apply --report /absolute/private/import.json

# 应用和调度尚未使用目标时再核对；不改写目标或创建日志文件。
npm run db:import-postgres -- \
  --directory /absolute/private/snapshot --target /absolute/private/site.sqlite \
  --verify --report /absolute/private/verify.json
```

`--directory`、`--report` 与唯一操作必填；导入还必须指定 `--target` 和唯一模式。相对路径按当前 cwd 解析，迁移资源固定从工具自身目录定位。报告必须在归档之外，不得与目标或 WAL/shm/journal 重叠，已有报告拒绝覆盖。`db:export-postgres` 用于已经显式设置源环境变量的场景。

### 数据保留与转换

| 数据                                                             | 迁移策略                                                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 管理员、文章、标签、分类、日志、设置、友链、评论、媒体和访问统计 | 保留原 ID、全部字段、NULL、版本和 UTC 毫秒；正文与日志 JSON 保留原文本                    |
| 管理员密码                                                       | 原 Argon2id 哈希直接保留，使用原密码重新登录                                              |
| 登录 `session`                                                   | 清空，撤销所有旧登录状态                                                                  |
| 四类限流表                                                       | 清空临时计数                                                                              |
| `backup_run`、`kind=backup` 通知及对应已读关联                   | 完整保存在 PostgreSQL 导出归档，不导入 SQLite；旧 PostgreSQL 备份不能作为 SQLite 备份恢复 |
| 其他通知与已读关联                                               | 保留原 ID、内容和关联                                                                     |
| `operation_setting`                                              | `autoBackup=0`、`schedulerLastRunAt=NULL`；版本、时间和其他字段保留                       |
| OSS                                                              | 保留对象键和元数据，不上传、删除、重写或访问远程对象                                      |

逐字段报告区分源 `source`、策略转换后的 `planned` 和实际 `target`，每项包含数量、整行摘要与所有字段摘要。`--dry-run` 的 `targetChecked=false`、`verified=false`、`target=null`；它证明归档和映射预检通过。apply/verify 逐行比较所有字段，并校验 ledger、schema、integrity_check 和 foreign_key_check，不能仅凭记录数认定迁移成功。报告及终端不输出数据行、哈希原值、账号信息或连接凭据。

apply 在目标父目录的私有临时文件中建立 SQLite 结构，使用单个同步 IMMEDIATE 事务写入并核对。延迟外键支持子评论先于父评论；提交前检查全部关系。再次核对源归档，关闭数据库、写入并同步报告后，以独占硬链接发布新文件；任何已有目标（包括空文件）或遗留日志均拒绝。失败只清理本次临时库和未完成报告，不覆盖旧库。进程被强制终止时可能停在报告已写入、目标尚未发布的窗口，完成判断必须同时确认 CLI 成功退出、目标存在及后续 verify 通过，不能只读取报告的 verified 字段。

verify 只接受停止使用、无 WAL/shm/journal 的普通 SQLite 文件。为避免只读打开 WAL 库产生日志，它将文件读取为只读内存数据库；仅调整内存副本的 WAL header，再比对原文件 inode、时间、大小和摘要确认未变化。核对时需要足够内存容纳目标文件与 SQLite 副本；归档按行读取，离线关系检查另保存键索引，内存占用随记录数增长。

### 演练与正式切换边界

演练使用专用新 PostgreSQL 实例、临时数据库和 SELECT-only 读取账号，不使用现有开发库。将新实例的管理员 URL 放入权限为 0600 的独立 env 文件的 `TEST_POSTGRES_ADMIN_URL` 后运行：

```sh
# 仅对专用本机 PostgreSQL 18 测试实例运行：测试会创建并删除自己的随机数据库/角色。
# helper 拒绝常用 5432/15433 端口，不加载业务 .env。
node --env-file=/absolute/private/test.env --conditions=react-server --import tsx \
  --test --test-concurrency=1 tests/postgres-transfer.test.ts
```

正式切换尚未执行。后续部署阶段先准备兼容 SQLite 的镜像、持久卷及启动流程，再冻结旧 Web、调度和全部写入，取得最终归档并重复预检、导入、核对。保留旧镜像、配置、PostgreSQL 卷和旧备份；核对前不要启动新应用。新库开始接收写入后，旧 PostgreSQL 将落后，不能直接切回而丢失增量。生产 Compose、Portainer 和调度切换需单独实施与验证。

## 历史 PostgreSQL 与 Prisma 8（只作对照）

以下属于提交 `4d72e636` 及之前的 PostgreSQL 实现。`prisma/`、旧导入/迁移脚本和相关测试保留作历史参考，并从当前应用 TypeScript 编译中排除；Prisma 与 pg 依赖暂留 devDependencies。旧回归调用当前 SQLite 业务模块不再构成有效验收，应使用匹配旧提交运行。

### 原迁移机制

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

### 原 SQLite 数据导入 PostgreSQL

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

### 原 PostgreSQL 连接与事务

2026-10-06 增量迁移 `20261006T0523_add_site_seo` 为 `site_setting` 新增搜索描述、分享图与三项站长验证字段。数据库列允许 NULL，服务层映射为空字符串；既有资料和设置保持原值。生成新 contract 后执行 `npm run db:migrate`，再重启应用加载新 contract。

应用连接使用惰性初始化并在开发热更新中复用；CLI 使用 `finally` 关闭连接。所有业务写入必须经 `writeTransaction`／`authTransaction`，先取得固定事务级 advisory lock `734825101` 再读取和写入。Web、管理员命令与外部调度共用该锁，提交或回滚时自动释放。

数据位于 `public` schema。时间使用带时区时间戳与 JavaScript `Date`，原整数使用 `pg/int8number@1`，超出 JavaScript 安全整数范围时拒绝转换。JSON 文档仍保存为经过业务校验的文本，查询时转换为 jsonb。搜索使用 `strpos(lower(...), lower(...))`，关键词中的 `%`、`_` 不作为通配符；统计按 `Asia/Shanghai` 分日。

### 原账号与工具命令

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

## 历史 PostgreSQL 草稿与更新日志增量迁移

2026-10-07 的 `20261007T0840_admin_drafts_release_states` 包含五项操作：文章 `slug`、`categoryId` 放宽为可空，日志新增 `status`（默认 `published`）、`revision`（默认 `1`）、可空 `updatedAt`。既有文章字段、分类关联、日志内容和创建时间不改写；旧日志的修改时间在应用读取时回退为创建时间。不删除表、记录或约束中的外键与唯一索引。

目标 contract 为 `2908a7712d8c234e7671488cc7e62c5552ae2f7b838a6e8788aef33ca9e2416e`，起点为 `eaa0e043a6985448dcc638cef2f4279c89a5c6ede8cf63570cd33de7d09a7bb8`。代码须与迁移一起启用，重新生成 contract 并在迁移后重启应用连接。已在独立空库及含旧文章、日志的独立库运行验证。2026-10-07 经用户批准在本地 `fuxiaochen_dev` 完成备份、迁移、结构与原有数据核对，并通过原有 WebStorm 配置重启应用；未执行线上迁移。验收与备份标识见[第二轮验收记录](engineering/admin-second-pass-verification.md)。

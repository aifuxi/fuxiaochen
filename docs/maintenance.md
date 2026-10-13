# 数据库维护

当前应用已使用 SQLite + Drizzle + better-sqlite3。以下新机制用于本地适配；历史 PostgreSQL 机制保留作迁移对照，不表示线上已切换。

## SQLite 基础层与迁移

schema 为 `lib/database/schema.ts`，连接与写事务为 `lib/database/index.ts`，SQL 迁移和开发快照位于 `drizzle/`。Drizzle ORM 0.45.4、drizzle-kit 0.31.11、better-sqlite3 13.0.3 使用固定版本。Kit 只离线生成 SQL，生产运行不需要 Kit CLI 或旧 ORM 生成物。

`DATABASE_PATH` 必须显式指向 SQLite 文件。`db:init` 使用独占文件创建，拒绝覆盖已有文件；普通连接、`db:migrate`、`db:verify` 拒绝缺失文件和历史无迁移 ledger 的文件。容器默认也拒绝缺失文件，仅明确的 `SQLITE_INITIALIZE=1` 允许全新站点首次初始化；已有站点先离线导入，不能接管历史文件。现有 `.env` 和旧 SQLite/PostgreSQL 数据保留，不自动导入。

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

PostgreSQL → SQLite 离线迁移工具已实现并在独立测试库演练，操作见下节。SQLite 单镜像、启动前自动备份/迁移/校验和 Portainer 单服务配置已完成本地验证；线上尚未切换。当前操作见 [部署指南](deployment.md)，历史 PostgreSQL 配置只作对照。

### 启动前备份与升级

`scripts/startup-database.ts` 不加载 `.env`，仅使用显式 `DATABASE_PATH` 和 `BACKUP_DIRECTORY`；迁移资源按模块位置定位。已有库接受已提交迁移的合法前缀，先检查该旧版本结构/完整性/外键，再通过 backup API 保存 WAL 一致性快照，最后执行迁移并完整校验。未知或被改写的 ledger、无历史记录、结构漂移、损坏、备份失败都阻止启动。

启动备份保存在 `BACKUP_DIRECTORY/startup/<UTC时间-UUID>/`，使用与业务备份兼容的 manifest，加 `purpose=before-startup-migration`；源 schema hash/迁移前缀和目标 hash 分开记录。旧前缀快照必须使用匹配旧结构的镜像恢复到独立新文件；当前快照可用当前 `db:restore`，同样撤销会话和关闭自动备份。启动快照不登记业务备份表，后台历史列表不展示；没有自动删除或保留策略，需检查容量并保存异地副本。

容器 entrypoint 用实例锁限制单 Web、维护锁串行化启动/结构升级并允许日常 CLI 与 Web 共用数据库。启动模块在 IMMEDIATE 写锁内再次检查 `data_version`，备份期间其他客户端提交时拒绝迁移且保留备份；首次恢复的 DELETE journal 库会先规范为 WAL，再取得并发复核基准，不误报自己的配置变化。迁移 `beforeMigration` hook 只接受同步回调，拒绝 async/Promise。

```sh
# 非容器环境必须显式加载私有配置，BACKUP_DIRECTORY 需非空并指向持久私有目录。
# 先停止 Web 与调度；该命令完成启动准备，不自行开启 Web。
node --env-file=/absolute/private/runtime.env --conditions=react-server --import tsx scripts/startup-database.ts
```

首次初始化必须显式传 `--initialize-if-missing`，独占发布完成的新文件，不创建管理员。普通本地 `npm run dev` 不自动运行该生产流程。完整范围与运行结果见 [单镜像验收](engineering/sqlite-deployment-verification.md)。

## PostgreSQL → SQLite 离线迁移

Prisma 依赖、源码、旧 SQLite → PostgreSQL 导入脚本及旧回归已移除；历史实现如需查阅，使用 Git 历史中的匹配版本。当前工具保留旧源库 `prisma_contract.marker` 的只读核验，以拒绝不匹配的源结构。

入口为 `scripts/postgres-transfer.ts`，实现位于 `lib/database-transfer/`。工具依赖 Node.js 24、已安装的 `pg`、better-sqlite3 与 tsx，源库结构基线保存在 `lib/database-transfer/source-contract.json`，不依赖旧 ORM 或连接应用数据库。当前已完成专用 PostgreSQL 18.6 与临时 SQLite 的演练，未连接线上数据库；验收见 [迁移工具验证记录](engineering/postgres-sqlite-transfer-verification.md)。

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

## 正文格式与查询机制

正文保存为带格式与版本的 Tiptap JSON 文本；`lib/posts/document.ts` 序列化 `{ format: "fuxiaochen-tiptap", version: 1, document, text }`，读取时校验格式、版本及完整节点结构。编辑器、服务端校验和前台静态渲染共用内容节点定义；正文搜索使用归一化的纯文本，不查询标记结构。当前编辑、前台渲染和搜索不读取旧 Markdown，Markdown 仅作为导入格式，不在本轮恢复旧数据迁移。

Markdown 导入由 `lib/posts/markdown-document.ts` 解析为同一种文档，支持 GFM；原始 HTML 和不支持的语法保留为文字，不执行。导入合并后再次校验完整文档，链接与图片使用共享 URL 校验。导入上限、插入语义、保存状态与失败保留见 [产品行为](product/behavior.md)，编辑器和正文布局分别见 [后台场景](design/admin.md) 与 [前台场景](design/frontend.md)。

后台筛选和搜索使用业务查询入口，查询条件变化时取消旧请求，避免旧结果覆盖新条件。访客记录每 10 秒查询，页面隐藏、卸载或暂停时停止轮询，恢复时立即刷新；暂停只冻结后台查询，不关闭前台采集。产品状态、分页和统计口径由产品文档维护，轮询不作为视觉动效。

## 历史 PostgreSQL 草稿与更新日志增量迁移

2026-10-07 的 `20261007T0840_admin_drafts_release_states` 包含五项操作：文章 `slug`、`categoryId` 放宽为可空，日志新增 `status`（默认 `published`）、`revision`（默认 `1`）、可空 `updatedAt`。既有文章字段、分类关联、日志内容和创建时间不改写；旧日志的修改时间在应用读取时回退为创建时间。不删除表、记录或约束中的外键与唯一索引。

目标 contract 为 `2908a7712d8c234e7671488cc7e62c5552ae2f7b838a6e8788aef33ca9e2416e`，起点为 `eaa0e043a6985448dcc638cef2f4279c89a5c6ede8cf63570cd33de7d09a7bb8`。代码须与迁移一起启用，重新生成 contract 并在迁移后重启应用连接。已在独立空库及含旧文章、日志的独立库运行验证。2026-10-07 经用户批准在本地 `fuxiaochen_dev` 完成备份、迁移、结构与原有数据核对，并通过原有 WebStorm 配置重启应用；未执行线上迁移。验收与备份标识见[第二轮验收记录](engineering/admin-second-pass-verification.md)。

# PostgreSQL → SQLite 迁移工具验收

> 2026-10-21：已按用户要求将阿里云线上旧 PostgreSQL 的只读快照导入本地 SQLite 并切换本地预览，见文末[线上 PostgreSQL 数据导入本地](#线上-postgresql-数据导入本地)。线上应用、数据库及部署配置未修改。

> 2026-10-14：评论、本地访问统计、访客日志与全局搜索已移除。本文保留历史验收事实；现行范围和验证见[功能移除验收](feature-removal-verification.md)。

> 2026-10-14：已按用户要求导入本机旧 PostgreSQL 开发数据并切换本地开发服务，见文末[实际导入记录](#本地旧-postgresql-数据实际导入)。此前演练范围与限制保留作为历史记录。

日期：2026-10-13。范围为只读 PostgreSQL 导出、离线 SQLite 预检/导入/核对，以及专用测试库演练。未连接线上数据库或现有开发数据库，未修改生产 Dockerfile、Compose、Actions 或 Portainer，未推送或部署。

## 已实现

- `scripts/postgres-transfer.ts` 提供 `--export` 与 `--import`，导入分 `--dry-run`、`--apply`、`--verify`。对应 npm 入口为 `db:export-postgres`、`db:import-postgres`，操作说明见 [数据库维护](../maintenance.md#postgresql--sqlite-离线迁移)。
- 源连接仅来自显式 `MIGRATION_SOURCE_DATABASE_URL`；不加载 `.env`，不回退到 `DATABASE_URL`。导出使用专用 pg Client、默认只读和 REPEATABLE READ READ ONLY 快照，22 表统一读取；ACCESS SHARE 防止核对后的 DDL 改动。
- 基于最后一版已提交 PostgreSQL contract 检查表、字段类型、NULL、主键、唯一约束和外键语义；存在 `prisma_contract.marker` 时核对 hash。不运行或改写历史 Prisma 迁移，不依赖生成目录。
- 使用游标分批读取，归档保留原字符串、NULL、全部 ID 与字段；时间通过数值投影保存 UTC 毫秒。拒绝不安全整数、亚毫秒时间、无效日期和无 id=1 管理员的源。
- 22 份规范 JSONL 与最后写入的 manifest 包含数量、字节数、摘要及源/目标版本。离线预检全部主键、唯一值、外键、评论父子关系/循环、正文、日志、密码哈希格式及布尔值；拒绝损坏、未知版本、未知字段、非规范数值和软链接输入。
- 密码哈希、OSS 引用、内容和访问统计保留；旧会话和四类限流清空。旧 PostgreSQL 备份记录、backup 通知及其已读关联只归档；自动备份关闭并清空调度上次运行时间。
- apply 在私有临时 SQLite 中迁移并以同步 IMMEDIATE 事务导入，提交前完整校验和逐行/逐字段核对，再独占发布新文件。已有目标、空文件、报告或日志均不覆盖；失败清理自己的临时库与未完成报告。
- verify 在内存只读副本中检查 ledger、schema、integrity_check、foreign_key_check 及全部字段，前后比对原文件身份、时间、大小、摘要与日志。磁盘目标不打开 SQLite 连接，不写 WAL/shm/journal。
- 归档目录 0700，数据、报告和目标文件 0600。报告只包含数量、摘要和策略，日志使用静态错误，不打印数据行、密码哈希原值、访客信息或连接凭据。

## 运行通过

环境：本机 Node.js 24.21.0 / darwin-arm64、pg 8.22.0、better-sqlite3 13.0.3。专用容器使用 PostgreSQL `18.6-bookworm`，临时内存存储与随机 loopback 端口，不挂载已有卷；测试创建随机 `fx_transfer_test_*` 数据库和只具 SELECT 权限的读取账号，最终删除自己的数据库与角色。

| 验证            | 结果与证据                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 完整 CLI 演练   | 16/16（1 个父测试、15 个子项）；从无项目 `.env` 的临时 cwd 执行 export → dry-run → apply → verify                                  |
| 数据保留        | 22 表、31 行源记录，映射后保留 20 行；逐字段对照真实 PostgreSQL fixture，原 UUID、NULL、版本、正文、父评论、OSS 键、通知和已读一致 |
| 整数与时间      | 5,000,000,000 字节字段未截断；UTC 毫秒和北京时间跨日一致；超安全整数、亚毫秒源时间及会被 JSON.parse 舍入的整数/日期 token 拒绝     |
| 认证            | 使用原 Argon2id 密码真实登录、查询会话与退出；原会话失效，限流和旧备份历史按策略清空/归档                                          |
| 源只读          | SELECT-only 账号完成导出；前后全部业务及 Prisma control 数据 fingerprint 一致；应用 `DATABASE_URL`/`DATABASE_PATH` 未使用          |
| 目标只读核对    | verify 前后文件 SHA-256、mtime 一致，没有生成日志；记录数不变但内容改变的库明确拒绝                                                |
| 路径保护        | 已有 SQLite/空文件/报告不变；目标或报告放在归档内、相同路径、未停止的 WAL 目标拒绝                                                 |
| 损坏与约束      | 缺文件、错误摘要、软链接、未知格式/contract/schema 拒绝；重算摘要后的非法正文、重复唯一值、孤儿 FK 仍拒绝且无目标残留              |
| 源结构与错误    | 源字段类型、Prisma marker 改动及空业务源拒绝；源 URL 连接错误不输出凭据                                                            |
| 规范 JSON       | 直接改写原始 token 并重算摘要，复现解析舍入；非整数 token、非整数日期和重复 key 在 dry-run/apply 均拒绝                            |
| 敏感内容        | 成功/失败终端及 JSON 报告不含测试密码哈希、会话哈希、邮箱、IP、访客标识或 URL 凭据；权限全部核对                                   |
| SQLite 业务回归 | `npm run test:sqlite` 39/39，通过基础层、内容、互动、统计、备份及恢复独立文件验证；OSS 使用 mock                                   |
| 静态验证        | typecheck 通过；新源码定向 lint/格式检查通过；全局 oxlint 无错误，仅历史 PostgreSQL importer 的既有 2 条类型断言警告               |

所有演练归档、报告和 SQLite 文件在测试结束时清理；专用测试数据库/角色剩余为 0。专用 PostgreSQL 容器与私有测试凭据文件在阶段结束后清理，既有本地数据库和卷保留。

## 修复与回归

- Argon2 PHC 的 m/t/p 参数顺序不固定，初版固定顺序会误拒绝实际哈希；改为检查参数名称、唯一性和整数成本，保留原值，原密码登录通过。
- 迁移资源按模块位置定位，临时 cwd 不依赖项目 `.env` 或相对 `drizzle/`。
- dry-run 补充全部源 UNIQUE/FK 键索引检查，不依赖 apply 才发现孤儿关系。
- JSON.parse 可将 `1.0000000000000001` 舍入成 `1`；增加原文与规范编码一致检查，并运行原始数值 token 与重复字段回归。

## 限制与后续范围

- 本次使用覆盖 22 表的合成测试数据，未导出或验证线上真实数据，也未运行大数据量性能测试。
- 源 schema 核对覆盖已列出的字段/约束，未比较 default、时间 typmod、普通索引及用户 trigger，不宣称完整 PostgreSQL 物理结构指纹相等。
- 离线关系预检保存键索引；verify 将完整 SQLite 文件读入内存并复制，内存随数据量增长。需在正式演练中按实际数据规模确认资源。
- apply 先同步报告、再发布目标；进程强制终止可能留下已核对报告但目标未发布。成功退出、目标存在和后续 verify 共同构成完成证据。
- 尚未验证 linux/amd64 镜像与服务器原生运行、生产单镜像/持久卷/启动自动备份迁移或 Portainer 流程；历史部署配置不能用于当前 SQLite 源码。
- 正式冻结写入、最终导出、线上切换、回退和调度恢复属于后续阶段。旧 PostgreSQL 卷、旧镜像/配置与备份必须保留；新库产生写入后不能直接回退旧库。

依据：[PostgreSQL 18 Repeatable Read](https://www.postgresql.org/docs/18/transaction-iso.html)、[PostgreSQL DECLARE](https://www.postgresql.org/docs/18/sql-declare.html)、[node-postgres Client](https://node-postgres.com/apis/client)、[SQLite transactions](https://sqlite.org/lang_transaction.html)、[SQLite foreign keys](https://sqlite.org/foreignkeys.html)、[SQLite deserialize](https://sqlite.org/c3ref/deserialize.html)。

## 本地旧 PostgreSQL 数据实际导入

2026-10-14 13:46（Asia/Shanghai），按用户要求将 `127.0.0.1:15433/fuxiaochen_dev` 的旧数据导入当前 SQLite 开发库。仅操作本地数据与开发服务，未连接线上数据库、推送或部署。

### 导入与保留

- 通过源地址、容器与只读查询确认旧库；当时无其他源库客户端。显式选定该源连接，写入私有独立迁移配置后运行导出；迁移 CLI 未加载业务 `.env`。使用既有账号的只读会话及 `REPEATABLE READ READ ONLY` 快照，未新建账号或修改源库。
- 使用当前迁移工具依次完成 export、dry-run、apply、verify。完整归档包含 22 张源表、188 行；现行映射保留 180 行，并派生 Better Auth 管理员记录。旧会话、临时限流、旧备份及对应通知按既定策略跳过，完整源数据仍在归档中；自动备份关闭。
- 导入目标为独立新文件 `data/postgres-import-20261014/site.sqlite`，未预先初始化或覆盖已有库。源结构、归档摘要、现行迁移 ledger、结构、逐行全部字段、完整性和外键检查运行通过。
- 切换前停止原 Next dev，确认 3000 端口释放、旧库及日志无打开句柄；通过 SQLite backup API 保存一致性快照，并完整检查其完整性与外键。
- 原 `data/site.sqlite` 及其 WAL／SHM 一并保留为 `data/postgres-import-20261014/previous-site.sqlite` 及对应日志；一致性备份另存 `previous-consistent-backup.sqlite`。原路径腾空后，使用独占复制发布已核对的新库，复制摘要一致；对运行路径再次执行离线 verify，通过后才启动服务。
- `.env`、IDE 配置和 `DATABASE_PATH=./data/site.sqlite` 保持原值。旧 PostgreSQL 容器、卷、历史备份、旧 SQLite 文件和 OSS 对象均保留。

### 实际核对结果

| 数据         | PostgreSQL 源 | 运行 SQLite |
| ------------ | ------------- | ----------- |
| 已发布文章   | 27            | 27          |
| 分类         | 6             | 6           |
| 标签         | 37            | 37          |
| 文章标签关联 | 47            | 47          |
| 更新日志     | 10            | 10          |
| 媒体元数据   | 40            | 40          |
| 友链         | 10            | 10          |
| 管理员       | 1             | 1           |

上述数量仅为摘要；迁移与运行路径的 verify 均逐字段核对，报告 `targetChecked=true`、`verified=true`。运行库 `integrity_check=ok`，`foreign_key_check` 为零条。

通过 WebStorm 原有 `Next.js: server-side` 配置重启，进程工作目录和打开的数据库句柄均指向当前项目及 `data/site.sqlite`，服务地址为 `http://localhost:3000`。实际 HTTP 检查运行通过：首页、文章、分类、标签、友链、关于、更新日志、登录、robots、sitemap 和一篇真实导入文章详情均为 200；文章详情包含导入的标题；匿名访问工作台、文章管理和备份管理均为 307 到登录页，无数据库或缺失字段异常。

管理员原密码哈希已保留，并通过 Argon2 核对与当前本地私有配置密码匹配；未使用真实账号执行登录或写入业务内容，原会话不迁移，使用时需重新登录。OSS 仅保留引用与元数据，本轮未验证远程对象可访问性；浏览器交互和媒体加载未在本轮重新验收。

私有归档、源连接配置、导入库、旧库、一致性备份及报告全部位于 Git 忽略目录 `data/postgres-import-20261014/`，目录权限为 0700，数据库、配置与报告为 0600。`export.json`、`preflight.json`、`import.json`、`verify.json`、`runtime-verify.json`、`cutover.json` 和 `runtime-checks.json` 分别保存源导出、预检、导入、独立目标核对、运行路径核对、切换摘要与 HTTP／运行库检查；未提交私有数据和凭据。离线核对报告描述服务启动前的文件状态，后续业务写入后不可直接将其作为当前文件的一致性证明。

## 线上 PostgreSQL 数据导入本地

2026-10-21 23:46–23:48（Asia/Shanghai），按用户要求，经 `aliyun_vps` SSH 连接读取 Portainer 部署的 `fuxiaochen-app-1` 和 `fuxiaochen-postgres-1` 配置，将线上 `fuxiaochen` 数据库快照导入本地。此次仅查询线上配置、只读导出数据库及切换本地开发库；未修改线上数据、容器、Stack、端口或部署配置，未停止线上服务、推送或部署。

### 导出、导入与本地切换

- PostgreSQL 为 `18.6-bookworm`，没有发布数据库端口。SSH 隧道只监听本机 loopback，经容器内网连接；实际连接从应用容器配置读取，仅保存到私有文件，不输出凭据。沿用既有数据库账号，以默认只读连接和 `REPEATABLE READ READ ONLY` 统一快照执行导出；未新建或修改线上账号。导出完成后已关闭本次 SSH 隧道。
- 现有迁移 CLI 依次完成 export、dry-run、apply、verify，源归档为 22 张表、1,788 行，现行映射保留 166 行，另由工具派生 Better Auth 管理员记录。独立导入目标为 `data/production-import-20261021-1792597590208/site.sqlite`，未覆盖或预先初始化已有库。
- 评论、本地访问统计、访客会话、旧备份记录及相应通知按现行策略仅保留源归档。旧登录会话和临时限流不迁移，自动备份关闭；管理员原密码哈希、现行业务字段及 OSS 引用保留。排期文章按工具策略转为草稿。
- 独立目标 verify 通过后，停止本项目 Next dev，确认 3000 端口释放、数据库没有打开句柄，也没有本项目调度进程。使用 SQLite backup API 保存 `previous-consistent-backup.sqlite`，`integrity_check=ok`、`foreign_key_check` 为零条；旧运行库及仍存在的日志另外保留为 `previous-site.sqlite` 及对应文件。
- 使用独占复制将新库发布到 `data/site.sqlite`，核对复制前后 SHA-256 一致，并在启动前对运行路径再次执行 verify。独立目标和运行路径报告均为 `targetChecked=true`、`verified=true`，结构、迁移历史、完整性、外键和逐行全部字段核对通过。
- 通过 WebStorm 原有 `Next.js: server-side` 配置重启，监听 3000 的进程持有本项目 `data/site.sqlite`；`.env`、`DATABASE_PATH`、`APP_ORIGIN` 和共享 IDE 配置保持原值。

### 核对与验证状态

| 数据         | PostgreSQL 快照 | 本地 SQLite |
| ------------ | --------------- | ----------- |
| 文章         | 27              | 27          |
| 分类         | 6               | 6           |
| 标签         | 37              | 37          |
| 文章标签关联 | 47              | 47          |
| 更新日志     | 3               | 3           |
| 媒体元数据   | 40              | 40          |
| 友链         | 1               | 1           |
| 管理员       | 1               | 1           |

- **运行通过**：上述两次离线 verify；旧库一致性备份完整性及外键检查；首页、文章列表、友链、关于、更新日志、登录、robots、sitemap 和一篇实际导入文章详情共 9 项 HTTP 200，文章详情包含导入标题；匿名访问工作台、文章管理、备份管理共 3 项 HTTP 307 到 `/login`。
- **未验证**：未使用真实账号执行登录或业务写入，使用时需以线上原密码重新登录；未重新验收浏览器交互及 OSS 对象加载，媒体只迁移元数据与引用。
- **范围限制**：此次是线上持续运行期间的一致性快照，导出后的线上新增或修改不会自动同步到本地；不构成生产数据库切换或部署验收。

私有输出全部位于 Git 忽略目录 `data/production-import-20261021-1792597590208/`，目录权限 0700，配置、数据、备份与报告权限 0600。`export.json`、`preflight.json`、`import.json`、`verify.json`、`runtime-verify.json`、`cutover.json` 和 `runtime-checks.json` 保存各阶段证据，仅本文记录提交 Git。离线报告对应启动前文件，后续业务写入后需重新评估当前状态，不能将旧报告作为实时一致性证明。

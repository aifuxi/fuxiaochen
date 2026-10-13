# SQLite 单镜像与 Portainer 部署

2026-10-13：当前配置为单实例 SQLite + Drizzle + better-sqlite3。一个镜像同时包含 standalone Web、启动前备份/迁移/校验和日常运维 CLI；Compose 只有 app 服务，不再需要 PostgreSQL、migrate 或 tools 容器，也无需预置数据库初始化脚本。本阶段只在本地独立库/容器验证，尚未推送、发布或切换线上。历史数据与卷不自动删除。

## 镜像与启动流程

Dockerfile 的唯一生产 target 为 runtime。构建安装完整开发依赖用于类型检查和 Next.js 构建，运行镜像只复制 standalone 及 NFT 追踪的维护依赖；不包含 Prisma、PostgreSQL 客户端、pg、drizzle-kit 或历史导入脚本。SQL/journal、tsx 及当前平台 SQLite/Argon2/Sharp 原生文件随镜像打包，并在最终 node 用户环境实际调用。

GitHub Actions 只发布 ghcr.io/aifuxi/fuxiaochen 一个镜像，保留现有分支/版本/完整 SHA 标签、revision 标签和 npm/Next BuildKit 缓存。正式配置固定 sha-<完整commit> 或 digest，并选同一提交的 compose.yaml；不依赖 latest 判定版本。当前未执行远程工作流，后续获准推送后等待构建发布成功再部署。

每次 serve（包括 Docker 自动重启）执行以下流程：

1. 取得同库 Web 实例锁和独占维护锁，旧 Web 或维护命令仍使用该库时立即拒绝。
2. 已有库先核对合法迁移前缀、完整性、外键和对应旧结构，生成包含 WAL 已提交数据的一致性备份；备份失败不执行迁移。
3. 取得 SQLite IMMEDIATE 写锁，再检查备份期间是否有其他提交；存在并发写入则拒绝升级并保留备份。全部迁移与 ledger 同事务，失败整体回滚。
4. 完整校验最新 ledger、schema、integrity_check 和 foreign_key_check，切换为共享维护锁后再次核对。
5. exec node server.js 启动 Web，直接接收停止信号；实例锁和共享维护锁保留至退出。

普通业务 CLI 与 Web 共享维护锁，标准 db:init、db:migrate、db:startup 入口独占，在线时会被拒绝。锁文件留在数据目录，由 flock 持有描述符，不靠删除文件或 PID 文件判断状态；不要删除锁文件、覆盖 entrypoint 或绕过入口执行在线结构变更。容器只能使用同一固定数据库路径，不能用硬链接/软链接别名规避锁。SQLite 卷使用本机持久磁盘，不使用 NFS、网络文件系统或多机副本。

默认缺失数据库时拒绝启动，避免切换时意外生成空站点。SQLITE_INITIALIZE=1 仅用于明确批准的全新站点第一次初始化；既有文件（包括空文件、历史无 ledger 文件）不会被自动接管，导入后的站点保持 0。初始化不自动创建管理员。容器 node 用户为 UID/GID 1000，数据文件 0600，启动备份目录 0700；已有卷须由该账号可读写，不在入口以 root 自动 chown 历史数据。

健康检查为 /login HTTP 200，启动前数据库校验已完成；健康不证明 OSS、所有业务或代理配置通过。unhealthy 本身不会触发 unless-stopped 重启。启动失败会非零退出，unless-stopped 可能重试并产生多份升级前备份，修复前先停止失败容器，不删除卷解决问题。

## Portainer 配置与数据准备

面向 Docker Standalone，保持 app 单实例，不使用 Swarm 滚动升级。compose.yaml 只使用镜像、外部 named volume 和已有 Caddy 网络，全部变量显式 environment 注入，不依赖 Git checkout 中的 .env、stack.env 或宿主机初始化脚本。

| 变量                       | 配置                                                           |
| -------------------------- | -------------------------------------------------------------- |
| APP_IMAGE                  | 必填；发布完成的 SQLite 镜像 SHA 标签或 digest                 |
| APP_DATA_VOLUME            | 必填；已准备的独立新 SQLite 卷，例如 fuxiaochen-sqlite         |
| SQLITE_INITIALIZE          | 默认 0；仅全新站点首次临时设 1，完成后改回 0                   |
| APP_ORIGIN                 | 必填 HTTPS origin，如 https://fuxiaochen.com，不带路径或尾斜杠 |
| BETTER_AUTH_SECRET         | 必填独立随机私有值，至少 32 个字符；轮换后需重新登录           |
| CADDY_NETWORK              | 默认 infra_edge，必须是已有外部网络                            |
| RESTORE_DATABASE_PATH      | 仅恢复时填写 /app/data/ 下独立且不存在的文件，普通运行留空     |
| OSS_* / ALIBABA_CLOUD_*    | 沿用已有 Bucket、对象键、公开域名与最小权限凭据                |
| ANALYTICS_CLIENT_IP_HEADER | 默认空；代理覆盖且应用禁止公网直连后可设 x-real-ip             |

数据库固定为 /app/data/database.sqlite，备份为 /app/data/backups，均在唯一 app-data 卷中。该卷 external=true：Stack 不自动创建，移除 Stack 不删除它；禁止复用旧 PostgreSQL 卷或直接指向历史 SQLite 文件。部署前一次性创建新卷、放入已核对的独立导入文件，并确认 UID/GID 1000 权限。新 named volume 首次挂载会从镜像的数据目录复制目录权限；若曾用 root 写入该卷，应仅检查并修正此新卷的相关文件，不递归处理旧数据卷。

已有 PostgreSQL 站点首次切换按 [离线迁移工具](maintenance.md#postgresql--sqlite-离线迁移) 冻结写入、导出、导入和核对；工具在安装开发依赖的独立工作环境运行，不在生产镜像安装 pg 或 Prisma。保留原镜像、配置、PostgreSQL 卷和最终归档，将核对后的单文件 SQLite 导入产物复制到新卷 database.sqlite；复制前后 SHA 必须一致，随后用目标镜像 db:verify。不要先 db:init 或 admin:init，不用演练归档替代最终归档。仅完成这些一次性准备后才在 Portainer 切换 Stack。

后续获得部署授权后：

1. 等待发布完成，记录新/旧镜像 digest 与对应 Git reference，暂停外部调度，确认新 SQLite 卷已准备好。
2. 已有 Stack 保持 Git 管理；选已发布提交的 reference，Compose path 为 compose.yaml。从 deploy/portainer.env.example 只补新增变量（认证升级须配置 BETTER_AUTH_SECRET），已有值直接编辑，移除不再使用的 TOOLS_IMAGE、DATABASE_URL、RESTORE_DATABASE_URL 与 POSTGRES_* 变量。
3. 更新前停止旧 app 与所有数据库写入；新配置会移除历史 PostgreSQL 服务，应在预先准备的旧版本配置下确认该服务停止。旧 PostgreSQL/SQLite 数据卷保留，禁止清理 orphan 时连带删除卷。
4. 在 Portainer 重新拉取并部署。此后每次重新部署 app 自行备份、迁移和校验，无需创建或强制重跑 migrate 服务；若重建阶段旧 Web 尚未退出，实例锁让新容器失败重试，不能认为第一条启动请求就是成功。
5. 查看 app 日志、健康状态，核对本次启动备份 manifest 和业务数据，再通过 HTTPS 验证原密码登录、文章、统计及媒体，最后恢复调度。

Portainer UI 导入变量时使用无外层引号的独立文件，填写后权限 0600，不提交 Git。此前服务器 Portainer 2.45.1 的导入会保留外层引号并追加已有项；当前未重新操作该服务器，更新时按实际 UI 核对，避免重复变量和引号成为内容。Compose 命令行使用的 production.env 可按 dotenv 规则引用，其实际值须与 Portainer 一致。

生产 app 不发布宿主机端口，只连接 Caddy 的 infra_edge，别名 fuxiaochen。保留现有 DNS 223.5.5.5/223.6.6.6 与 OSS 配置，正式切换时验证实际解析及访问；本阶段没有访问真实 OSS。

## 管理员、调度与运维

同一镜像直接执行维护命令。下列示例用于已部署且版本匹配的环境，宿主配置与 Portainer 保持一致；本次未执行服务器命令。

```sh
# 仅全新站点首次交互建管理员；导入已有账号时跳过。
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps app npm run admin:init
# 日常命令不走 serve，不重复启动 Web；与 Web 共享维护锁。
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps -T app npm run operations:run
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps -T app npm run db:backup
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps -T app npm run db:verify
```

支持管理员初始化/重置、到期发布、数据库备份/恢复、媒体 dry-run/清理及统计清理。交互命令保留 TTY；自动任务使用 -T。不共享宿主机 .env 到镜像，Compose 显式注入运行环境。停止 Web 和调度后才手工 db:migrate；日常更新交给 serve 启动流程。

每分钟 operations:run 的外部调度继续保留：先执行到期发布，再按后台开关执行当天自动备份。首次切换时将旧 tools 命令更新为上述 app 命令，版本随唯一 APP_IMAGE 更新；未配置调度时排期仍等待手工处理。启动前备份独立于后台每日开关，无需启用自动备份即可执行。调度配置本阶段未改动任何服务器。

## 备份、恢复与回退

启动快照位于 /app/data/backups/startup/<UTC时间-UUID>/，包含 database.sqlite 与 manifest.json。manifest 使用 fuxiaochen-sqlite-backup、purpose=before-startup-migration、旧迁移版本/schema 摘要、目标 schema hash、文件大小和 SHA-256。正常业务备份仍在备份根目录的 UUID 子目录，并登记后台 backup_run；启动备份不改业务表，不出现在后台历史列表。两类都不包含 OSS 文件，应另存异地副本；目前无自动保留/删除策略，升级前检查磁盘容量。

当前版本快照用同版 db:restore 恢复；升级前快照若记录旧迁移前缀，使用匹配旧 schema 的镜像恢复，再决定按新镜像升级。不要用新镜像跳过版本校验强行恢复旧结构，也不能只换旧镜像回退已升级库。

```sh
# 保持旧 Web/调度停止，将 APP_IMAGE 固定为备份所属版本。
# 仅创建独立新文件，不覆盖 database.sqlite；恢复会撤销会话、关闭自动备份并标记中断备份。
# 将备份ID占位值替换为实际目录；引号避免被 shell 当作输入重定向。
RESTORE_DATABASE_PATH=/app/data/restored.sqlite docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps -T app npm run db:restore -- '/app/data/backups/startup/<备份ID>'
```

恢复后先用同版镜像通过 `docker compose run --env DATABASE_PATH=/app/data/restored.sqlite` 显式选择恢复文件执行 `npm run db:verify`，再核对业务。compose.yaml 的正式文件路径固定 database.sqlite：实际回退必须在停止写入后选择一个新外部卷，复制并核对恢复产物至该新卷 database.sqlite，再同步切换 APP_DATA_VOLUME 与镜像/配置；原卷和失败库保留，不直接覆盖主文件或独立复制含 WAL 的在线库。新 SQLite 或 PostgreSQL 任一方已产生额外业务写入时，冻结、备份并核对增量后再回退，不能丢弃增量。

## Caddy 与 HTTPS

沿用 deploy/caddy/fuxiaochen.caddy 和现有 gateway 的 alidns_tls 片段，通过 fuxiaochen:3000 反代；APP_ORIGIN=https://fuxiaochen.com。部署时只修改本应用站点文件，现有 Caddy、Portainer、凭据和证书卷保留。Secure Cookie 登录通过正式 HTTPS；Caddy 覆盖 X-Real-IP，若前面还有 CDN，先配置可信代理再启用客户端 IP 统计。

## 本地验证

```sh
# 全程只构建本地tag；不推送。无需任何数据库或OSS凭据。
docker build --target runtime -t fuxiaochen:sqlite-local .
# 生产amd64构建可在本地仿真验证，不代表服务器原生实测。
docker build --platform linux/amd64 --target runtime -t fuxiaochen:sqlite-local-amd64 .
# 四项配置均为dummy值，只展开配置，不创建生产卷或访问网络。
APP_IMAGE=fuxiaochen:sqlite-local APP_ORIGIN=https://example.test BETTER_AUTH_SECRET=compose-test-only-random-secret-32-chars APP_DATA_VOLUME=unused-check-volume docker compose config --quiet
npm run test:sqlite-startup
# 容器测试只创建/删除随机的专用卷与容器，不拉取或发布镜像。
TEST_SQLITE_IMAGE=fuxiaochen:sqlite-local npm run test:sqlite-container
# 只使用本地已有 Portainer 镜像，创建全新测试管理端和随机 Stack，不使用既有 Portainer。
TEST_SQLITE_IMAGE=fuxiaochen:sqlite-local TEST_PORTAINER_IMAGE=portainer/portainer-ce:lts \
  node --conditions=react-server --import tsx --test tests/sqlite-portainer.test.ts
```

完整结果见 [单镜像与启动验收](engineering/sqlite-deployment-verification.md)。历史双镜像 PostgreSQL 的部署实现与记录已移除，需要时查阅 Git 历史中的匹配版本。尚未验证 GitHub 托管 runner、真实生产数据/服务器与生产 Portainer 的 Git 更新；本地 API 演练与服务通过不代表线上切换完成。

依据：[Docker Compose 服务](https://docs.docker.com/reference/compose-file/services/)、[外部数据卷](https://docs.docker.com/reference/compose-file/volumes/)、[Portainer Stack 创建](https://docs.portainer.io/user/docker/stacks/add)、[Git Stack 更新](https://docs.portainer.io/user/docker/stacks/edit)、[Portainer 相对路径支持](https://docs.portainer.io/advanced/relative-paths)。Next.js 16.3.7 行为已按已安装 output/deploying 文档核对。

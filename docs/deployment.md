# GitHub Actions、Portainer 与 Caddy 部署

适用于单机 Docker Standalone。Portainer 从 `https://github.com/aifuxi/fuxiaochen` 拉取 Compose 配置，应用镜像由 GitHub Actions 构建并发布到 `ghcr.io/aifuxi/fuxiaochen`。服务器无需安装 Node.js 或在拉取仓库后重新打包。通过 `ssh aliyun_vps` 准备数据库和维护快照，再在已打开的 Portainer 中重新部署。

## 当前服务器环境

2026-10-07 通过 SSH 核对切换前的环境：

- 服务器为 `linux/amd64`，Docker Swarm 未启用。
- Portainer CE `2.45.1` 位于 `container-management` Stack，入口为 `https://portainer.fuxiaochen.com`。
- Caddy `2.10.2` 位于 `gateway` Stack，挂载 `/srv/infra/caddy`，主配置导入 `sites/*.caddy`。
- `gateway-edge-1` 已接入外部 bridge 网络 `infra_edge`。应用复用该网络，使用别名 `fuxiaochen`，不发布宿主机端口。
- `mindfolio_portainer_proxy` 是 Portainer 专用的内部网络，应用不接入它。
- 生产域名使用用户确认的 `https://fuxiaochen.com`。

现有 Portainer、Caddy 镜像、凭据和证书卷不需要更换。复用已有的 `fuxiaochen` Stack 和 `fuxiaochen-data` 应用卷；旧 SQLite 在迁移后仍保留。本文提供切换操作，实际部署结果以容器、数据核对和业务回归记录为准。

## 镜像构建

`/design-spec` 仅在开发环境开放，生产环境返回 404，由该路由布局检查运行环境。它是本地组件演示入口，不是生产公开页面；布局规格见 [前台、登录与展示页场景](design/frontend.md)。

工作流为 `.github/workflows/container.yml`，触发条件：

- 推送任意分支：发布该分支标签和 `sha-<完整 commit SHA>`。
- 推送 `v*` tag：发布对应 tag 和 commit 标签。
- 默认分支（当前为 `master`）：额外发布 `latest`。
- 向 `master` 提交 PR：构建镜像但不发布。
- `workflow_dispatch`：手动构建所选分支或 tag。

镜像同时支持 `linux/amd64` 与 `linux/arm64`。Action 使用固定 commit SHA，Node.js 基础镜像固定为 `24.21.0-bookworm-slim` 及多架构 digest；升级时一并核对版本与 digest。构建使用 `npm ci` 和现有 `npm run build`，Next.js 构建包含 TypeScript 检查。工作流不运行测试。

镜像保留现有 Prisma CLI、`tsx`、`@inquirer/prompts` 及其依赖，支持迁移、账号管理、备份和排期命令，因此没有裁剪成仅运行 Web 的 standalone 镜像，也没有执行 `npm prune --omit=dev`。Prisma 使用 CLI `8.0.0-rc.19` 和 PostgreSQL runtime `8.0.0-rc.14`（RC），沿用 Prisma 8 contract 迁移流程；运行镜像安装 PostgreSQL 18 的 `pg_dump`、`pg_restore` 和 `psql`。

发布使用仓库提供的 `GITHUB_TOKEN` 和 `packages: write` 权限，不需要把个人 token 放进 Actions。首次运行成功后，在 GitHub 账号的 Packages 中确认 `fuxiaochen` 已生成。镜像包的可见性独立于源码仓库：

- 公开镜像：在 Package settings 中设置 Public，Portainer 可以匿名拉取。
- 私有镜像：在 Portainer Registries 添加 `ghcr.io`，填写 GitHub 用户名和具有 `read:packages` 的 PAT classic，并在 Stack 部署时选择该 Registry。不要把 token 写入 Compose 或提交 Git。

正式发布使用 `master` 的已提交代码。先推送并等待该提交的 Actions 成功，再使用 `docker buildx imagetools inspect ghcr.io/aifuxi/fuxiaochen:sha-<完整 SHA>` 核对镜像包含服务器所需的 `linux/amd64`，记录 index digest，并将 `APP_IMAGE` 固定为 `ghcr.io/aifuxi/fuxiaochen@sha256:<digest>`。不要在构建完成前开始停机，也不要靠 `latest` 判断实际部署版本。

## Portainer 从 GitHub 创建 Stack

1. 先将配置推送到 GitHub，等 Actions 构建发布成功，再创建或更新 Stack。
2. 在 Docker Standalone 环境进入 **Stacks → Add stack → Git Repository**，Stack 名称使用 `fuxiaochen`。
3. 仓库填写 `https://github.com/aifuxi/fuxiaochen`，Repository reference 使用待部署配置所在的分支，例如 `refs/heads/master`。
4. Compose path 填 `compose.yaml`。
5. 从 `deploy/portainer.env.example` 导入变量，替换真实域名、OSS 地址和凭据；先预置下方的宿主机初始化脚本。全新空库可以部署；已有 SQLite 的站点先执行下方切换流程。

| 变量                         | 配置                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `APP_IMAGE`                  | 默认 `ghcr.io/aifuxi/fuxiaochen:latest`；可改成分支、版本、`sha-<完整 SHA>` 或 `@sha256:<digest>` |
| `APP_ORIGIN`                 | 必填，例如 `https://fuxiaochen.com`；不带路径、尾斜杠，必须与浏览器访问地址完全一致               |
| `APP_DATA_VOLUME`            | 默认 `fuxiaochen-data`，升级时保留同一个卷                                                        |
| `DATABASE_URL`               | 必填，`postgresql://fuxiaochen:<URL编码的应用密码>@postgres:5432/fuxiaochen`                      |
| `POSTGRES_ADMIN_PASSWORD`    | PostgreSQL 管理账号密码，不能与应用密码混用                                                       |
| `POSTGRES_APP_PASSWORD`      | 普通应用账号的初始化密码，与 DATABASE_URL 中的密码对应                                            |
| `POSTGRES_DATA_VOLUME`       | 默认 `fuxiaochen-postgres`，升级时保留同一卷                                                      |
| `POSTGRES_INIT_SCRIPT_PATH`  | 必填宿主机绝对路径，示例 `/srv/fuxiaochen/postgres-init.sh`；脚本须与发布 commit 一致             |
| `CADDY_NETWORK`              | 复用服务器已存在的外部网络，默认 `infra_edge`                                                     |
| `OSS_*`、`ALIBABA_CLOUD_*`   | 沿用 `.env.example` 的配置；在 Portainer 填写真实值                                               |
| `ANALYTICS_CLIENT_IP_HEADER` | 默认空；按后面的代理配置确认后可填 `x-real-ip`                                                    |

Compose 通过显式 `environment` 注入变量，不依赖仓库中不存在的 `.env` 或 `stack.env`。宿主机文件和开发环境变量不会进入镜像。OSS 上传仍由浏览器访问 `OSS_UPLOAD_ENDPOINT`，容器服务端使用 `OSS_SERVER_ENDPOINT`，两者应按服务器和客户端实际网络配置；部署域名也需加入 Bucket CORS 的允许来源。

2026-10-07 实测，原应用容器的 Docker DNS 将当前 OSS 公开域名解析为 `198.18.0.10`，请求超时；宿主机及阿里 DNS 得到真实地址。同一 `infra_edge` 网络的一次性容器在默认 DNS 下也失败，指定 `223.5.5.5`、`223.6.6.6` 后解析与 OSS HEAD 请求成功。因此生产 `app` 显式配置这两个 DNS，不修改宿主机或 gateway 的 DNS。Docker 内部的 `postgres` 服务名仍由容器网络解析；正式切换时同时验证数据库连接和 OSS 访问。

容器使用 `node` 用户（UID/GID 1000）。默认启动命令先执行现有 `npm run db:migrate`，其中依次运行 Prisma 8 的 `db migrate` 与 `db verify`；任一步失败就退出，不启动 Web。正常启动后监听容器端口 3000，Docker 通过 `/login` 的 HTTP 200 判断 Web 服务可用。该健康检查不代表 OSS 配置或全部业务已验证，Docker 的 unhealthy 状态也不会单独触发 `unless-stopped` 重启。

数据库服务使用 `postgres:18.6-bookworm`，生产不映射数据库端口。应用通过独立的内部网络连接 `postgres:5432`，同时连接 Caddy 的 `infra_edge` 网络；PostgreSQL 不接入代理网络。`depends_on` 等待数据库健康检查通过，再执行迁移、验证和 Web 启动。

PostgreSQL 数据卷挂载 `/var/lib/postgresql`，应用卷保存旧 SQLite、`/app/data/backups` 和迁移报告等运维产物。`deploy/postgres-init.sh` 在新卷初始化时创建非超级用户 `fuxiaochen` 和同名数据库，应用拥有该库，但没有创建角色或数据库权限。初始化脚本仅在空卷运行；失败后自动重启不会继续执行初始化脚本。必须核对角色、数据库和普通账号实际连接，不能仅凭 `pg_isready` 判断初始化完成。已有卷修改密码环境变量不会自动修改数据库密码，需管理账号显式执行角色密码变更并同步 URL。不要删除数据卷来修复启动问题。

Portainer CE 的 Git 相对路径卷不具备 Business Edition 的宿主机文件复制能力。当前 checkout 位于 Portainer 容器的 `/data/compose/3`，来自其 named volume，宿主机没有同路径目录。部署前将发布 commit 的 `deploy/postgres-init.sh` 预置为宿主机 `/srv/fuxiaochen/postgres-init.sh`，设置 `root:root`、`0755` 并校验 SHA-256。Compose 使用 `POSTGRES_INIT_SCRIPT_PATH` 的绝对路径、只读 bind 和 `create_host_path: false`；脚本缺失立即失败，避免把缺失路径自动创建成目录。

配置密码时对连接 URL 中的密码进行 URL 编码，`POSTGRES_APP_PASSWORD` 填原始密码。服务器的 `/srv/fuxiaochen/production.env` 使用 `0600` 权限，并与 Portainer 保存的环境变量保持一致；填写后的环境文件、旧配置备份、快照和报告不提交 Git，也不打印凭据。OSS 权限与 CORS 见 [媒体存储配置](media-storage.md)。

Portainer 2.45.1 的 UI 环境文件导入会保留值的外层引号。为 UI 单独准备 `0600` 的 `portainer.env`，变量值不加 dotenv 外层单引号或双引号；不要直接导入带引号的 `production.env`，否则引号会成为 `DATABASE_URL` 等变量的实际内容，导致连接失败。导入操作会追加变量，更新已有 Stack 时只导入新增项，已有项直接编辑，避免重复名称。Compose 使用的 `production.env` 可以按 dotenv 规则加引号，两份文件表达的实际变量值须一致。

## 从线上 SQLite 切换到 PostgreSQL

导入行为、支持的旧 schema 和字段映射见 [数据库维护](maintenance.md#sqlite-数据导入-postgresql)。沿用原 OSS Bucket、公开域名及对象键，不删除或重传对象。管理员 id、用户名和密码哈希保留，使用原密码重新登录；旧登录会话不导入，无需运行 `admin:init`。

1. 记录旧应用镜像 digest、Git ref、原 Stack 环境变量与 Caddy 站点配置，保留 `fuxiaochen-data`。为旧 SQLite commit 建立并推送独立的回滚 tag，例如 `deploy-sqlite-20261007`；Portainer 使用完整 `refs/tags/...`，不要使用裸 commit SHA 作为 Repository reference。
2. 等待正式发布镜像成功，准备同一 commit 的 `/srv/fuxiaochen/compose.yaml` 和初始化脚本。先在同一 Compose project 仅启动 PostgreSQL，不更新旧应用、不执行 `down`：

   ```sh
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml up --no-deps -d postgres
   ```

   生成的内部网络为 `fuxiaochen_database`，后续 Portainer 继续使用 Stack 名称 `fuxiaochen`；两者复用同一数据库卷和环境变量。不要用另一 project 同时挂载同一数据库卷。

3. 用 SQLite backup API 导出演练快照，在独立空目标库先建立当前 schema，再执行预检、导入和验证。演练只运行目标镜像的 CLI，不启动新 Web、管理员初始化或调度。通过后为最终导入保留一个独立空业务库。
4. 将 `/srv/infra/caddy/sites/fuxiaochen.caddy` 临时改为保留现有 TLS 配置的 `503` 维护响应，在 `/srv/infra` 执行 `mise run caddy:reload`，核对正式域名返回维护状态。暂停相关外部调度并停止旧 app，确认没有 SQLite 写入，再用 backup API 取得包含已提交 WAL 的最终快照；不能单独复制主文件，也不能用演练快照代替。记录最终快照 SHA-256，保留旧数据库及卷。
5. 将最终快照放在复用应用卷的 `/app/data/releases/release-id/source.sqlite`，把下面的 `release-id` 替换为实际发布标识。报告目录预先创建并由 `node`（UID/GID 1000）独占；以下每次报告必须使用新路径。将 `DATABASE_URL` 指向最终空目标库，以同一固定镜像执行：

   ```sh
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps app npm run db:migrate
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps app npm run db:import-sqlite -- --source /app/data/releases/release-id/source.sqlite --dry-run --report /app/data/releases/release-id/preflight.json
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps app npm run db:import-sqlite -- --source /app/data/releases/release-id/source.sqlite --apply --report /app/data/releases/release-id/import.json
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps app npm run db:import-sqlite -- --source /app/data/releases/release-id/source.sqlite --verify --report /app/data/releases/release-id/verify.json
   ```

   `--dry-run` 只校验源；`--apply` 要求 22 张业务表为空并在一个事务中逐表核对数量和摘要；已导入目标用 `--verify`，不要重复 `--apply`。失败时保留快照和报告，查明原因后重试，不删除数据卷。

6. 核对最终报告、数据库、媒体 URL 和 OSS HEAD 后，在原 Portainer Stack 的 **Edit stack settings** 更新环境变量和正式 Git ref，保持 GitOps 自动更新关闭；保存时暂不勾选 Redeploy。再执行 **Pull and redeploy → Re-pull image and redeploy → Update**。请求被接受仅说明异步部署开始，继续检查实际容器、迁移日志、健康状态和 OCI revision 是否为发布 SHA。
7. 维护状态下通过内部网络验证新应用首页、文章、搜索、登录入口、统计与媒体，生成 PostgreSQL 备份并保存异地副本。数据核对及上线检查通过后恢复原 Caddy 站点文件并执行 `mise run caddy:reload`，通过 HTTPS 使用原账号密码登录和回归业务；确认后恢复所需调度。导入会关闭自动备份并清空旧调度运行时间，按新的 PostgreSQL 运维配置重新启用。

若在开放外部写入前失败，保持维护状态，在原 Stack 的 Git settings 选择预先准备的 SQLite 回滚 `refs/tags/...`，恢复旧镜像 digest、原环境变量和同一 `fuxiaochen-data`，重新拉取部署并验证后恢复入口。保留 PostgreSQL 卷、SQLite 最终快照和报告，不 Detach from Git、不删除卷。PostgreSQL 已接收新业务写入后，先冻结写入、备份并核对增量，不能直接切回未更新的 SQLite。

## 接入现有 Caddy

应用部署后，通过 `infra_edge` 中的别名 `fuxiaochen:3000` 访问。仓库提供可直接放入 `/srv/infra/caddy/sites/fuxiaochen.caddy` 的配置 `deploy/caddy/fuxiaochen.caddy`：

```caddyfile
fuxiaochen.com {
  encode zstd gzip
  import alidns_tls
  reverse_proxy fuxiaochen:3000 {
    header_up X-Real-IP {remote_host}
  }
}
```

`alidns_tls` 是服务器主 Caddyfile 中现有的片段，沿用 gateway 的 AliDNS 凭据和 DNS 验证方式。不要用站点文件替换主 Caddyfile 或 Portainer 站点配置。确认域名 DNS 指向这台服务器后，将文件放入站点目录，再在 `/srv/infra` 执行现有 `mise run caddy:reload`，该任务先校验再重载。维护时只临时替换本应用的站点文件，并保留原文件供恢复。

Caddy 负责 HTTPS，应用通过内部 HTTP 处理代理请求。`APP_ORIGIN=https://fuxiaochen.com` 与浏览器地址完全一致；生产鉴权使用 Secure Cookie，必须通过 HTTPS 域名登录。

SEO 的 canonical、OG URL、结构化数据和 `/sitemap.xml`、`/robots.txt` 共用经过校验的 `APP_ORIGIN`，在请求时生成，不从请求 Host 推断、不在构建时固化。修改生产域名后重启应用，并检查抓取文件只引用正式 HTTPS 地址。旧 `public/robots.txt`、`public/sitemap*.xml` 不再使用，也不进入 Docker 构建；不要放回 public 与动态路由冲突。

本配置由 Caddy 覆盖客户端传来的 `X-Real-IP`。确认 Caddy 直接接收访客连接后，才将 `ANALYTICS_CLIENT_IP_HEADER` 设为 `x-real-ip`。如果 Caddy 前还有 CDN 或另一层代理，先配置可信代理及真实客户端 IP 解析；上述 `{remote_host}` 此时是上一跳地址，不能当作访客 IP。`infra_edge` 只接入可信容器，同一网络中不能有另一个应用使用相同别名。

## 管理员与运维命令

全新部署且未导入旧管理员的空库，在 Portainer 的应用容器 Console 中运行，以 `node` 用户打开交互终端；SQLite 迁移已有账号时跳过此步骤：

```sh
# 仅全新空库需要；导入旧管理员后跳过。
npm run admin:init
```

命令交互输入账号与密码，不使用环境变量自动创建管理员。也可以在服务器执行以下命令，将 `<应用容器名>` 换成 Portainer 中实际的应用容器名称：

```sh
docker exec -it --user node <应用容器名> npm run admin:init
docker exec -it --user node <应用容器名> npm run admin:reset-password
docker exec --user node <应用容器名> npm run operations:run
docker exec --user node <应用容器名> npm run db:backup
```

排期发布和自动备份仍需外部调度。容器不会自动安装 cron；可以在宿主机每分钟执行一次 `docker exec --user node <应用容器名> npm run operations:run`。更新导致容器名称变化时同步调度配置。备份只包含数据库，不含 OSS 文件；备份仍位于同一宿主机，需另行复制到其他存储。

`operations:run` 执行到期发布，再按后台备份面板中的开关执行当天自动备份。仅执行到期发布使用 `npm run posts:publish-due`。调度与 Web 必须共享数据库和备份磁盘；未配置调度时，排期保持等待状态，可在后台手动执行到期计划。

## 单实例 Node.js 部署

也可在服务器运行 Node.js 24+，连接已启动的 PostgreSQL。配置正确的 `DATABASE_URL`、HTTPS `APP_ORIGIN` 与持久 `BACKUP_DIRECTORY`，安装 PostgreSQL 18 客户端工具和完整 npm 依赖。

```sh
npm ci
npm run db:generate
npm run db:migrate
npm run admin:init
npm run build
npm start
```

外部调度每分钟运行 `operations:run`，使用与 Web 相同的环境配置、数据库和备份目录。CLI 执行完毕释放连接。

## 数据库备份与恢复

`npm run db:backup` 使用 `pg_dump` custom 格式的一致性快照。默认备份目录为 `./data/backups`，容器为 `/app/data/backups`；可通过 `BACKUP_DIRECTORY` 指定。每份备份在独立 UUID 目录中包含 `database.dump` 和 `manifest.json`，记录大小、SHA-256、contract 摘要和 PostgreSQL 主版本。备份包括数据库、鉴权和媒体元数据，不包含 OSS 文件。目录由服务账号独占，不放入 public/ 或提交 Git；无自动保留策略，需定期检查容量并保存异地副本。

本地需要 PostgreSQL 18 客户端工具。macOS 可安装 `libpq` 并将其 bin 目录加入 PATH；确认 `pg_dump --version`、`pg_restore --version`、`psql --version` 为 18 系列。镜像内已经安装。凭据通过子进程环境传递，不放入命令参数或错误日志。

恢复前由数据库管理账号创建一个名称不同、归应用账号拥有的空数据库，例如 `fuxiaochen_restored`。容器部署可在 PostgreSQL 容器中执行：

```sh
docker compose exec postgres psql -U postgres -d postgres -c 'CREATE DATABASE fuxiaochen_restored OWNER fuxiaochen;'
```

通过本地未提交的环境配置或容器环境设置 `RESTORE_DATABASE_URL`，本地指向 `127.0.0.1:15433/fuxiaochen_restored`，线上指向 `postgres:5432/fuxiaochen_restored`。不要将密码写进 shell 命令或版本控制。

```sh
npm run db:restore -- /absolute/backups/<UUID>
```

恢复拒绝同名的当前数据库、非空目标、旧 SQLite 格式、摘要错误或不同 contract 的备份。临时 SQL 文件仅服务账号可读；`psql --single-transaction` 将恢复、会话撤销、自动备份关闭及旧备份运行状态处理放在同一事务中，失败整体回滚。恢复后先在环境中将 `DATABASE_URL` 指向目标并执行 `db:verify`，核对业务数据；再停止旧应用和调度，正式切换连接 URL 并启动匹配版本。恢复不能找回已删除 OSS 文件。

## 更新与回退

1. 推送代码或版本 tag，等待对应提交的 GitHub Actions 成功，确认 `linux/amd64` 镜像并记录 tag/digest。
2. 更新前执行一次 PostgreSQL 备份，记录当前镜像 tag/digest。新迁移必须先审查。
3. 在原 Portainer Stack 中更新 `APP_IMAGE`（固定完整 commit 标签或 digest）与匹配的 Git ref，执行 **Pull and redeploy**，启用重新拉取镜像。
4. 确认容器日志中的迁移、校验与服务启动成功，健康检查通过，再通过 HTTPS 域名验证业务。

不建议直接开启按 Git commit 轮询部署：Portainer 可能在镜像构建完成前发现新 commit，从而拉取上一版的可变标签。即使 `latest` 已更新，同一个 Git commit 的轮询检查也可能跳过重新部署。先等待 Actions 成功再手动拉取部署；需要自动部署时，应另行配置构建成功后调用的 Portainer webhook 及镜像重拉取设置。

单机升级会短暂停机。没有数据库迁移时可以换回已记录的旧镜像；数据库已经迁移后，旧应用不一定兼容，不能只回退镜像。按上方恢复流程先核对备份、停止 Web 与调度、恢复到独立空库，再切换数据库和匹配的镜像。不要删除生产数据卷来解决启动失败。

SQLite 首次切换的回滚使用上面的维护快照与旧 Git tag；以后 PostgreSQL 升级按 PostgreSQL 备份恢复流程执行。Git Stack 的历史版本不能靠 Web Editor 下拉框恢复，也不要为回滚执行不可逆的 Detach from Git。

## 本地构建与配置检查

```sh
docker build -t fuxiaochen:local .
docker compose --env-file /absolute/private/deployment-check.env config --quiet
sh -n deploy/docker-entrypoint.sh
sh -n deploy/postgres-init.sh
```

配置检查文件只填写 dummy `APP_ORIGIN`、`DATABASE_URL`、两项 PostgreSQL 密码和 `POSTGRES_INIT_SCRIPT_PATH`，不输出展开后的真实配置。构建不需要 OSS 凭据或生产数据库，`.dockerignore` 排除环境文件、数据库、备份、上传目录与本地构建产物。验证真实部署时使用专门的数据库与空卷，避免连接开发或生产数据库。

参考：[Docker Actions 标签与发布](https://docs.docker.com/build/ci/github-actions/manage-tags-labels/)、[GHCR 鉴权与可见性](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)、[Portainer Git Stack](https://docs.portainer.io/user/docker/stacks/add)、[Portainer 相对路径卷（BE）](https://docs.portainer.io/advanced/relative-paths)、[Portainer Git Stack 更新](https://docs.portainer.io/user/docker/stacks/edit)、[Portainer GitOps 更新行为](https://docs.portainer.io/faqs/troubleshooting/stacks-deployments-and-updates/how-do-automatic-updates-for-stacks-applications-work)、[Docker bind mount 配置](https://docs.docker.com/reference/compose-file/services/#volumes)、[PostgreSQL 初始化脚本](https://github.com/docker-library/docs/blob/master/postgres/README.md#initialization-scripts)、[Caddy reverse_proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)、[Prisma PostgreSQL RC](https://www.prisma.io/extensions/postgresql)。

# GitHub Actions、Portainer 与 Caddy 部署

适用于单机 Docker Standalone。Portainer 从 `https://github.com/aifuxi/fuxiaochen` 拉取 Compose 配置，GitHub Actions 将 Web 和运维镜像分别发布到 `ghcr.io/aifuxi/fuxiaochen`、`ghcr.io/aifuxi/fuxiaochen-tools`。服务器无需安装 Node.js 或在拉取仓库后重新打包。通过 `ssh aliyun_vps` 准备数据库和维护快照，再在 Portainer 中重新部署。

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

工作流只构建当前 x86 `ubuntu-latest` runner 的默认平台 `linux/amd64`，不再安装 QEMU 或指定多架构 `platforms`；它与当前云服务器架构一致。本地 `docker build` 同样使用构建器的默认平台，Apple Silicon 上通常得到 `linux/arm64`；在本地准备服务器镜像时需显式使用 `--platform linux/amd64`。更换 CI runner 架构时同步核对发布平台，镜像不会自动适配远程部署服务器。

Action 使用固定 commit SHA，Node.js 基础镜像固定为 `24.21.0-bookworm-slim` 及多架构 digest；升级时一并核对版本与 digest。构建使用包含开发依赖的 `npm ci` 和现有 `npm run build`，保留原生模块安装脚本和 Next.js 的 TypeScript 检查。最终 Web 阶段实际执行 Argon2 hash/verify 与 Sharp PNG 编码，缺少当前平台原生文件时构建失败；工作流不运行现有业务回归测试。

Dockerfile 提供两个 target：默认 `runtime` 为 Web，`tools` 为运维命令。Next.js 使用 `output: "standalone"`，Web 只复制追踪后的服务端与依赖、`public` 和 `.next/static`，通过 `node server.js` 启动；不携带 Prisma CLI、`tsx`、Composer 或运维源码。迁移、账号管理、备份恢复、SQLite 导入和排期命令均在 tools 中执行。两者来自同一次源码构建，使用相同的 generated contract。

Argon2 使用 `node-gyp-build` 动态选择原生文件；`outputFileTracingIncludes` 显式保留当前构建进程平台/架构的 prebuilds 与源码编译的 `build/Release` 产物。初次本地交叉架构验证发现 amd64 standalone 只追踪到了 arm64 文件；补齐显式追踪并隔离 Next 缓存后，两个平台都取得对应原生文件，且最终 Web 构建中的原生调用通过。

tools 沿用现有生产依赖和源码，以保留 Prisma 8 RC CLI 与全部运维功能。Prisma CLI、`tsx`、`@inquirer/prompts` 保持在 `dependencies`；`production-dependencies` 从完整安装结果执行 `npm prune --omit=dev --ignore-scripts --no-audit --no-fund`。裁剪阶段不重复执行依赖生命周期脚本，已安装的原生模块保留。tools 仍包含 Composer 及其传递依赖，体积较大；Web 的缩小不等于服务器存放两镜像后的总磁盘占用同比缩小。

Prisma 使用 CLI `8.0.0-rc.19` 和 PostgreSQL runtime `8.0.0-rc.14`（RC），沿用 Prisma 8 contract 迁移流程。两镜像共用安装 PostgreSQL 18 客户端的基础阶段：Web 后台在线备份需要 `pg_dump` 和 `pg_restore`，tools 恢复还使用 `psql`。

发布使用仓库提供的 `GITHUB_TOKEN` 和 `packages: write` 权限，不需要把个人 token 放进 Actions。首次运行成功后，在 GitHub 账号的 Packages 中确认 `fuxiaochen` 和 `fuxiaochen-tools` 均已生成，并分别配置可见性。镜像包的可见性独立于源码仓库：

- 公开镜像：在 Package settings 中设置 Public，Portainer 可以匿名拉取。
- 私有镜像：在 Portainer Registries 添加 `ghcr.io`，填写 GitHub 用户名和具有 `read:packages` 的 PAT classic，并在 Stack 部署时选择该 Registry。不要把 token 写入 Compose 或提交 Git。

正式发布使用 `master` 的已提交代码。先推送并等待整个 Actions workflow 成功，再对两镜像的 `sha-<完整 SHA>` 分别执行 `docker buildx imagetools inspect`，确认包含服务器所需的 `linux/amd64`，记录各自 index digest，并固定 `APP_IMAGE` 与 `TOOLS_IMAGE`。两者 digest 不同，OCI `org.opencontainers.image.revision` 必须是同一个完整 commit SHA；Compose 配置也使用该提交。两个仓库顺序发布，后一个失败时前一个可能已经发布，不能仅看到 Web 标签出现就部署。不要在构建完成前开始停机，也不要靠 `latest` 判断实际部署版本。

### 构建缓存

Dockerfile 为 npm 的 `/root/.npm` 和 Next.js 的 `/app/.next/cache` 使用 `sharing=locked` 的 BuildKit cache mount。Next.js 的 mount ID 使用自动目标参数 `TARGETOS`/`TARGETARCH`，按构建平台隔离文件追踪缓存；不会改变目标平台。CI 读取默认 Docker daemon 的 OS/Arch，把同一个 ID 交给 cache-dance。缓存位于独立挂载中，不进入镜像层；不要在构建末尾删除挂载中的 `.next/cache`，否则下一次无法复用。运行镜像单独创建可写缓存目录，继续由 `node` 用户使用。

GitHub Actions 的 `type=gha,mode=max` 复用构建层，两个 target 共用 builder，分别导出 Web/tools scope，并同时导入两份缓存以复用共同阶段，避免后一份覆盖前一份。层缓存不能自动持久化 cache mount 的内容。工作流通过固定版本的 `actions/cache` 与 `buildkit-cache-dance` 恢复、注入、提取并保存 npm 与 Next.js 两份缓存。缓存按 runner 系统、架构和 Dockerfile 隔离；npm 缓存使用 lockfile 对应的保存 key，lockfile 变化时可复用旧下载内容；Next.js 缓存绑定 lockfile 与构建配置，源码变化时恢复上一份兼容缓存，并在每次运行使用新的保存 key，让新编译结果能够持久化。缓存被淘汰或首次构建时正常重新下载、编译，不影响产物正确性。

本地同一个 builder 在 arm64 与 amd64 间切换时，Next.js 缓存自动隔离；无需设置 `platforms` 或手动缓存 namespace。npm 下载缓存可以复用不同平台各自的包归档。跨项目需要额外隔离时，可使用 `BUILDKIT_CACHE_MOUNT_NS`；CI 保持默认 namespace，使 cache-dance 的注入和提取与 Dockerfile 的挂载一致。`sharing=locked` 只避免并发写入，不提供架构隔离。

`.dockerignore` 排除测试、设计规范、skill 清单及已有的本地依赖、环境文件和构建产物，保留生产源码、迁移和运维脚本。仅修改被排除的文件不会重新触发应用构建。

### 第一批优化验证

以下为第一批单镜像阶段的历史结果（提交 `b6b96e5a`），第二批结果另列。2026-10-11，以 `5783c72f` 的应用源码分别构建原始镜像与优化后的单镜像。本地 Docker 29.4.0 / BuildKit 0.29.0，体积对比使用同一 `linux/arm64` 平台；所有 npm 包的版本、下载地址和 integrity 保持不变，仅调整三项运行依赖的分类。

| 测量项                                                | 原始镜像  | 优化镜像  | 变化                   |
| ----------------------------------------------------- | --------- | --------- | ---------------------- |
| 压缩内容大小（本地 containerd 的 image inspect Size） | 510.6 MB  | 482.5 MB  | 减少 28.1 MB，约 5.5%  |
| 解压后的镜像层总大小（history Size 总和）             | 2805.5 MB | 2692.3 MB | 减少 113.3 MB，约 4.0% |
| node_modules 层                                       | 2407.0 MB | 2293.7 MB | 裁剪 189 个包          |
| .next 层                                              | 50.5 MB   | 50.5 MB   | 构建缓存未进入运行镜像 |

以上为十进制 MB，不使用 Docker image ls 的磁盘总占用代替压缩内容或解压层大小。Composer 的运行依赖仍占较大空间，因此本批没有 GB 级瘦身收益。

本地运行通过：相同源码重复构建，全部构建层命中，端到端约 1.55 秒；在独立临时源码副本中只修改一个服务端字符串后，依赖安装与裁剪层仍命中，Next.js 编译从首次约 5.8 秒降至约 1.0 秒，整个构建约 14.52 秒。在另一临时副本中修改应用版本及 lockfile 根元数据、保持依赖版本不变，断网执行 `npm ci --offline` 成功重装 820 个包，并完成裁剪，确认 npm 下载缓存可复用。首次构建已有基础层缓存，且基线与优化构建并发执行，未将其耗时作为完整冷构建对比。

| 验证范围             | 状态与证据                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 构建与类型检查       | 原始与优化的 arm64 构建，以及优化的 amd64 构建均通过 Next.js TypeScript 检查                                                                                     |
| arm64 现有回归       | 登录 18/18、PostgreSQL 17/17、SQLite 导入 17/17，测试运行在最终裁剪镜像内的独立数据库                                                                            |
| arm64 实际业务操作   | 管理员创建与重置、HTTP 登录/退出与会话撤销、排期发布、备份、独立空库恢复及恢复后验证运行通过                                                                     |
| arm64 容器行为       | node 用户、healthy、Argon2/Sharp 原生调用、PostgreSQL 18.6 客户端、SIGTERM 退出运行通过；迁移失败退出 2、contract 校验失败退出 4，均未启动 Web                   |
| amd64 冒烟验证       | 在本地 Docker 仿真运行，Argon2/Sharp、默认启动迁移与校验、/login 200 与 healthy、管理员初始化与 HTTP 登录、排期发布和 CLI 备份运行通过；不代表生产服务器原生实测 |
| CI 工作流            | actionlint、YAML 结构和固定 Action 接口核对通过；GitHub 托管 runner 的实际缓存上传、恢复与耗时尚未验证                                                           |
| 宿主机独立 typecheck | 未通过：现有 data/ 历史发布源码副本缺少 generated，临时排除 data 后仍有 Buffer/Node 类型冲突；本批未修改这些源码、历史数据或 TypeScript 配置                     |
| 外部服务             | OSS 使用 dummy 配置和媒体 SDK mock，未访问真实 OSS；未推送、发布或部署生产环境                                                                                   |

### 第二批 standalone 与 tools 验证

2026-10-11，在第一批基础上拆分两个 target，使用相同 Node.js 基础镜像与依赖版本。本地 Docker 29.4.0 / BuildKit 0.29.0，以下大小统一测量 `linux/arm64`，MB 为十进制：

| 测量项                                              | 第一批单镜像 | standalone Web       | tools     |
| --------------------------------------------------- | ------------ | -------------------- | --------- |
| 压缩内容（containerd image inspect Size，含元数据） | 482.5 MB     | 116.2 MB，减少 75.9% | 470.6 MB  |
| 解压层总大小（Docker API history Size 总和）        | 2692.3 MB    | 400.3 MB，减少 85.1% | 2641.7 MB |

两镜像共享 9 个基础层。按层 digest 去重后，解压层合计 2696.4 MB，比第一批增加约 4.2 MB（0.16%）；OCI gzip 层去重合计 486.3 MB，比第一批同口径 482.5 MB 增加约 0.78%。它们分别描述解压层与压缩层内容，不是 Docker 总磁盘占用，不包含旧版本镜像、构建缓存、容器写入或数据卷。Web 单独运行显著缩小，服务器同时保存 tools 时总占用基本持平。

同一 builder 顺序重复构建，两 target 均复用 npm 安装、Next.js 构建和 PostgreSQL 客户端安装层，tools 还复用生产依赖裁剪层；含本地导出，Web 约 1.28 秒，tools 约 0.93 秒。独立冷构建 tools 仍会执行共享的 Next.js 构建以取得同一次生成的 contract；CI 先构建 Web，再构建 tools，后一步复用该阶段。真实 GitHub 缓存上传与恢复耗时仍未验证。

| 验证范围                 | 状态与证据                                                                                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 两平台两 target 构建     | arm64 与 amd64 均运行通过，Next.js 编译及构建内 TypeScript 检查通过                                                                                                                            |
| tools 现有测试           | 登录 18/18、PostgreSQL 17/17、SQLite 导入 17/17、SEO 9/9，共 61/61；使用隔离 PostgreSQL 与媒体 mock                                                                                            |
| standalone Web HTTP 回归 | 8 个前台页、11 个后台页、真实登录与安全 Cookie、API 创建文章/分类/标签、全文检索、代码高亮、排期发布后可读、canonical/JSON-LD/robots/sitemap 运行通过                                          |
| 资源与原生依赖           | 16 个 Next 静态资源、5 个 public 文件、实际图片优化、Argon2 hash/verify 与 Sharp PNG 处理运行通过；Web 确认不含 Prisma CLI、tsx、Composer 与运维源码                                           |
| 备份与 tools CLI         | Web 在线备份、幂等重试与归档验证，共享卷读写、tools CLI 备份及独立空库恢复运行通过；恢复保留业务与管理员，撤销会话并关闭自动备份；管理员初始化/重置、排期、媒体 dry-run 和统计清理命令运行通过 |
| Compose 冷启动与更新     | 本地 Compose 5.1.2：数据库 healthy → 迁移及校验退出 0 → Web 随后启动且 healthy；tools profile 无常驻服务；删除旧 migrate 后同版本重新部署确实重跑迁移                                          |
| Compose 失败阻断         | 缺少目标数据库时 migrate 退出 2；字段类型漂移时 verify 退出 4；两种情况下 Web 均未启动，修复后重新部署成功                                                                                     |
| amd64 冒烟验证           | 本地 Docker 仿真：迁移/verify、交互管理员初始化、Argon2/Sharp、HTTP 登录与鉴权、图片优化、在线备份与共享卷 PG18 archive/摘要/0600 权限验证、healthy 均通过；不代表云服务器原生实测             |
| 容器停止                 | arm64 原生 Web 约 0.07 秒停止；amd64 仿真 Web/tools 约 0.10/0.07 秒停止，SIGTERM 退出码 143，无强杀或 OOM；所有运维临时容器、网络、卷及含凭据文件已清理                                        |
| CI 与部署                | actionlint、格式与 Compose 配置检查通过；Portainer 2.45.1 的强制重建仅源码核对，未实际部署；未发布 GHCR、未推送或部署生产                                                                      |
| 验证边界                 | HTTP 回归不代表浏览器全部交互通过；未访问真实 OSS；宿主机独立 typecheck 的现有问题见第一批记录，本批未改变其范围                                                                               |

## Portainer 从 GitHub 创建 Stack

1. 先将配置推送到 GitHub，等 Actions 构建发布成功，再创建或更新 Stack。
2. 在 Docker Standalone 环境进入 **Stacks → Add stack → Git Repository**，Stack 名称使用 `fuxiaochen`。
3. 仓库填写 `https://github.com/aifuxi/fuxiaochen`，Repository reference 使用待部署配置所在的分支，例如 `refs/heads/master`。
4. Compose path 填 `compose.yaml`。
5. 从 `deploy/portainer.env.example` 导入变量，替换真实域名、OSS 地址和凭据；先预置下方的宿主机初始化脚本。全新空库可以部署；已有 SQLite 的站点先执行下方切换流程。

| 变量                         | 配置                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `APP_IMAGE`                  | 默认 `ghcr.io/aifuxi/fuxiaochen:latest`；可改成分支、版本、`sha-<完整 SHA>` 或 `@sha256:<digest>`     |
| `TOOLS_IMAGE`                | 默认 `ghcr.io/aifuxi/fuxiaochen-tools:latest`；正式部署固定与 `APP_IMAGE` 同一 commit 的标签或 digest |
| `APP_ORIGIN`                 | 必填，例如 `https://fuxiaochen.com`；不带路径、尾斜杠，必须与浏览器访问地址完全一致                   |
| `APP_DATA_VOLUME`            | 默认 `fuxiaochen-data`，升级时保留同一个卷                                                            |
| `DATABASE_URL`               | 必填，`postgresql://fuxiaochen:<URL编码的应用密码>@postgres:5432/fuxiaochen`                          |
| `POSTGRES_ADMIN_PASSWORD`    | PostgreSQL 管理账号密码，不能与应用密码混用                                                           |
| `POSTGRES_APP_PASSWORD`      | 普通应用账号的初始化密码，与 DATABASE_URL 中的密码对应                                                |
| `POSTGRES_DATA_VOLUME`       | 默认 `fuxiaochen-postgres`，升级时保留同一卷                                                          |
| `POSTGRES_INIT_SCRIPT_PATH`  | 必填宿主机绝对路径，示例 `/srv/fuxiaochen/postgres-init.sh`；脚本须与发布 commit 一致                 |
| `CADDY_NETWORK`              | 复用服务器已存在的外部网络，默认 `infra_edge`                                                         |
| `OSS_*`、`ALIBABA_CLOUD_*`   | 沿用 `.env.example` 的配置；在 Portainer 填写真实值                                                   |
| `ANALYTICS_CLIENT_IP_HEADER` | 默认空；按后面的代理配置确认后可填 `x-real-ip`                                                        |

Compose 通过显式 `environment` 注入变量，不依赖仓库中不存在的 `.env` 或 `stack.env`。宿主机文件和开发环境变量不会进入镜像。OSS 上传仍由浏览器访问 `OSS_UPLOAD_ENDPOINT`，容器服务端使用 `OSS_SERVER_ENDPOINT`，两者应按服务器和客户端实际网络配置；部署域名也需加入 Bucket CORS 的允许来源。

2026-10-07 实测，原应用容器的 Docker DNS 将当前 OSS 公开域名解析为 `198.18.0.10`，请求超时；宿主机及阿里 DNS 得到真实地址。同一 `infra_edge` 网络的一次性容器在默认 DNS 下也失败，指定 `223.5.5.5`、`223.6.6.6` 后解析与 OSS HEAD 请求成功。因此生产 `app` 显式配置这两个 DNS，不修改宿主机或 gateway 的 DNS。Docker 内部的 `postgres` 服务名仍由容器网络解析；正式切换时同时验证数据库连接和 OSS 访问。

三个应用服务均使用 `node` 用户（UID/GID 1000）并共享应用卷。`migrate` 使用 tools 镜像，一次性执行现有 `npm run db:migrate`，其中依次运行 Prisma 8 的 `db migrate` 与 `db verify`；不注入 OSS 凭据，不接代理网络，失败后保持非零退出状态。`app` 等待 `migrate` 成功退出才启动 standalone Web；`tools` 使用可选 profile，仅在显式 `docker compose run --rm tools <命令>` 时运行，不常驻。直接单独运行 Web 镜像前，必须先使用匹配的 tools 完成迁移与校验。

Web 监听容器端口 3000，Docker 通过 `/login` 的 HTTP 200 判断服务可用。该健康检查不代表 OSS 配置或全部业务已验证，Docker 的 unhealthy 状态也不会单独触发 `unless-stopped` 重启。依赖条件由 Compose 的部署操作执行，Docker 自动重启 Web 或 `docker restart` 不会重新执行迁移。

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
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps tools npm run db:migrate
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps tools npm run db:import-sqlite -- --source /app/data/releases/release-id/source.sqlite --dry-run --report /app/data/releases/release-id/preflight.json
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps tools npm run db:import-sqlite -- --source /app/data/releases/release-id/source.sqlite --apply --report /app/data/releases/release-id/import.json
   docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps tools npm run db:import-sqlite -- --source /app/data/releases/release-id/source.sqlite --verify --report /app/data/releases/release-id/verify.json
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

Web 容器不包含运维命令。服务器保留与 Portainer 发布版本一致的 `/srv/fuxiaochen/compose.yaml` 和 `0600` 的 `production.env`，在服务器终端通过 tools 执行。显式指定 project、配置和环境文件，复用当前 Stack 的网络与数据卷；`--no-deps` 避免运维命令重新创建依赖服务，执行前确认 PostgreSQL 已健康、当前 schema 已迁移并校验。

```sh
# 仅全新空库需要 admin:init；SQLite 导入已有账号后跳过。
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps tools npm run admin:init
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps tools npm run admin:reset-password
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps -T tools npm run operations:run
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps -T tools npm run db:backup
```

管理员命令交互输入账号与密码，不使用环境变量自动创建管理员。交互命令保留终端，自动调度与备份使用 `-T` 禁用 TTY。

排期发布和自动备份仍需外部调度。宿主机每分钟运行上述 tools `operations:run` 命令；更新时暂停调度，迁移与业务验证通过后再恢复。调度不依赖 Web 容器名，但配置文件、`TOOLS_IMAGE`、环境变量必须跟随发布版本同步。备份只包含数据库，不含 OSS 文件；备份仍位于同一宿主机，需另行复制到其他存储。

`operations:run` 执行到期发布，再按后台备份面板中的开关执行当天自动备份。仅执行到期发布使用 `npm run posts:publish-due`。调度与 Web 必须共享数据库和备份磁盘；未配置调度时，排期保持等待状态，可在后台手动执行到期计划。

## 单实例 Node.js 部署

也可在服务器运行 Node.js 24+，连接已启动的 PostgreSQL。将正确的 `DATABASE_URL`、HTTPS `APP_ORIGIN` 与持久 `BACKUP_DIRECTORY` 保存在项目根目录未提交的 `.env`（权限 `0600`），安装 PostgreSQL 18 客户端工具和完整 npm 依赖。`BACKUP_DIRECTORY` 必须使用绝对路径，供 Web 与 CLI 共用；standalone 服务会切换工作目录，相对路径可能指向不同位置。以下命令从项目根目录执行，启动时显式读取当前 `.env`，避免使用构建时复制到 standalone 中的旧环境配置。

```sh
npm ci
npm run db:generate
npm run db:migrate
npm run admin:init
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
HOSTNAME=0.0.0.0 PORT=3000 node --env-file=.env .next/standalone/server.js
```

外部调度每分钟运行 `operations:run`，使用与 Web 相同的环境配置、数据库和备份目录。CLI 执行完毕释放连接。

## 数据库备份与恢复

`npm run db:backup` 使用 `pg_dump` custom 格式的一致性快照。默认备份目录为 `./data/backups`，容器为 `/app/data/backups`；可通过 `BACKUP_DIRECTORY` 指定。每份备份在独立 UUID 目录中包含 `database.dump` 和 `manifest.json`，记录大小、SHA-256、contract 摘要和 PostgreSQL 主版本。备份包括数据库、鉴权和媒体元数据，不包含 OSS 文件。目录由服务账号独占，不放入 public/ 或提交 Git；无自动保留策略，需定期检查容量并保存异地副本。

本地需要 PostgreSQL 18 客户端工具。macOS 可安装 `libpq` 并将其 bin 目录加入 PATH；确认 `pg_dump --version`、`pg_restore --version`、`psql --version` 为 18 系列。镜像内已经安装。凭据通过子进程环境传递，不放入命令参数或错误日志。

恢复前由数据库管理账号创建一个名称不同、归应用账号拥有的空数据库，例如 `fuxiaochen_restored`。容器部署可在 PostgreSQL 容器中执行：

```sh
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml exec postgres psql -U postgres -d postgres -c 'CREATE DATABASE fuxiaochen_restored OWNER fuxiaochen;'
```

通过本地未提交的环境配置或容器环境设置 `RESTORE_DATABASE_URL`，本地指向 `127.0.0.1:15433/fuxiaochen_restored`，线上指向 `postgres:5432/fuxiaochen_restored`。不要将密码写进 shell 命令或版本控制。

```sh
npm run db:restore -- /absolute/backups/<UUID>
```

容器部署使用相同备份卷中的路径，通过 tools 恢复。先确认备份所属发布版本，将 `TOOLS_IMAGE` 临时固定到该版本的 tools 并拉取；恢复和随后 `db:verify` 均使用该版本，当前新版 tools 会拒绝旧 contract 的备份。历史单镜像版本可使用当时的单镜像执行 CLI。此时保持 Web 与调度停止，不启动与临时 tools 不匹配的 Web：

```sh
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml run --rm --no-deps -T tools npm run db:restore -- /app/data/backups/<UUID>
```

恢复拒绝同名的当前数据库、非空目标、旧 SQLite 格式、摘要错误或不同 contract 的备份。临时 SQL 文件仅服务账号可读；`psql --single-transaction` 将恢复、会话撤销、自动备份关闭及旧备份运行状态处理放在同一事务中，失败整体回滚。恢复后先在环境中将 `DATABASE_URL` 指向目标，通过匹配 tools 执行 `db:verify`，核对业务数据；再停止旧应用和调度，正式切换连接 URL 并按更新流程重建 migrate 与 Web。恢复不能找回已删除 OSS 文件。

## 更新与回退

1. 推送代码或版本 tag，等待对应提交的整个 GitHub Actions workflow 成功，确认两个 `linux/amd64` 镜像并记录 tag/digest 与相同 OCI revision。
2. 更新前暂停外部调度并执行一次 PostgreSQL 备份，记录当前两镜像 tag/digest。新迁移必须先审查。
3. 在原 Portainer Stack 中同时更新 `APP_IMAGE`、`TOOLS_IMAGE`（固定同一完整 commit 的标签或各自 digest）与匹配的 Git ref。停止旧 app，再执行 **Pull and redeploy**，启用重新拉取镜像，防止旧 Web 在迁移期间接受写入。
4. 检查 `migrate` 日志与退出码 0，再确认 Web 启动和健康检查通过，通过 HTTPS 域名验证业务后恢复调度。迁移失败时保持 Web 停止，保留失败容器日志、数据库和卷；修复后重新执行完整部署。

Portainer CE 2.45.1 的 Git **Pull and redeploy** 在源码中以 `forceCreate=true` 调用 Compose，最终传入 `api.RecreateForce`，会重新运行 migrate。此结论为 [Git redeploy 入口](https://github.com/portainer/portainer/blob/2.45.1/api/http/handler/stacks/stack_update_git_redeploy.go#L331)、[部署参数传递](https://github.com/portainer/portainer/blob/2.45.1/api/stacks/deployments/deployer.go#L76) 和 [Compose 实现](https://github.com/portainer/portainer/blob/2.45.1/pkg/libstack/compose/composeplugin.go#L87) 的源码核对，第二批没有在真实 Portainer 部署验证；更换版本或入口后需重新核对重建行为。

普通 `docker compose up` 的 `service_completed_successfully` 可能接受以前已退出 0 的 migrate，不能把它当成每次重跑迁移的保证。命令行更新先拉取两镜像，再停止旧 Web、删除旧 migrate 容器并启动 app；不要删除数据库服务或卷：

```sh
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml pull app migrate
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml stop app
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml rm -f migrate
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml up -d app
docker compose -p fuxiaochen --env-file /srv/fuxiaochen/production.env -f /srv/fuxiaochen/compose.yaml logs migrate app
```

不建议直接开启按 Git commit 轮询部署：Portainer 可能在镜像构建完成前发现新 commit，从而拉取上一版的可变标签。即使 `latest` 已更新，同一个 Git commit 的轮询检查也可能跳过重新部署。先等待 Actions 成功再手动拉取部署；需要自动部署时，应另行配置构建成功后调用的 Portainer webhook 及镜像重拉取设置。

单机升级会短暂停机。没有数据库迁移时可以同时换回已记录的旧 Web/tools 两镜像与 Compose 配置，再执行上述完整更新流程；数据库已经迁移后，旧应用不一定兼容，不能只回退镜像。按上方恢复流程先核对备份、停止 Web 与调度，将 tools 固定为备份所属版本，恢复到独立空库并验证，再同步切换数据库、Web/tools 两镜像和匹配的 Compose 配置。不要删除生产数据卷来解决启动失败。回退到第一批或更早的单镜像版本时还原该版本 Compose 与调度命令。

SQLite 首次切换的回滚使用上面的维护快照与旧 Git tag；以后 PostgreSQL 升级按 PostgreSQL 备份恢复流程执行。Git Stack 的历史版本不能靠 Web Editor 下拉框恢复，也不要为回滚执行不可逆的 Detach from Git。

## 本地构建与配置检查

```sh
docker build --target runtime -t fuxiaochen:local .
docker build --target tools -t fuxiaochen-tools:local .
docker compose --env-file /absolute/private/deployment-check.env config --quiet
sh -n deploy/docker-entrypoint.sh
sh -n deploy/postgres-init.sh
```

配置检查文件只填写 dummy `APP_ORIGIN`、`DATABASE_URL`、两项 PostgreSQL 密码和 `POSTGRES_INIT_SCRIPT_PATH`，不输出展开后的真实配置。构建不需要 OSS 凭据或生产数据库，`.dockerignore` 排除环境文件、数据库、备份、上传目录与本地构建产物。验证真实部署时使用专门的数据库与空卷，避免连接开发或生产数据库。

参考：[Docker Actions 标签与发布](https://docs.docker.com/build/ci/github-actions/manage-tags-labels/)、[GHCR 鉴权与可见性](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)、[Portainer Git Stack](https://docs.portainer.io/user/docker/stacks/add)、[Portainer 相对路径卷（BE）](https://docs.portainer.io/advanced/relative-paths)、[Portainer Git Stack 更新](https://docs.portainer.io/user/docker/stacks/edit)、[Portainer GitOps 更新行为](https://docs.portainer.io/faqs/troubleshooting/stacks-deployments-and-updates/how-do-automatic-updates-for-stacks-applications-work)、[Docker bind mount 配置](https://docs.docker.com/reference/compose-file/services/#volumes)、[PostgreSQL 初始化脚本](https://github.com/docker-library/docs/blob/master/postgres/README.md#initialization-scripts)、[Caddy reverse_proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)、[Prisma PostgreSQL RC](https://www.prisma.io/extensions/postgresql)。

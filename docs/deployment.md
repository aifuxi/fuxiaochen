# GitHub Actions、Portainer 与 Caddy 部署

适用于单机 Docker Standalone。Portainer 从 `https://github.com/aifuxi/fuxiaochen` 拉取 Compose 配置，应用镜像由 GitHub Actions 构建并发布到 `ghcr.io/aifuxi/fuxiaochen`。服务器无需安装 Node.js 或在拉取仓库后重新打包。已通过 `ssh aliyun_vps` 核对服务器配置；本次未修改服务器或部署应用。

## 当前服务器环境

2026-10-03 通过 SSH 确认：

- 服务器为 `linux/amd64`，Docker Swarm 未启用。
- Portainer CE `2.45.1` 位于 `container-management` Stack，入口为 `https://portainer.fuxiaochen.com`。
- Caddy `2.10.2` 位于 `gateway` Stack，挂载 `/srv/infra/caddy`，主配置导入 `sites/*.caddy`。
- `gateway-edge-1` 已接入外部 bridge 网络 `infra_edge`。应用复用该网络，使用别名 `fuxiaochen`，不发布宿主机端口。
- `mindfolio_portainer_proxy` 是 Portainer 专用的内部网络，应用不接入它。
- 生产域名使用用户确认的 `https://fuxiaochen.com`。

现有 Portainer、Caddy 镜像、凭据和证书卷不需要更换。应用以新的 `fuxiaochen` Stack 部署。

## 镜像构建

工作流为 `.github/workflows/container.yml`，触发条件：

- 推送任意分支：发布该分支标签和 `sha-<完整 commit SHA>`。
- 推送 `v*` tag：发布对应 tag 和 commit 标签。
- 默认分支（当前为 `master`）：额外发布 `latest`。
- 向 `master` 提交 PR：构建镜像但不发布。
- `workflow_dispatch`：手动构建所选分支或 tag。

镜像同时支持 `linux/amd64` 与 `linux/arm64`。Action 使用固定 commit SHA，Node.js 基础镜像固定为 `24.21.0-bookworm-slim` 及多架构 digest；升级时一并核对版本与 digest。构建使用 `npm ci` 和现有 `npm run build`，Next.js 构建包含 TypeScript 检查。工作流不运行测试。

镜像保留现有 Prisma CLI、`tsx`、`@inquirer/prompts` 及其依赖，支持迁移、账号管理、备份和排期命令，因此没有裁剪成仅运行 Web 的 standalone 镜像，也没有执行 `npm prune --omit=dev`。Prisma 仍使用 CLI `8.0.0-rc.19` 和 SQLite runtime `8.0.0-rc.14`（RC／experimental），没有更换迁移流程。

发布使用仓库提供的 `GITHUB_TOKEN` 和 `packages: write` 权限，不需要把个人 token 放进 Actions。首次运行成功后，在 GitHub 账号的 Packages 中确认 `fuxiaochen` 已生成。镜像包的可见性独立于源码仓库：

- 公开镜像：在 Package settings 中设置 Public，Portainer 可以匿名拉取。
- 私有镜像：在 Portainer Registries 添加 `ghcr.io`，填写 GitHub 用户名和具有 `read:packages` 的 PAT classic，并在 Stack 部署时选择该 Registry。不要把 token 写入 Compose 或提交 Git。

当前功能分支 `feat/shiguang-notes` 的镜像标签会规范为 `feat-shiguang-notes`。如果配置还没有合并进 `master`，先将 Portainer 的 Repository reference 设为 `refs/heads/feat/shiguang-notes`，并使用该分支成功构建的镜像；`latest` 要等默认分支构建后才有。

## Portainer 从 GitHub 创建 Stack

1. 先将配置推送到 GitHub，等 Actions 构建发布成功，再创建或更新 Stack。
2. 在 Docker Standalone 环境进入 **Stacks → Add stack → Git Repository**，Stack 名称使用 `fuxiaochen`。
3. 仓库填写 `https://github.com/aifuxi/fuxiaochen`，Repository reference 使用待部署配置所在的分支，例如 `refs/heads/master`。
4. Compose path 填 `compose.yaml`。
5. 从 `deploy/portainer.env.example` 导入变量，替换真实域名、OSS 地址和凭据，然后部署。

| 变量                         | 配置                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `APP_IMAGE`                  | 默认 `ghcr.io/aifuxi/fuxiaochen:latest`；可改成分支、版本、`sha-<完整 SHA>` 或 `@sha256:<digest>` |
| `APP_ORIGIN`                 | 必填，例如 `https://fuxiaochen.com`；不带路径、尾斜杠，必须与浏览器访问地址完全一致               |
| `APP_DATA_VOLUME`            | 默认 `fuxiaochen-data`，升级时保留同一个卷                                                        |
| `CADDY_NETWORK`              | 复用服务器已存在的外部网络，默认 `infra_edge`                                                     |
| `OSS_*`、`ALIBABA_CLOUD_*`   | 沿用 `.env.example` 的配置；在 Portainer 填写真实值                                               |
| `ANALYTICS_CLIENT_IP_HEADER` | 默认空；按后面的代理配置确认后可填 `x-real-ip`                                                    |

Compose 通过显式 `environment` 注入变量，不依赖仓库中不存在的 `.env` 或 `stack.env`。宿主机文件和开发环境变量不会进入镜像。OSS 上传仍由浏览器访问 `OSS_UPLOAD_ENDPOINT`，容器服务端使用 `OSS_SERVER_ENDPOINT`，两者应按服务器和客户端实际网络配置；部署域名也需加入 Bucket CORS 的允许来源。

容器使用 `node` 用户（UID/GID 1000）。默认启动命令先执行现有 `npm run db:migrate`，其中依次运行 Prisma 8 的 `db migrate` 与 `db verify`；任一步失败就退出，不启动 Web。正常启动后监听容器端口 3000，Docker 通过 `/login` 的 HTTP 200 判断 Web 服务可用。该健康检查不代表 OSS 配置或全部业务已验证，Docker 的 unhealthy 状态也不会单独触发 `unless-stopped` 重启。

数据库固定为 `/app/data/admin.sqlite`，备份为 `/app/data/backups`，CLI 与 Web 使用同一绝对路径。命名卷保存整个 `/app/data`，包括 SQLite WAL/SHM 和备份。不要删除卷或为同一数据库运行多个 Web 副本；新 Stack 名称如复用旧卷，也必须先停旧实例。后续接管已有数据库时，先做在线备份，停止旧 Web 与调度，再将正确文件放入卷并确保 UID/GID 1000 可读写。已有文章的旧 schema 迁移仍须遵循 README 的 slug 回填限制。

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

`alidns_tls` 是服务器主 Caddyfile 中现有的片段，沿用 gateway 的 AliDNS 凭据和 DNS 验证方式。不要用站点文件替换主 Caddyfile 或 Portainer 站点配置。确认域名 DNS 指向这台服务器后，将文件放入站点目录，再在 `/srv/infra` 执行现有 `mise run caddy:reload`，该任务先校验再重载。这里提供配置和操作说明，未实际复制或重载服务器配置。

Caddy 负责 HTTPS，应用通过内部 HTTP 处理代理请求。`APP_ORIGIN=https://fuxiaochen.com` 与浏览器地址完全一致；生产鉴权使用 Secure Cookie，必须通过 HTTPS 域名登录。

本配置由 Caddy 覆盖客户端传来的 `X-Real-IP`。确认 Caddy 直接接收访客连接后，才将 `ANALYTICS_CLIENT_IP_HEADER` 设为 `x-real-ip`。如果 Caddy 前还有 CDN 或另一层代理，先配置可信代理及真实客户端 IP 解析；上述 `{remote_host}` 此时是上一跳地址，不能当作访客 IP。`infra_edge` 只接入可信容器，同一网络中不能有另一个应用使用相同别名。

## 管理员与运维命令

首次部署空库后，在 Portainer 的应用容器 Console 中运行，以 `node` 用户打开交互终端：

```sh
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

## 更新与回退

1. 推送代码或版本 tag，等待 GitHub Actions 成功并确认镜像 tag/digest。
2. 更新前执行一次数据库在线备份，记录当前镜像 tag/digest。新迁移必须先审查。
3. 在 Portainer 中更新 `APP_IMAGE`（建议使用完整 commit 标签或 digest），执行 **Pull and redeploy**，启用重新拉取镜像。
4. 确认容器日志中的迁移、校验与服务启动成功，健康检查通过，再通过 HTTPS 域名验证业务。

不建议直接开启按 Git commit 轮询部署：Portainer 可能在镜像构建完成前发现新 commit，从而拉取上一版的可变标签。即使 `latest` 已更新，同一个 Git commit 的轮询检查也可能跳过重新部署。先等待 Actions 成功再手动拉取部署；需要自动部署时，应另行配置构建成功后调用的 Portainer webhook 及镜像重拉取设置。

单机升级会短暂停机。没有数据库迁移时可以换回已记录的旧镜像；数据库已经迁移后，旧应用不一定兼容，不能只回退镜像。按 README 的恢复流程先核对备份、停止 Web 与调度、恢复到新文件，再切换数据库和匹配的镜像。不要删除生产数据卷来解决启动失败。

## 本地构建与配置检查

```sh
docker build -t fuxiaochen:local .
APP_ORIGIN=https://fuxiaochen.com docker compose config --quiet
sh -n deploy/docker-entrypoint.sh
```

构建不需要 OSS 凭据或生产数据库，`.dockerignore` 排除环境文件、数据库、备份、上传目录与本地构建产物。验证真实部署时使用专门的空卷，避免连接开发或生产数据库。

参考：[Docker Actions 标签与发布](https://docs.docker.com/build/ci/github-actions/manage-tags-labels/)、[GHCR 鉴权与可见性](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)、[Portainer Git Stack](https://docs.portainer.io/user/docker/stacks/add)、[Portainer GitOps 更新行为](https://docs.portainer.io/faqs/troubleshooting/stacks-deployments-and-updates/how-do-automatic-updates-for-stacks-applications-work)、[Caddy reverse_proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)、[Prisma SQLite experimental](https://www.prisma.io/extensions/sqlite)。

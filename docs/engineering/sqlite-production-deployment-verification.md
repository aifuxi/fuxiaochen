# SQLite 首次生产部署核验

日期：2026-10-22（Asia/Shanghai）。用户明确授权合并到 `master`、推送、等待镜像构建并通过阿里云服务器既有 Portainer 页面重新部署，明确指定线上数据使用当前本地 `data/site.sqlite`。新版于 00:08 启动；此记录中的后续文档同步不改变已部署应用代码。

## 版本与配置

- `feat/lark-editor` 快进合并到 `master` 并推送。发布前修复认证测试写死迁移数量的问题，改为比较实际 ledger 的完整 hash/时间清单；没有修改业务认证逻辑。
- 发布提交：`dc82b680e924a26c15659eb58a82ea4de8640bae`；[GitHub Actions 39630243551](https://github.com/aifuxi/fuxiaochen/actions/runs/39630243551) 成功。
- 镜像：`ghcr.io/aifuxi/fuxiaochen:sha-dc82b680e924a26c15659eb58a82ea4de8640bae`，digest 为 `sha256:890ee0a4b450d12c9cecbb3a82b4b5c9b41f490661663ba8d99ed1042ed42901`。服务器实际镜像为 linux/amd64，revision 标签与发布提交一致。
- 复用 `aliyun_vps`、Portainer 2.45.1 和 `fuxiaochen` Stack。保留 Git 管理、`refs/heads/master`、`compose.yaml` 与既有 Source；使用页面的 Save settings 和 Pull and redeploy（勾选 Re-pull image and redeploy）。
- Compose 仅运行 app，新外部卷为 `fuxiaochen-sqlite-20261021`，数据库固定 `/app/data/database.sqlite`，UID/GID 1000、文件 0600，`SQLITE_INITIALIZE=0`。沿用生产 HTTPS origin、Caddy 网络与 OSS 配置，新增独立 Better Auth 服务签名密钥，移除 Stack 中不再使用的 PostgreSQL 变量。没有重置管理员密码。
- 服务器 `/srv/fuxiaochen/compose.yaml`、`production.env`、`portainer.env` 已与实际 Stack 的新配置同步，原文件另行保留。没有发现项目的外部 cron 或 systemd 调度；后台自动备份开关仍为关闭，启动备份独立执行。

## 数据来源、备份与切换

- 2026-10-21 23:56:57，通过 SQLite backup API 从正在使用的本地 `data/site.sqlite` 取得包含 WAL 已提交内容的一致性快照，未直接复制在线主文件。该库此前已按用户要求导入线上旧 PostgreSQL 只读快照，见[数据导入记录](postgres-sqlite-transfer-verification.md#线上-postgresql-数据导入本地)。
- 本地发布快照、上传到服务器的独立文件及新卷初次复制文件 SHA-256 均为 `c727cc67addf0ef5a6e056fa7e62d61694e2041080cf036c449f11eb82a6afdd`。
- 发布前本地完整校验、服务器使用目标镜像的 `db:verify` 均通过；新卷部署前、部署后全部 23 张 SQLite 表的记录数与逐字段内容摘要均与本地发布快照一致。
- 业务数据为 27 篇文章、6 个分类、37 个标签、47 条文章标签关联、3 条更新日志、40 条媒体元数据、1 条友链和 1 个管理员。现行业务、原密码哈希及 OSS 引用保留；已退役的数据继续按导入策略归档，不恢复旧功能。
- 已保存旧 app/数据库容器配置、旧镜像资料、原 Portainer Stack 归档、原宿主配置及 PostgreSQL custom-format 备份。停旧 app 后再保存最终 PostgreSQL 备份；旧 `fuxiaochen-postgres`、`fuxiaochen-data` 卷及旧镜像均未删除。PostgreSQL 容器保留并停止，未启用 Prune services。
- 新 app 日志确认启动备份、迁移及完整校验通过，实际挂载新卷，健康为 healthy，重启次数为 0。随后经正式 Compose/entrypoint 再运行 `db:verify` 通过，没有绕过 flock 或删除锁文件。
- 启动备份标识为 `2026-10-21T16-08-37-392Z-58bdef09-6e4b-44f2-9ff6-39aa82e8f0ef`。备份完整性、外键与 manifest 摘要核对通过，全部 23 张表内容与本地发布快照一致；SQLite backup 产物文件头可能改变，不要求其整文件摘要与输入文件相同。

## 网络故障与恢复

前两次 Portainer Git 拉取因 GitHub 请求 `unexpected EOF`/超时失败，尚未创建新 app。首次失败后已恢复旧服务并确认 HTTPS `/login` 为 200；第三次更新前再次停旧 app、备份 PostgreSQL 并停止旧数据库。

诊断发现宿主机 curl 可访问 GitHub，但共享 Portainer 网络的容器 TCP/HTTPS 连接超时，宿主策略路由经 Mihomo。临时添加仅匹配 Portainer 源地址 `172.18.0.2/32` 和当时 GitHub 目标地址 `20.205.243.166/32` 的 main 路由后，同网络 HTTPS 请求为 200，随后原 Portainer Git 更新成功。部署后该临时规则已撤销并核对不存在；Source、TLS 校验、Mihomo 和 Portainer 基础配置均未修改。

首次发布时仅执行上述临时恢复，未扩大到永久基础设施调整。后续用户已单独授权彻底修复，2026-10-22 已通过固定 Portainer 出站桥、Mihomo 持久覆盖层和启动顺序完成，实际直接更新通过，见 [Portainer 出站核验](portainer-egress-verification.md)。原临时地址仅为历史诊断证据，不应用于后续部署。

## 验证状态

- **运行通过**：发布前 typecheck、lint、编辑器、SQLite、启动迁移、认证/Passkey、主题、媒体、SEO 和退役迁移测试；GitHub 镜像构建发布；上述数据摘要、完整性、外键、启动备份和容器健康检查。
- **运行通过**：生产 HTTPS 首页、文章列表、友链、关于、更新日志、登录、robots、sitemap 与一篇导入文章详情共 9 项 200；文章标题与生产 canonical 匹配；匿名后台文章/设置页面 307 到登录，后台文章 API 401；首页图片 2 项及 OSS 图片元数据样本 3 项 HEAD 200。
- **浏览器查看通过**：正式首页展示导入文章；Portainer Stack 显示发布提交和新 app healthy，旧 PostgreSQL exited。已保存无私有环境变量的结果截图。
- **仅响应源码核对**：首页包含已配置的 GA4／百度脚本；不代表第三方统计平台已收到事件。
- **未验证**：真实账号密码登录、退出、后台业务写入、生产上传，以及真实 Passkey 注册/撤销/恢复。原密码哈希已核对保留；本地私有开发密码与该线上账号不匹配，未尝试错误密码或重置线上密码。独立测试中的认证通过不代替真实账号验收。

## 证据与回退边界

本地私有证据位于 Git 忽略目录 `data/release-20261021-production/`；服务器私有资料位于 `/srv/fuxiaochen/releases/20261021-sqlite/`。配置、数据库、备份、摘要与核验报告均不提交 Git，仅本文与当前状态说明入库。页面截图为本地私有目录的 `portainer-deployed.png` 与 `production-home.png`。

线上数据按用户选定的本地快照切换，没有将停机前 PostgreSQL 的新增访问统计等再次合并到新库。当前 SQLite 接收新增业务写入后，回退前须冻结、备份并核对增量，不能直接切回旧 PostgreSQL。每日备份调度和完整业务/真实认证验收仍有各自明确范围，不因本次部署健康而视为完成；容器出站的永久修复由上述后续记录单独核验。

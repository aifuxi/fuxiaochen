# www HTTPS、主域名跳转与 Sitemap 核验

日期：2026-10-22（Asia/Shanghai）。用户授权清理 Google Search Console 中失效的旧 Sitemap，并配置 `www.fuxiaochen.com` 的 HTTPS 与主域名跳转。

## Search Console

- 已在 `https://fuxiaochen.com/` 资源中移除 `/server-sitemap-index.xml`、`/sitemap-0.xml` 的旧提交记录，两者此前已实测返回 404。
- 提交列表现在仅有 `/sitemap.xml`，状态为 **Success**，最近读取为 2026-10-22，已发现 **32** 个页面、0 个视频。
- 清理只涉及旧 Sitemap 提交记录，没有提交搜索结果移除请求。当前 robots.txt 继续声明主域名的 `/sitemap.xml`。

## Caddy 与出站配置

- `deploy/caddy/fuxiaochen.caddy` 与服务器 `/srv/infra/caddy/sites/fuxiaochen.caddy` 同步；主域名原反代继续使用 `fuxiaochen:3000`。
- `www` HTTPS 使用现有 `alidns_tls`，由 Caddy 自动管理公开证书。HTTP 与 HTTPS 独立声明，均以 308 直接跳转到 `https://fuxiaochen.com{uri}`，避免 HTTP 先升级到 www HTTPS 的额外跳转。
- Caddy `v2.10.2` 的完整候选配置、正式配置验证与热重载通过。后续为配置出站代理，使用原镜像和原证书卷重建了 `gateway-edge-1`；没有重建应用或修改数据库。
- 初次申请证书时，Caddy 访问 Let's Encrypt 的 ACME directory 超时：容器的出站未被既有 TUN 接管。最终使用显式 HTTPS 代理，不调整现有 Mihomo 的配置和订阅生成流程。

| 持久位置                                         | 最终配置                                                                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Docker `infra_caddy_egress`                      | 专用 bridge，接口 `br-caddy`，当前网关 `172.23.0.1`；仅连接 Caddy                                                                |
| `/srv/infra/compose.edge.yaml`                   | 原 `infra_edge` 的 `gw_priority: 1`，专用桥为 `-1`；`HTTPS_PROXY=http://172.23.0.1:17890`，`NO_PROXY` 排除回环、内部服务名与私网 |
| `/etc/systemd/system/caddy-egress-proxy.socket`  | 监听 `172.23.0.1:17890`，`BindToDevice=br-caddy`，随 multi-user.target 启动；等待 Docker 与 Mihomo                               |
| `/etc/systemd/system/caddy-egress-proxy.service` | 使用系统自带 `systemd-socket-proxyd` 转发到 `127.0.0.1:7890`；按服务器 systemd 252 使用 `Type=simple`                            |

直接把专用桥改为默认出站曾导致公网入口连接失败，已立即回退并验证主站、Portainer 恢复；该方案没有保留在最终配置中。最终方案保留原默认网关，Mihomo 生效配置与 TUN 覆盖层已逐字节核对恢复为任务前内容，不遗留临时路由。两个部署保护 timer 均已停止。

## 验证状态

- **运行通过**：公开 TLS 验证成功，协商 TLS 1.3；证书 SAN 包含 `www.fuxiaochen.com`，签发机构为 Let's Encrypt YE1，证书到期为 2027-01-19 23:36:48（Asia/Shanghai）。Caddy 日志确认 `certificate obtained successfully`。
- **运行通过**：HTTP、HTTPS 各 6 项，共 12 项跳转全部为 308；覆盖首页、文章、筛选参数、robots、Sitemap 及中文编码路径，Location 完整保留原路径和查询参数。
- **浏览器运行通过**：访问 www HTTPS 文章地址后进入主域名对应文章，保留 `utm_source=www-check`，页面正常展示。
- **运行通过**：主站首页、登录、文章、robots、Sitemap 与 Portainer HTTPS 均返回 200；Caddy 重建后为 healthy。
- **运行通过**：Caddy 网络命名空间经专用代理访问 ACME directory 返回 200；Portainer 网络命名空间不能访问该入口，监听确认绑定专用网卡。
- **运行通过**：systemd unit 校验、socket 开机启用、proxy service 重启后访问 ACME 成功；Caddy 已按最终 Compose 重建，网络与代理环境实际生效。
- **仅配置核对**：整机重启的启动排序；没有为验证重启服务器或 Docker daemon。
- **未到期验证**：未来自动续期；当前证书签发及续期所需 ACME 出站均已实测，不能将其解释为长期上游可用性保证。

## 证据与回退

服务器私有备份、候选配置、校验日志与最终 `rollback-final.py` 位于 `/srv/infra/www-redirect-20261022/`。最终脚本先核对部署文件摘要，拒绝覆盖后续修改，再恢复原 Caddy 站点和 Compose、重建原入口并停用本次 socket；保留证书卷、网络、DNS 和业务数据。目录中其他脚本属于中间方案，不作为最终回退入口。

本地私有证据位于 Git 忽略目录 `data/www-redirect-20261022/`，包含 Search Console 清理截图、浏览器跳转截图和 HTTP/TLS 检查结果；私有配置和运行证据不提交 Git。

依据：[Caddy redir](https://caddyserver.com/docs/caddyfile/directives/redir)、[自动 HTTPS](https://caddyserver.com/docs/automatic-https)、[Compose 网络优先级](https://docs.docker.com/reference/compose-file/services/#gw_priority)、[systemd socket](https://www.freedesktop.org/software/systemd/man/systemd.socket.html)。systemd 启动类型同时核对服务器已安装的 252 版本手册。

# Portainer GitHub 出站持久修复

日期：2026-10-22（Asia/Shanghai）。用户明确要求修复 `aliyun_vps` 上 Portainer 的 GitHub 出站网络，使后续更新不再手工添加临时路由。

## 原因与配置

原 Mihomo `tun.include-interface` 仅有 `lo`，Portainer 使用的 Docker 桥未纳入代理接管；原容器网络的 GitHub TCP/HTTPS 超时，而宿主机 curl 正常。此前仅临时按源/目标 IP 绕过规则完成部署。本次将 Portainer 的出站接口纳入本机持久 TUN 覆盖层，修复后不依赖容器地址和 GitHub DNS 解析地址。

| 持久位置                                                        | 实际配置与用途                                                                                                              |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Docker 外部网络 `infra_portainer_egress`                        | bridge 驱动，`com.docker.network.bridge.name=br-portainer`；默认发布绑定为 loopback，不新增对外监听端口                     |
| `/srv/infra/compose.portainer.yaml`                             | Portainer 连接 `egress` 和原 `portainer_proxy`；egress 引用上述外部网络，数据卷、镜像版本、命令、DNS 与原有绑定保持原值     |
| `/etc/mihomo/tun-overlay.yaml`                                  | `tun.include-interface` 为 `[lo, br-portainer]`，其余 TUN 选项保留                                                          |
| `/etc/mihomo/config.yaml`                                       | 与覆盖层同时更新并校验；通过 Mihomo 自身生成和维护路由规则，不保留手写 GitHub IP 路由                                       |
| `/etc/systemd/system/mihomo.service.d/20-portainer-egress.conf` | `Wants=docker.service`、`After=docker.service`，开机先由 Docker 恢复固定桥，再启动 Mihomo；不使用 Requires 绑定停止生命周期 |

固定桥名由 Docker 的公开 bridge 配置选项提供；`include-interface` 是 Mihomo 的接口范围设置。依据：[Docker bridge options](https://docs.docker.com/engine/network/drivers/bridge/#options)、[Mihomo TUN include-interface](https://wiki.metacubex.one/config/inbound/tun/#include-interface)。本次未启用 host network、未关闭 TLS 校验、未开放代理 LAN 端口，也没有修改应用或 PostgreSQL 数据。

## 执行与验证

1. 备份生效配置、TUN 覆盖层、Portainer Compose 和容器资料，生成回退脚本；修改前设置 5 分钟自动回退 timer，关键验证通过后已停止该 timer。
2. 创建固定桥名的外部网络，生成候选配置并以已安装 Mihomo `v1.19.31` 的 `-t` 通过校验。与订阅更新共用 `/etc/mihomo/.config-update.lock`，同时发布生效文件及持久覆盖层，再重载代理。
3. 新网络的独立探针访问 GitHub Git refs 返回 200；随后用既有 Compose 重建 Portainer，确认实际连接新网络和原反代网络。
4. 共享真实 Portainer 网络命名空间的探针访问 GitHub Git refs、`raw.githubusercontent.com` 均为 200。再实际重启 Mihomo，重复 Git refs 请求仍为 200，策略规则包含 `iif br-portainer`，原临时 priority 8998 规则不存在。
5. 用既有 `update-mihomo-subscription --prepare` 下载订阅并执行真实合并/校验流程；生成配置的 TUN 与当前生效配置完全一致，固定桥保留。该预演没有替换其他运行中的节点配置；既有更新 timer 和 Mihomo、Docker 均为 enabled。
6. systemd drop-in 通过 `systemd-analyze verify`，`systemctl show` 确认 Mihomo 的 After/Wants 包含 Docker。未重启整台服务器或 Docker daemon；开机排序为配置核对，服务级恢复已实际验证。
7. 复用用户 Portainer 页面，Git Source 的 Test connection 明确显示 `Connection successful`；随后在 `fuxiaochen` Stack 实际执行 Pull and redeploy，并勾选 Re-pull image and redeploy，全程没有临时改路由。

实际更新于 00:24 完成：Portainer 日志为 `Stack pull successful`、`Stack deployment successful`，Git reference 更新到 `6ede0341`。应用镜像仍固定为已发布的 `sha-dc82b680e924a26c15659eb58a82ea4de8640bae`；这两个提交之间仅有部署文档变化。Compose 重建 app 后由正式入口重新备份、校验并启动，原 SQLite 卷与已停止的 PostgreSQL 容器保留。

验证范围为服务重建/重启、订阅合并预演和一次真实 Stack 更新；不将这些结果解释为外部 GitHub 或代理上游永远不会故障。后续常规更新可直接使用既有页面，不需要维护按 IP 添加的手工规则。不要删除专用外部网络或修改固定桥名而不同步 TUN 覆盖层。

## 证据与回退

服务器私有备份、校验日志、候选配置及手动回退脚本位于 `/srv/infra/portainer-egress-20261022/`。回退脚本恢复原配置/Compose，移除本次 systemd drop-in，重载 Mihomo 并恢复原 Portainer 网络；不删除数据卷。它用于本次变更的事故回退，后续配置继续演进时应先复核差异，避免覆盖新的管理配置。

本地私有证据位于 Git 忽略目录 `data/portainer-egress-20261022/`，包含非敏感配置副本及 `source-connection-success.png`、`stack-update-success.png`。完整 Mihomo 配置含节点凭据，仅保留在服务器私有备份，不提交 Git。自动回退已撤销，未增加新的周期性维护任务。

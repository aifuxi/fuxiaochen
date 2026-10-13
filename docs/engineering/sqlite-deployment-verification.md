# SQLite 单镜像、启动保护与 Portainer 验收

日期：2026-10-13。完成 Docker 单镜像、单服务 Compose、Portainer 变量模板、启动前自动备份/迁移/校验与本地独立验证。未连接或修改线上数据库、既有开发库、真实 OSS 或既有 Portainer；没有推送、发布或生产部署。

## 已实现

- Dockerfile 仅 `runtime`：standalone Web + NFT/esbuild 追踪的维护 CLI，共用一个镜像。当前平台 better-sqlite3、Argon2、Sharp 与 tsx、SQL/journal 保留；Prisma、pg、PostgreSQL 客户端、Kit、测试与历史源码不进入运行镜像。构建阶段不接数据库。
- GitHub Actions 仅构建/发布同名应用镜像，移除 tools 镜像步骤；保留固定 Action、完整 SHA/revision、npm 下载与按平台隔离的 Next 缓存。
- Compose 仅 `app`，UID/GID 1000，固定 `/app/data/database.sqlite` 和持久备份目录，无宿主机端口，复用外部 Caddy 网络。数据库使用预先准备的新外部卷，缺卷直接拒绝；不再挂宿主机 PostgreSQL 初始化脚本。
- 每次 `serve` 取得实例与维护 flock → 已有库旧版本验证 → WAL 一致性备份 → IMMEDIATE 迁移/并发提交复核 → 完整校验 → 共享锁下再次校验 → exec Web。日常 CLI 共享维护锁；初始化/迁移独占，失败不启动 Web。
- 缺库默认拒绝；只在显式 `SQLITE_INITIALIZE=1` 时初始化新文件，不自动创建管理员。不接管空文件、未知历史、软链接或硬链接别名。
- 启动快照共用 `fuxiaochen-sqlite-backup` 格式，增加 purpose 和目标 hash；记录源合法迁移前缀。使用匹配版本 `db:restore` 恢复独立新文件；升级失败保留完整快照，不改写原业务数据。
- 当前部署与恢复说明见 [部署指南](../deployment.md)，旧双镜像 PostgreSQL 实现和记录已移除，需要时查阅 Git 历史中的匹配版本。线上最终迁移与切换另行授权执行。

## 运行通过

主机 Node.js 24.21.0 / darwin-arm64，Docker 本机 Linux arm64；容器 Node.js 24.21.0 bookworm-slim，Drizzle 0.45.4、better-sqlite3 13.0.3。amd64 通过本地仿真运行，未在生产服务器原生执行。

| 验证               | 结果与证据                                                                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 构建               | `runtime` 的 linux/arm64 和 linux/amd64 构建均通过，Next 编译/类型检查无需数据库；最终 node 用户实际调用 SQLite、Argon2、Sharp、tsx                                                                                                      |
| 启动基础层         | 11/11：缺库/独占初始化、WAL 数据、私有权限和摘要、DELETE 首次启动、合法旧前缀升级、真实恢复、损坏拒绝、失败回滚、并发提交拒绝、同步 hook、CLI 显式环境                                                                                   |
| SQLite 业务回归    | 39/39：基础层、内容、登录互动、统计及备份恢复；仅临时独立文件，OSS mock                                                                                                                                                                  |
| arm64 容器         | 14/14（父测试 + 13 子项），最终复核约 38.8 秒；node 用户、原生模块、健康、HTTP 登录/前后台读取、在线 CLI、恢复后首次启动、实例/维护锁、SIGTERM、重启备份、只读备份目录、坏 ledger/schema/FK 和失败迁移回滚                               |
| amd64 容器         | 同套件 14/14，约 69.5 秒，本地仿真；不是服务器原生运行证据                                                                                                                                                                               |
| 实际本地 Portainer | CE 2.39.5，6/6（父测试 + 5 子项）；全新本机管理容器/endpoint、随机外部卷/网络、string Stack API 创建仓库单服务配置、HTTP 200/healthy、同 Stack 更新触发重建、启动备份 1→2、校验通过、移除 Stack 后外部数据与备份保留                     |
| 防误用             | 同卷第二 Web、在线直接迁移、`npm run --silent db:migrate` 和 `npm --silent run db:startup` 均退出 5；原 Web 保持可用。显式远程 DOCKER_HOST 的负向输入在创建资源前被拒绝。失败启动日志没有 Web Ready，迁移事务/ledger回滚，启动前快照保留 |
| 静态检查           | typecheck、新文件定向 lint/格式、`sh -n`、Compose `config --quiet` 通过；全局 oxlint 无错误，仅历史 PostgreSQL importer 的 2 条既有断言警告                                                                                              |

测试只使用随机创建的专用 SQLite 卷、容器和网络，退出后精确删除自己的对象和临时目录；按测试 label 复查均无残留。既有 Docker 资源、数据卷和环境文件未修改。本地两个验证镜像保留供复查，没有发布到 registry。

### 镜像测量

以下为当前实际本地镜像的 **解压层大小合计**，通过 Docker Engine history 原始 Size 整数求和；使用十进制 MB，不使用 `docker images` 的总存储显示冒充压缩下载大小：

| 平台        |                    解压层大小 |
| ----------- | ----------------------------: |
| linux/arm64 | 375,922,688 字节，约 375.9 MB |
| linux/amd64 | 359,702,528 字节，约 359.7 MB |

维护依赖只追踪运行所需包，未复制旧 tools 的完整生产 node_modules。此处没有测量 GHCR 下载流量、冷构建耗时、BuildKit 总占用或线上内存，不把缓存/旧镜像和当前运行层混为同一指标。

## 修复后回归

- 首次容器演练发现 DELETE→WAL 的自有日志模式变化触发 `data_version` 误报。改为先验证旧库、规范 WAL，再取得备份并发检测基准；新增 DELETE 库单次启动与真实恢复副本首次启动用例，两个平台均通过，独立写入仍能阻止升级。
- 审查发现按 npm 精确字符串分类会漏过 `--silent`。改为识别维护命令 token，新增两种正常 npm flags 的真实在线拒绝用例，两平台退出 5。
- 首版启动 manifest 与 `db:restore` 不兼容，改为现有备份格式加 purpose；当前版快照实际恢复、会话撤销、自动备份关闭及再次启动通过。
- 测试修正 Next 设置进程 comm 名称、Docker 重启后的随机端口重分配与只读目录权限可被服务账号修复的假设；PID 1 用真实 `/proc/1/exe`、端口重读、备份失败用真正只读挂载验证，没有削弱生产保护。

## 未验证与范围边界

- 本地 Portainer 使用与 Web Editor 对应的 Compose 文本/string Stack API；Git Stack 因未推送新配置而未实际演练。真实服务器 Portainer、Caddy、registry 鉴权/拉取、生产 DNS/OSS 与实际数据尚未操作。
- GitHub 托管 runner 的发布、缓存上传恢复尚未运行；单镜像配置和本地构建通过不代表远程镜像已经存在。
- 本次使用合成数据和私有新卷，未做大数据量启动/备份耗时、容量与内存验证。完整扫描和每次重启备份会消耗时间/磁盘，当前无自动保留删除策略；正式切换前据真实规模检查。
- 初始化新站点不自动创建管理员；既有站点必须先完成最终 PostgreSQL 导出/SQLite 导入和字段核对，不能启用初始化来跳过迁移。
- 生产使用单实例、本机磁盘与明确文件路径；外部调度继续保留，后续切换时更新为同 app 镜像。锁为受控入口的协作机制，不能替代停止绕过入口的其他数据库写入者。
- 旧 PostgreSQL/SQLite 卷、镜像、配置、备份和 OSS 均保留。未执行线上最终迁移、调度/Caddy 切换、推送或部署。

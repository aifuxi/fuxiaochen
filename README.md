# 付小晨

个人博客与内容管理后台，支持文章发布、分类与标签、媒体上传、友情链接和更新日志。后台提供通知及数据库备份，支持配置 GA4／百度统计。

## 当前实施状态

2026-10-13 已完成 SQLite + Drizzle + better-sqlite3 适配、PostgreSQL → SQLite 离线迁移工具，以及单镜像/Portainer 配置和启动前备份、迁移、校验。全部只在本地独立数据库与容器验证，线上尚未切换，未推送或部署。阶段记录见 [SQLite 适配](docs/engineering/sqlite-adaptation-verification.md)、[数据迁移](docs/engineering/postgres-sqlite-transfer-verification.md) 和 [单镜像验收](docs/engineering/sqlite-deployment-verification.md)。

2026-10-14 已移除评论、本地访问统计、访客日志与全局搜索，保留 GA4／百度配置。数据清理通过新增迁移实施，常用库与线上库尚未执行升级；验证见[功能移除验收](docs/engineering/feature-removal-verification.md)。

## 运行要求

- Node.js 24 或更高版本，使用 npm 安装依赖。
- Next.js、React、TypeScript、Tailwind CSS 与 Base UI；后台使用 Hono、Zod、Drizzle ORM 和 better-sqlite3。
- SQLite 使用本机磁盘文件，媒体文件仍位于阿里云 OSS。本地应用不需要 Docker 数据库或 PostgreSQL 客户端。
- 已锁定 Drizzle ORM `0.45.4`、drizzle-kit `0.31.11`、better-sqlite3 `13.0.3`。生成迁移的 drizzle-kit 和历史 PostgreSQL 工具仅在 devDependencies。

## 本地启动

安装依赖；首次配置时复制模板，已有 `.env` 时只补充缺失项，不覆盖凭据：

```sh
npm ci
# 仅首次且 .env 不存在时复制，已有文件手工补充 DATABASE_PATH 和 BETTER_AUTH_SECRET。
test -f .env || cp .env.example .env
# 显式创建独立的新 SQLite 文件；不要使用历史数据库文件。
mkdir -p data
npm run db:init
npm run admin:init
npm run dev
```

基础配置：

```dotenv
# 文件必须先通过 db:init 初始化；普通启动不会自动生成空站点。
DATABASE_PATH=./data/site.sqlite
APP_ORIGIN=http://localhost:3000
# 独立随机会话签名密钥，至少 32 个字符；生成后填入私有配置，不提交 Git。
BETTER_AUTH_SECRET=
```

`APP_ORIGIN` 与浏览器访问地址一致，不带路径或尾斜杠。命令行和应用共用根目录 `.env`；当前运行代码忽略历史 PostgreSQL `DATABASE_URL`，但已有凭据和旧数据不自动删除。`admin:init` 交互式创建管理员；已有账号时跳过。OSS 配置见 [媒体存储配置](docs/media-storage.md)。

启动前生成独立随机密钥，将输出填入私有 `.env` 的 `BETTER_AUTH_SECRET`；缺失时登录不可用。认证使用 Better Auth 及官方 Passkey 插件，公开注册关闭。先用密码登录，在后台「管理账户」添加通行密钥；密码始终作为备用。生产使用 HTTPS，Passkey 绑定 `APP_ORIGIN` 的主机名，本地使用 `http://localhost:3000`。

```sh
# 只生成新密钥，不改配置；保存到私有环境，轮换后需要重新登录。
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

日常运行 `npm run dev`；拉取已提交的新迁移后，先停止应用和调度，备份后执行 `npm run db:migrate`。容器的 `serve` 自动备份、迁移并校验，本地 dev 不自动运行此流程。编辑 schema 后运行 `db:generate`，审查 SQL 再提交；构建不会自动生成或执行迁移，也不连接数据库。

默认访问：博客 [localhost:3000](http://localhost:3000)、后台 [admin](http://localhost:3000/admin)、[登录](http://localhost:3000/login)；`/design-spec` 仅开发环境开放。

## 常用命令

| 命令                                                                                                                | 用途                                           |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `npm run dev`                                                                                                       | 启动开发服务器                                 |
| `npm run build`                                                                                                     | 生成 standalone 生产构建，不连接数据库         |
| `npm run db:init`                                                                                                   | 独占创建新 SQLite 文件并迁移；已有文件拒绝覆盖 |
| `npm run db:generate -- --name describe-change`                                                                     | 根据 schema 离线生成 SQL 迁移                  |
| `npm run db:migrate`                                                                                                | 对显式存在的数据库应用迁移并校验               |
| `npm run db:verify`                                                                                                 | 校验迁移 hash、结构、完整性和外键              |
| `npm run db:backup` / `npm run db:restore -- <目录>`                                                                | SQLite 在线备份／恢复到独立新文件              |
| `npm run admin:reset-password`                                                                                      | 重置密码并撤销该账号会话                       |
| `npm run test:sqlite`                                                                                               | 临时 SQLite 文件中的基础层与业务回归           |
| `npm run test:sqlite-startup`                                                                                       | 临时独立库的启动备份、升级与回滚验证           |
| `TEST_SQLITE_IMAGE=<本地tag> npm run test:sqlite-container`                                                         | 单镜像独立卷、Web、CLI、锁与失败保护验证       |
| `npm run db:export-postgres -- --directory <新目录> --report <新报告>`                                              | 显式只读源连接，导出 PostgreSQL 22 表归档      |
| `npm run db:import-postgres -- --directory <归档> --target <新文件> --dry-run\|--apply\|--verify --report <新报告>` | 离线预检、导入或核对；拒绝覆盖已有库           |
| `npm run test:postgres-transfer`                                                                                    | 显式专用测试实例中的迁移演练；不使用业务数据库 |
| `npm run test:seo:integration`                                                                                      | 临时源码副本与 SQLite 的真实 HTTP 回归         |
| `npm run typecheck` / `npm run lint` / `npm run format:check`                                                       | 类型、源码、格式检查                           |

`test:sqlite` 不使用开发库，OSS 访问使用 mock；测试结束删除自己的临时文件。新迁移工具不加载 `.env`，只接受 `MIGRATION_SOURCE_DATABASE_URL`；`test:postgres-transfer` 只接受专用新实例的 `TEST_POSTGRES_ADMIN_URL`，详细操作见 [数据库维护](docs/maintenance.md)。历史 PostgreSQL 源码与回归不参与当前编译和验收，恢复旧环境应使用匹配旧提交。生产备份目录与数据文件不得提交 Git。

## 部署与维护

Dockerfile 的 `runtime` 为唯一应用与运维镜像，Compose 只有 `app`，使用已准备的独立外部 SQLite 数据卷；不需要 PostgreSQL 初始化脚本、migrate 或 tools 服务。每次容器启动已有库先备份再迁移和校验，默认拒绝缺失数据库；全新站点仅明确允许 `SQLITE_INITIALIZE=1` 时建库。正式切换仍需准备最终迁移数据、备份和线上授权，不能直接部署到旧卷。排期与每日自动备份继续使用外部调度，CLI 改用相同 app 镜像；备份不包含 OSS 文件。

- [部署、调度与备份恢复](docs/deployment.md)
- [OSS 配置与临时上传清理](docs/media-storage.md)
- [数据库维护](docs/maintenance.md)

## 项目文档

- [共享设计规范、参考基线与待同步清单](DESIGN.md)
- [前台、登录与展示页场景](docs/design/frontend.md)
- [后台工作区与页面场景](docs/design/admin.md)
- [产品行为、字段与统计口径](docs/product/behavior.md)
- [历史验收摘要与未验证范围](docs/engineering/verification-history.md)
- [开发协作约定](AGENTS.md)

2026-10-05 规范重构将共享设计、页面布局、产品行为与工程机制分开维护。Inter、前台导航、原生指针及首页与展示页构图是已批准但待实施的目标，当前页面差异见共享设计规范；文档更新不代表视觉实现或运行验收已完成。

## 许可证

[MIT](LICENSE)

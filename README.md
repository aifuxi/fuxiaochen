# 付小晨

个人博客与内容管理后台，支持文章发布、分类与标签、评论审核、媒体上传、友情链接和更新日志。后台提供访问统计、内容检索、通知及数据库备份。

## 当前实施状态

2026-10-13 已将应用数据库基础层与业务查询改为 SQLite + Drizzle + better-sqlite3，并使用独立临时库验证。线上数据库、数据迁移、生产 Compose 和单镜像部署尚未切换；不要使用现有 PostgreSQL Compose 部署当前源码。阶段验证见 [SQLite 适配记录](docs/engineering/sqlite-adaptation-verification.md)。

## 运行要求

- Node.js 24 或更高版本，使用 npm 安装依赖。
- Next.js、React、TypeScript、Tailwind CSS 与 Base UI；后台使用 Hono、Zod、Drizzle ORM 和 better-sqlite3。
- SQLite 使用本机磁盘文件，媒体文件仍位于阿里云 OSS。本地应用不需要 Docker 数据库或 PostgreSQL 客户端。
- 已锁定 Drizzle ORM `0.45.4`、drizzle-kit `0.31.11`、better-sqlite3 `13.0.3`。生成迁移的 drizzle-kit 和历史 PostgreSQL 工具仅在 devDependencies。

## 本地启动

安装依赖；首次配置时复制模板，已有 `.env` 时只补充缺失项，不覆盖凭据：

```sh
npm ci
# 仅首次且 .env 不存在时复制，已有文件手工补充 DATABASE_PATH。
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
```

`APP_ORIGIN` 与浏览器访问地址一致，不带路径或尾斜杠。命令行和应用共用根目录 `.env`；当前运行代码忽略历史 PostgreSQL `DATABASE_URL`，但已有凭据和旧数据不自动删除。`admin:init` 交互式创建管理员；已有账号时跳过。OSS 配置见 [媒体存储配置](docs/media-storage.md)。

日常运行 `npm run dev`；拉取已提交的新迁移后，先停止应用和调度，执行 `npm run db:migrate`。当前阶段未实现启动前自动备份和迁移。编辑 schema 后运行 `db:generate`，审查 SQL 再提交；构建不会自动生成或执行迁移，也不连接数据库。

默认访问：博客 [localhost:3000](http://localhost:3000)、后台 [admin](http://localhost:3000/admin)、[登录](http://localhost:3000/login)；`/design-spec` 仅开发环境开放。

## 常用命令

| 命令                                                          | 用途                                           |
| ------------------------------------------------------------- | ---------------------------------------------- |
| `npm run dev`                                                 | 启动开发服务器                                 |
| `npm run build`                                               | 生成 standalone 生产构建，不连接数据库         |
| `npm run db:init`                                             | 独占创建新 SQLite 文件并迁移；已有文件拒绝覆盖 |
| `npm run db:generate -- --name describe-change`               | 根据 schema 离线生成 SQL 迁移                  |
| `npm run db:migrate`                                          | 对显式存在的数据库应用迁移并校验               |
| `npm run db:verify`                                           | 校验迁移 hash、结构、完整性和外键              |
| `npm run db:backup` / `npm run db:restore -- <目录>`          | SQLite 在线备份／恢复到独立新文件              |
| `npm run admin:reset-password`                                | 重置密码并撤销该账号会话                       |
| `npm run test:sqlite`                                         | 临时 SQLite 文件中的基础层与业务回归           |
| `npm run test:seo:integration`                                | 临时源码副本与 SQLite 的真实 HTTP 回归         |
| `npm run typecheck` / `npm run lint` / `npm run format:check` | 类型、源码、格式检查                           |

`test:sqlite` 不使用开发库，OSS 访问使用 mock；测试结束删除自己的临时文件。历史 PostgreSQL 源码与回归不参与当前编译和验收，恢复旧环境应使用匹配旧提交。生产备份目录与数据文件不得提交 Git。

## 部署与维护

目标是单实例 Node.js 或单应用 Docker 镜像部署，SQLite 数据目录与备份必须持久化，生产使用 HTTPS。当前生产配置仍为历史 PostgreSQL 方案，待数据迁移与部署阶段另行实施。排期发布和自动备份暂保留外部调度；数据库备份不包含 OSS 文件。

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

# 付小晨

个人博客与内容管理后台，支持文章发布、分类与标签、评论审核、媒体上传、友情链接和更新日志。后台提供访问统计、内容检索、通知及数据库备份。

## 运行要求

- Node.js 24 或更高版本，使用 npm 安装依赖。
- Next.js、React、TypeScript、Tailwind CSS 与 Base UI；后台使用 Hono、Zod 和 Prisma 8 + PostgreSQL。
- 本地使用 Docker 运行 PostgreSQL，Next.js 在电脑上运行；需要 Docker Compose v2 和 PostgreSQL 18 客户端工具（`pg_dump`、`pg_restore`、`psql`）。媒体文件存储在阿里云 OSS。Prisma 8 当前使用 RC 版本，依赖版本以 `package-lock.json` 为准。

## 本地启动

安装依赖；首次配置时复制环境模板，已有 `.env` 时只补充缺失项：

```sh
npm ci
cp .env.example .env
```

启动前检查 `.env` 中的基础配置：

```dotenv
POSTGRES_ADMIN_PASSWORD=local_admin_change_me
POSTGRES_APP_PASSWORD=local_app_change_me
DATABASE_URL=postgresql://fuxiaochen:local_app_change_me@127.0.0.1:15433/fuxiaochen_dev
APP_ORIGIN=http://localhost:3000
```

`APP_ORIGIN` 必须与浏览器访问地址一致，不带路径或尾斜杠。命令行和应用共用项目根目录的 `.env`，不要只配置 `.env.local`。媒体上传另需填写 OSS 配置，见 [媒体存储配置](docs/media-storage.md)；未配置时可使用其他功能。

初始化数据库与管理员后启动：

```sh
npm run db:up
npm run db:generate
npm run db:migrate
npm run admin:init
npm run dev
```

`admin:init` 交互式创建管理员；已有账号时跳过此步。项目没有公开注册入口。本次从空 PostgreSQL 数据库开始，不导入旧 SQLite 数据；已有 SQLite 文件和卷保留，不会自动删除。

`db:up` 只启动/复用数据库容器并等待健康检查，不启动 Next.js。映射固定为 `127.0.0.1:15433:5432`，本地数据库工具连接 `127.0.0.1:15433`。开发数据卷为 `fuxiaochen-postgres-dev`，容器重建不会清空数据；不要使用 `down -v`。

日常执行 `npm run db:up`、`npm run dev`；拉取新迁移后先执行 `npm run db:migrate`。`dev` 不自动启动 Docker 或应用迁移。修改密码环境变量不会修改已有卷中的角色密码，需通过数据库管理账号显式修改，再同步连接 URL。

默认访问地址：

- 博客：<http://localhost:3000>
- 后台：<http://localhost:3000/admin>
- 登录：<http://localhost:3000/login>
- 设计组件展示：<http://localhost:3000/design-spec>，仅开发环境开放。

## 常用命令

| 命令                           | 用途                             |
| ------------------------------ | -------------------------------- |
| `npm run db:up`                | 启动或复用本地 PostgreSQL        |
| `npm run dev`                  | 启动开发服务器                   |
| `npm run build`                | 生成生产构建                     |
| `npm start`                    | 启动已构建的生产服务             |
| `npm run typecheck`            | 类型检查                         |
| `npm run lint`                 | 代码检查                         |
| `npm run format:check`         | 格式检查                         |
| `npm run db:migrate`           | 应用迁移并校验数据库结构         |
| `npm run admin:reset-password` | 重置管理员密码并撤销全部登录会话 |

开发启动和构建前会自动生成数据库 contract，构建无需在线数据库。生产启动前需完成构建。

`npm run test:postgres` 使用本地 Docker 数据库的管理账号创建独立临时数据库，验证查询、并发、备份与恢复，并在结束时删除测试库。不会使用开发库做业务测试；需要先运行 `db:up`，配置管理密码及安装 PostgreSQL 18 客户端工具。

## 部署与维护

支持单实例 Node.js 或 Docker 部署。PostgreSQL 数据卷与备份目录必须持久化，生产访问使用 HTTPS。排期发布和自动备份需要外部调度；数据库备份不包含 OSS 文件。

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

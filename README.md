# fuxiaochen

个人博客与内容管理后台，支持文章发布、分类与标签、评论审核、媒体上传、友情链接和更新日志。后台提供访问统计、内容检索、通知及数据库备份。

## 运行要求

- Node.js 24 或更高版本，使用 npm 安装依赖。
- Next.js、React、TypeScript、Tailwind CSS 与 Base UI；后台使用 Hono、Zod 和 Prisma 8 + SQLite。
- 数据库保存在本地磁盘，媒体文件存储在阿里云 OSS。Prisma 8 当前使用 RC 版本，依赖版本以 `package-lock.json` 为准。

## 本地启动

安装依赖；首次配置时复制环境模板，已有 `.env` 时只补充缺失项：

```sh
npm ci
cp .env.example .env
```

启动前检查 `.env` 中的基础配置：

```dotenv
DATABASE_PATH=./data/admin.sqlite
APP_ORIGIN=http://localhost:3000
```

`APP_ORIGIN` 必须与浏览器访问地址一致，不带路径或尾斜杠。命令行和应用共用项目根目录的 `.env`，不要只配置 `.env.local`。媒体上传另需填写 OSS 配置，见 [媒体存储配置](docs/media-storage.md)；未配置时可使用其他功能。

初始化数据库与管理员后启动：

```sh
npm run db:generate
npm run db:migrate
npm run admin:init
npm run dev
```

`admin:init` 交互式创建管理员；已有账号时跳过此步。项目没有公开注册入口。接管旧数据库前先阅读 [数据库维护与旧数据迁移](docs/maintenance.md)。

默认访问地址：

- 博客：<http://localhost:3000>
- 后台：<http://localhost:3000/admin>
- 登录：<http://localhost:3000/login>
- 设计组件展示：<http://localhost:3000/design-spec>，仅开发环境开放。

## 常用命令

| 命令                           | 用途                             |
| ------------------------------ | -------------------------------- |
| `npm run dev`                  | 启动开发服务器                   |
| `npm run build`                | 生成生产构建                     |
| `npm start`                    | 启动已构建的生产服务             |
| `npm run typecheck`            | 类型检查                         |
| `npm run lint`                 | 代码检查                         |
| `npm run format:check`         | 格式检查                         |
| `npm run db:migrate`           | 应用迁移并校验数据库结构         |
| `npm run admin:reset-password` | 重置管理员密码并撤销全部登录会话 |

开发启动和构建前会自动生成数据库 contract。生产启动前需完成构建。

## 部署与维护

支持单实例 Node.js 或 Docker 部署。数据库目录必须持久化，生产访问使用 HTTPS。排期发布和自动备份需要外部调度；数据库备份不包含 OSS 文件。

- [部署、调度与备份恢复](docs/deployment.md)
- [OSS 配置与临时上传清理](docs/media-storage.md)
- [数据库维护与旧数据迁移](docs/maintenance.md)

## 项目文档

- [视觉与交互规范](DESIGN.md)
- [历史验收摘要与未验证范围](docs/engineering/verification-history.md)
- [开发协作约定](AGENTS.md)

## 许可证

[MIT](LICENSE)

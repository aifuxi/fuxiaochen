
# fuxiaochen.com

这是一个使用 Next.js 构建的现代化、高性能的个人博客项目。

## ✨ 功能特性

- **SSR 支持**: 基于 Next.js 15 和 React 19 构建，提供出色的 SEO 和性能。
- **类型安全**: 全量使用 TypeScript 编写，保证代码的健壮性。
- **现代化 UI**: 使用 Tailwind CSS 和 shadcn/ui 构建，提供美观、一致的 UI 体验。
- **数据库**: 使用 Prisma 和 SQLite 进行数据持久化，简化数据库操作。
- **用户认证**: 集成 `better-auth`，支持邮箱/密码和 GitHub 登录。
- **Markdown 编辑器**: 内置 Bytemd 编辑器，支持丰富的 Markdown 功能。
- **主题切换**: 支持明暗主题切换。
- **SEO 优化**: 自动生成 Sitemap，提升搜索引擎排名。

## 🚀 快速开始

### 环境要求

- Node.js >= 20
- pnpm
- Git

### 项目安装

1.  **克隆仓库**

    ```bash
    git clone https://github.com/aifuxi/fuxiaochen.git
    cd fuxiaochen
    ```

2.  **安装依赖**

    ```bash
    pnpm install
    ```

3.  **配置环境变量**

    复制 `.env.example` 文件为 `.env`，并根据需要修改其中的配置。

    ```bash
    cp .env.example .env
    ```

    - `DATABASE_URL`: 数据库连接字符串（默认为 `file:./prisma/db.sqlite`）。
    - `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`: 用于 GitHub 登录的凭证。

4.  **数据库初始化**

    ```bash
    pnpm db:push
    ```

5.  **启动项目**

    ```bash
    pnpm dev
    ```

## 🛠️ 可用脚本

| 命令 | 描述 |
| :--- | :--- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 检查代码风格 |
| `pnpm format` | 格式化代码 |
| `pnpm db:push` | 同步 Prisma schema 到数据库 |
| `pnpm db:gen` | 生成 Prisma Client |
| `pnpm db:studio` | 启动 Prisma Studio |

## 🎨 自定义

你可以在 `constants/info.ts` 文件中修改网站的元数据，如站点名称、作者等。

## 🤝 贡献

欢迎通过 [Issues](https://github.com/aifuxi/fuxiaochen/issues) 或 Pull Requests 为项目做出贡献。

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证发布。

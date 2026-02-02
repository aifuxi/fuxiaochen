# fuxiaochen.com - 赛博朋克风格个人博客系统

基于 Next.js 16.1 (App Router) 构建的高性能个人博客/门户系统，采用沉浸式赛博朋克设计风格。

## 功能特性

### 前台功能

- **博客展示**：文章列表、分类浏览、标签筛选
- **关于页面**：个人介绍
- **更新日志**：版本历史记录
- **封面生成器**：自动化图片生成
- **SEO 优化**：Sitemap、OpenGraph 支持

### 后台管理

- **仪表盘**：数据概览
- **博客管理**：CRUD 操作、Markdown 编辑
- **分类管理**：分类创建与维护
- **标签管理**：标签管理
- **用户管理**：用户信息维护
- **图片上传**：OSS 云存储集成

### 技术亮点

- **Server Actions**：接口优先设计模式
- **Store 架构**：Interface-First 数据流
- **类型安全**：TypeScript + Zod 验证
- **现代 UI**：Radix UI + Tailwind CSS 4

## 技术栈

| 类别     | 技术                                   |
| -------- | -------------------------------------- |
| 框架     | Next.js 16.1.1 (React 19)              |
| 数据库   | MySQL/MariaDB (Prisma ORM)             |
| 样式     | Tailwind CSS 4, Radix UI, Lucide React |
| 编辑器   | ByteMD (Markdown)                      |
| 状态管理 | ahooks, SWR                            |
| 表单     | React Hook Form + Zod                  |
| 认证     | Better Auth                            |
| 包管理器 | pnpm                                   |
| 部署     | PM2, Docker                            |

## 快速开始

### 环境要求

- Node.js >= 20
- MySQL/MariaDB 8.0+
- pnpm 9.x

### 安装依赖

```bash
pnpm install
```

### 环境配置

创建 `.env` 文件：

```env
# 数据库
DATABASE_URL="mysql://user:password@localhost:3306/fuxiaochen"

# Auth
AUTH_SECRET="your-auth-secret"

# OSS (可选)
OSS_ACCESS_KEY_ID="your-access-key"
OSS_ACCESS_KEY_SECRET="your-secret"
OSS_BUCKET="your-bucket"
OSS_REGION="oss-cn-hangzhou"
```

### 数据库初始化

```bash
# 生成 Prisma Client
pnpm db:gen

# 运行迁移
pnpm db:dev

# 填充种子数据
pnpm db:seed
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 开发命令

| 命令             | 说明                |
| ---------------- | ------------------- |
| `pnpm dev`       | 启动开发服务器      |
| `pnpm build`     | 构建生产版本        |
| `pnpm start`     | 启动生产服务器      |
| `pnpm lint:fix`  | ESLint 检查并修复   |
| `pnpm format`    | Prettier 格式化代码 |
| `pnpm db:dev`    | Prisma 迁移 (开发)  |
| `pnpm db:gen`    | 生成 Prisma Client  |
| `pnpm db:seed`   | 填充种子数据        |
| `pnpm db:studio` | Prisma Studio       |
| `pnpm pm2:start` | PM2 启动应用        |

## 项目结构

```
fuxiaochen/
├── app/                    # Next.js App Router
│   ├── (portal)/           # 前台页面组
│   │   ├── blog/           # 博客相关
│   │   ├── about/          # 关于页面
│   │   ├── changelog/      # 更新日志
│   │   └── cover-generator/# 封面生成器
│   ├── (admin)/            # 后台管理组
│   │   ├── admin/          # 管理功能
│   │   │   ├── blogs/      # 博客管理
│   │   │   ├── categories/ # 分类管理
│   │   │   ├── tags/       # 标签管理
│   │   │   └── users/      # 用户管理
│   ├── actions/            # Server Actions
│   └── api/                # API 路由
├── components/             # 组件库
│   ├── ui/                 # 基础 UI 组件
│   ├── blog/               # 博客业务组件
│   └── cyberpunk/          # 赛博朋克主题组件
├── lib/                    # 核心工具库
├── stores/                 # Store 实现 (Interface-First)
│   └── */                  # 各模块 Store
│       ├── interface.ts    # 接口定义
│       └── store.ts        # 实现代码
├── types/                  # TypeScript 类型定义
├── prisma/                 # 数据库 Schema
│   ├── schema.prisma       # 数据模型
│   └── migrations/         # 迁移文件
├── generated/prisma/       # Prisma Client 生成目录
└── styles/                 # 全局样式
```

## 架构设计

### 数据流架构

```
Client Component
    ↓
Server Action ('use server')
    ↓
Store Interface (stores/*/interface.ts)
    ↓
Store Implementation (stores/*/store.ts)
    ↓
Prisma ORM
    ↓
MySQL/MariaDB
```

### Server Action 设计规范

项目采用 **Interface-First** 模式：

1. **Interface** (`stores/*/interface.ts`)：定义 Store 接口
2. **Implementation** (`stores/*/store.ts`)：实现业务逻辑
3. **Action** (`app/actions/*.ts`)：统一错误处理、缓存更新

## 代码规范

### 命名约定

| 类型      | 规则           | 示例            |
| --------- | -------------- | --------------- |
| 文件      | Kebab Case     | `blog-list.tsx` |
| 组件      | Pascal Case    | `NeonHeader`    |
| 变量/函数 | lowerCamelCase | `fetchBlogData` |
| 类型      | Pascal Case    | `IBlogStore`    |

### 样式规范

项目采用赛博朋克设计风格：

- **主色调**：Neon Cyan (`#00ffff`)
- **次色调**：Neon Purple (`#7b61ff`)
- **背景色**：Cyber Black (`#050510`)
- **字体**：
  - 标题：Orbitron
  - 正文：Exo 2

## 部署

### Docker 部署

```bash
docker build -t fuxiaochen .
docker run -p 3000:3000 fuxiaochen
```

### PM2 部署

```bash
pnpm build
pnpm pm2:start
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### Commit 规范

遵循 Conventional Commits：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

## Star History

<a href="https://www.star-history.com/#aifuxi/fuxiaochen&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=aifuxi/fuxiaochen&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=aifuxi/fuxiaochen&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=aifuxi/fuxiaochen&type=date&legend=top-left" />
 </picture>
</a>

## 许可证

MIT License

## 作者

[fuxiaochen](https://github.com/aifuxi)

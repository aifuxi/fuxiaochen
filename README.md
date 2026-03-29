# fuxiaochen

基于 Next.js 16.1 (App Router) 构建的高性能个人博客，采用 Chen Serif 设计系统（Variant-driven Design 方案）。

**本项目是一个个人学习技术和探索的项目，随时可能有 breaking change。不建议！！！不建议 ！！！不建议 ！！！用于生产环境，欢迎一起互相交流学习～**

## 功能特性

### 前台功能

- **首页**：大胆风格设计，液态渐变背景
- **博客展示**：文章列表、分类浏览、标签筛选
- **关于页面**：个人介绍、技能展示
- **更新日志**：时间线风格版本历史
- **登录页面**：液态风格设计
- **SEO 优化**：Sitemap、OpenGraph 支持

### 后台管理

- **仪表盘**：数据概览
- **博客管理**：CRUD 操作、Markdown 编辑（ByteMD）
- **分类管理**：分类创建与维护
- **标签管理**：标签管理
- **用户管理**：用户信息维护、角色分配
- **更新日志**：版本记录管理
- **图片上传**：OSS 云存储集成
- **UI 预览**：组件预览页面

### 技术亮点

- **Chen Serif 设计系统**：Variant-driven Design 变体驱动方案
- **Server Actions**：接口优先设计模式
- **Store 架构**：Interface-First 数据流
- **权限管理**：基于角色的访问控制
- **类型安全**：TypeScript + Zod 验证
- **现代 UI**：Radix UI + Tailwind CSS 4

## 技术栈

| 类别     | 技术                                   |
| -------- | -------------------------------------- |
| 框架     | Next.js 16.1.1 (React 19.2.3)          |
| 数据库   | MySQL/MariaDB (Prisma ORM)             |
| 样式     | Tailwind CSS 4, Radix UI, Lucide React |
| 编辑器   | ByteMD (Markdown)                      |
| 状态管理 | SWR                                    |
| 表单     | React Hook Form + Zod                  |
| 认证     | Better Auth（GitHub OAuth + 邮箱密码） |
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

参考 `.env.example` 文件配置环境变量。

```bash
cp .env.example .env
```

```shell
# Database 必须配置
DATABASE_HOST="localhost"
DATABASE_PORT="3306"
DATABASE_USER="root"
DATABASE_PASSWORD="your_password"
DATABASE_NAME="fuxiaochen_dev"
DATABASE_URL="mysql://root:your_password@localhost:3306/fuxiaochen_dev"

# Better Auth 必须配置
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
BETTER_AUTH_SECRET="your_better_auth_secret"
BETTER_AUTH_URL="http://localhost:3000"
```

### 数据库初始化

```bash
# 1. 生成 Prisma Client
pnpm db:gen

# 2. 推送 schema 变更到数据库
pnpm db:push

# 3. 填充种子数据(可选)
pnpm db:seed
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 开发命令

| 命令             | 说明                  |
| ---------------- | --------------------- |
| `pnpm dev`       | 启动开发服务器        |
| `pnpm build`     | 构建生产版本          |
| `pnpm start`     | 启动生产服务器        |
| `pnpm lint`      | ESLint 检查           |
| `pnpm lint:fix`  | ESLint 检查并自动修复 |
| `pnpm format`    | Prettier 格式化代码   |
| `pnpm db:gen`    | 生成 Prisma Client    |
| `pnpm db:push`   | 推送 schema 变更      |
| `pnpm db:studio` | 打开 Prisma Studio    |
| `pnpm db:seed`   | 填充种子数据          |
| `pnpm pm2:start` | PM2 启动应用          |

## 项目结构

```
fuxiaochen/
├── app/                    # Next.js App Router
│   ├── (site)/             # 前台页面组
│   │   ├── blog/           # 博客相关
│   │   ├── about/          # 关于页面
│   │   ├── changelog/      # 更新日志
│   │   ├── login/          # 登录页面
│   │   └── ui-preview/     # UI 组件预览
│   ├── (admin)/            # 后台管理组
│   │   ├── admin/          # 管理功能
│   │   │   ├── blogs/      # 博客管理
│   │   │   ├── categories/ # 分类管理
│   │   │   ├── tags/       # 标签管理
│   │   │   ├── users/      # 用户管理
│   │   │   └── changelogs/ # 更新日志管理
│   ├── actions/            # Server Actions
│   └── api/                # API 路由
├── components/             # 组件库
│   ├── ui/                 # 基础 UI 组件（Chen Serif 设计系统）
│   ├── admin/              # 后台业务组件
│   ├── blog/               # 博客业务组件
│   └── layout/             # 布局组件（header, footer）
├── stores/                 # Store 实现 (Interface-First)
│   └── */                  # 各模块 Store
│       ├── interface.ts    # 接口定义
│       └── store.ts        # 实现代码
├── types/                  # TypeScript 类型定义
├── hooks/                  # 自定义 Hooks
├── lib/                    # 核心工具库
├── styles/                 # 全局样式
├── prisma/                 # 数据库 Schema
└── docs/                   # 项目文档
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

### 权限管理

- **角色定义**：`role = 1` 管理员，`role = 2` 普通用户
- **权限守卫**：使用 `checkAdmin()` 保护敏感操作
- **自动提权**：首个注册用户自动获得管理员权限

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
| 组件      | Pascal Case    | `BlogList`      |
| 变量/函数 | lowerCamelCase | `fetchBlogData` |
| 类型      | Pascal Case    | `IBlogStore`    |

### 交互组件规范 (NiceModal)

Dialog、Alert、Drawer 组件必须统一通过 NiceModal 管理：

```tsx
// 定义组件
export const ExampleDialog = NiceModal.create(({ data, onSuccess }) => {
  const modal = NiceModal.useModal();

  return (
    <Dialog open={modal.visible} onOpenChange={modal.remove}>
      <DialogContent>
        <Button onClick={() => modal.remove()}>取消</Button>
      </DialogContent>
    </Dialog>
  );
});

// 使用组件
NiceModal.show(ExampleDialog, { data, onSuccess: () => mutate() });
```

## 设计系统

项目遵循 **Chen Serif 设计系统**（Variant-driven Design 方案），基于 Tailwind CSS v4 + shadcn/ui 理念构建。

### 核心理念

**Variant-driven Design**（变体驱动设计）：组件通过 props 管理变体（`variant`、`size`），而非全局 CSS 类名。

### 配色方案

| 类别 | Token | 值 | 用途 |
|------|-------|-----|------|
| 背景 | `--color-bg` | `#050505` | 页面背景 |
| 文字 | `--color-fg` | `#ebebeb` | 主文字 |
| 品牌 | `--color-primary` | `#10b981` | 主强调色（翡翠绿） |
| 卡片 | `--color-card` | `rgba(255,255,255,0.02)` | 卡片背景 |
| 表面 | `--color-surface` | `rgba(255,255,255,0.08)` | 次级背景 |
| 次级文字 | `--color-muted` | `rgba(255,255,255,0.4)` | 次级文字 |
| 边框 | `--color-border` | `rgba(255,255,255,0.08)` | 边框 |

### 字体体系

字体使用 jsDelivr CDN @fontsource，通过 `@font-face` 定义可变字体。

| 用途 | 字体 | Token | 字重范围 |
|------|------|-------|---------|
| 标题/强调 | Newsreader | `--font-serif` | 200-800 (可变) |
| 正文/UI | Inter | `--font-sans` | 100-900 (可变) |
| 代码/技术 | Space Grotesk | `--font-mono` | 300-700 (可变) |

**使用示例：**
```tsx
<h1 className="font-serif">Newsreader 标题</h1>
<p className="font-sans">Inter 正文字体</p>
<code className="font-mono">Space Grotesk 等宽</code>
<p className="font-serif italic">Newsreader 斜体</p>
```

### 组件示例

```tsx
<Button variant="primary">新建文章</Button>
<Button variant="secondary">取消</Button>
<Button variant="ghost">了解更多</Button>

<Badge variant="success">成功</Badge>
<Badge variant="warning">警告</Badge>
```

详细设计规范请参考 [docs/chen-serif-design-system.md](./docs/chen-serif-design-system.md)。

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

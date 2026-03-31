# fuxiaochen

基于 Next.js 16.1 (App Router) 构建的高性能个人博客，采用 Chen Serif 设计系统（Variant-driven Design 方案）。


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

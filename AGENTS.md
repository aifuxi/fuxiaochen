# AGENTS.md

## 常用命令

### 开发
- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm build:analyzer` - 分析构建包大小

### 代码质量
- `pnpm lint` - ESLint 检查
- `pnpm lint:fix` - ESLint 检查并自动修复
- `pnpm format` - Prettier 格式化代码

### 数据库
- `pnpm db:gen` - 生成 Prisma Client
- `pnpm db:push` - 推送 schema 变更到数据库
- `pnpm db:dev` - 运行 Prisma 迁移（开发环境）
- `pnpm db:reset` - 重置数据库
- `pnpm db:studio` - 打开 Prisma Studio
- `pnpm db:seed` - 填充种子数据

### 部署
- `pnpm pm2:start` - 使用 PM2 启动应用
- `pnpm pm2:stop` / `pnpm pm2:restart` - PM2 管理命令

### Git 提交
- `pnpm commit` - 使用 Commitizen 提交（遵循 Conventional Commits）
- `pnpm commit:retry` - 重试失败的提交

## 技术栈

- **框架**: Next.js 16.1.1 (App Router) + React 19.2.3
- **语言**: TypeScript 5.9.3（严格模式）
- **数据库**: MySQL/MariaDB + Prisma ORM
- **样式**: Tailwind CSS 4 + Radix UI
- **认证**: Better Auth（支持 GitHub OAuth 和邮箱密码登录）
- **Markdown**: ByteMD（博客编辑器）
- **存储**: OSS（文件上传）
- **包管理器**: pnpm

## 代码规范

### 命名约定
- 文件: `kebab-case` (如 `blog-list.tsx`)
- 组件: `PascalCase` (如 `BlogList`)
- 变量/函数: `lowerCamelCase` (如 `fetchBlogData`)
- 类型/接口: `PascalCase` (如 `IBlogStore`)
- Store 接口前缀: `I` (如 `IBlogStore`)

### NiceModal 管理（重要）

Dialog、Alert、Drawer 组件**必须**通过 NiceModal 统一管理，避免本地 `open` 状态造成状态分裂：

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

**禁止**：
- 使用 `open`/`onOpenChange` 作为外部状态控制
- 使用 `DialogTrigger` 直接触发

### ESLint 配置要点

- 使用 flat config 格式
- 启用 TypeScript 项目服务 (`projectService: true`)
- Tailwind CSS 类检查（`@/styles/global.css` 作为入口点）
- 文件命名强制 `KEBAB_CASE`
- 类型导入使用 `type` 关键字 (`import type { ... }`)
- 遇到 ESLint 问题时，可执行 `pnpm lint:fix` 尝试自动修复

### 字体体系

字体使用 jsDelivr CDN @fontsource，通过 `@font-face` 定义可变字体。

#### 字体 CSS 定义

```css
/* inter-latin-wght-normal */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url(https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5.2.8/files/inter-latin-wght-normal.woff2) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}

/* newsreader-latin-wght-normal */
@font-face {
  font-family: 'Newsreader';
  font-style: normal;
  font-display: swap;
  font-weight: 200 800;
  src: url(https://cdn.jsdelivr.net/npm/@fontsource-variable/newsreader@5.2.10/files/newsreader-latin-wght-normal.woff2) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}

/* space-grotesk-latin-wght-normal */
@font-face {
  font-family: 'Space Grotesk';
  font-style: normal;
  font-display: swap;
  font-weight: 300 700;
  src: url(https://cdn.jsdelivr.net/npm/@fontsource-variable/space-grotesk@5.2.10/files/space-grotesk-latin-wght-normal.woff2) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
```

#### 字体 Token 定义

在 `styles/global.css` 的 `@theme` 块中注册：

```css
@theme {
  --font-serif: 'Newsreader', Georgia, serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-mono: 'Space Grotesk', monospace;
}
```

#### 字体用途

| 用途 | 字体 | Token | 字重范围 |
|------|------|-------|---------|
| 标题/强调 | Newsreader | `--font-serif` | 200-800 (可变) |
| 正文/UI | Inter | `--font-sans` | 100-900 (可变) |
| 代码/技术 | Space Grotesk | `--font-mono` | 300-700 (可变) |


### NiceModal 集成

Dialog、Alert、Drawer 组件通过 NiceModal 统一管理：

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

## 重要文件路径

- `styles/global.css` - Tailwind CSS 4 配置入口和全局样式
- `lib/auth.ts` - Better Auth 配置
- `lib/auth-guard.ts` - 权限守卫
- `lib/oss.ts` - OSS 存储工具
- `prisma/schema.prisma` - 数据库模型
- `generated/prisma/` - Prisma Client 生成目录（忽略）

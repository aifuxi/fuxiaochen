# AGENTS.md

## 常用命令

### 开发
- `bun run dev` - 启动开发服务器
- `bun run build` - 构建生产版本
- `bun run start` - 启动生产服务器
- `bun run build:analyzer` - 分析构建包大小

### 测试
- `bun run test` - 运行 Vitest 测试

### 代码质量
- `bun run lint` - ESLint 检查
- `bun run lint:fix` - ESLint 检查并自动修复
- `bun run lint:inspect` - 查看 ESLint 最终配置
- `bun run format` - Prettier 格式化代码

### 数据库
- `bun run db:prepare` - 执行开发迁移并生成 Prisma Client
- `bun run db:gen` - 生成 Prisma Client
- `bun run db:push` - 推送 schema 变更到数据库
- `bun run db:dev` - 运行 Prisma 开发迁移
- `bun run db:deploy` - 部署生产迁移
- `bun run db:reset` - 重置数据库
- `bun run db:studio` - 打开 Prisma Studio
- `bun run db:seed` - 填充种子数据

### 部署
- `bun run pm2:start` - 使用 PM2 启动应用
- `bun run pm2:stop` - 停止 PM2 应用
- `bun run pm2:restart` - 重启 PM2 应用
- `bun run pm2:reload` - 平滑重载 PM2 应用
- `bun run pm2:logs` - 查看 PM2 日志
- `bun run pm2:status` - 查看 PM2 状态
- `bun run pm2:delete` - 删除 PM2 进程

### Git 提交
- `bun run commit` - 使用 Commitizen 提交（遵循 Conventional Commits）
- `bun run commit:retry` - 重试失败的提交

## 技术栈

- **框架**: Next.js 16.2.2（App Router）+ React 19.2.4
- **语言**: TypeScript 5.9.3（严格模式）
- **测试**: Vitest 4（`node` 环境，测试文件位于 `lib/**/*.test.ts`）
- **数据库**: MySQL/MariaDB + Prisma ORM + `@prisma/adapter-mariadb`
- **样式**: Tailwind CSS 4 + `@base-ui/react`
- **认证**: Better Auth + Prisma Adapter + `better-auth/next-js`
- **通知/模态**: Sonner + NiceModal
- **Markdown**: ByteMD
- **包管理器**: bun

## 代码规范

### 命名约定
- 文件: `kebab-case`（如 `blog-list.tsx`）
- 组件: `PascalCase`（如 `BlogList`）
- 变量/函数: `lowerCamelCase`（如 `fetchBlogData`）
- 类型/接口: `PascalCase`

### UI 组件约定
- 优先复用 `components/ui/*` 中对 `@base-ui/react` 的封装，不要在业务组件里重复造基础交互层。
- 新增弹层、表单控件、菜单、标签页等基础组件时，优先沿用现有 `Base UI + Tailwind` 包装模式。
- Toast 统一使用 `sonner`，Provider 位于 `components/providers.tsx`。

### NiceModal 管理（重要）

Dialog、Drawer 等浮层组件必须通过 NiceModal 统一管理，避免本地 `open` 状态造成状态分裂：

```tsx
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

NiceModal.show(ExampleDialog, { data, onSuccess: () => mutate() });
```

**禁止**：
- 使用外部 `open` / `onOpenChange` 状态驱动同一个弹层
- 使用 `DialogTrigger` 作为业务入口直接触发弹层

### ESLint 配置要点

- 使用 flat config（`eslint.config.mjs`）
- 启用 TypeScript 项目服务（`projectService: true`）
- `better-tailwindcss` 的 Tailwind v4 入口为 `app/globals.css`
- TS / TSX 通过 `typescript-eslint` parser 解析
- 文件命名强制 `KEBAB_CASE`
- 类型导入使用 `type` 关键字（`import type { ... }`）
- 遇到 ESLint 问题时，可执行 `bun run lint:fix` 尝试自动修复

### 字体体系

字体在 `app/globals.css` 中通过 `@font-face` 和 `@theme` 注册：

```css
@theme {
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-serif: "Newsreader", Georgia, serif;
  --font-mono: "Space Grotesk", monospace;
}
```

当前项目还额外注册了 `JetBrains Mono`，但默认 `--font-mono` token 仍指向 `Space Grotesk`。

## 目录与架构

- `app/(site)` - 前台站点页面
- `app/(cms)` - CMS 页面
- `app/api` - App Router Route Handlers
- `components/ui` - 基于 `@base-ui/react` 的基础 UI 封装
- `components/blocks` - 页面级区块组件
- `components/layout` - 站点与 CMS 布局组件
- `components/modals` - NiceModal 管理的弹层组件
- `lib/api` - Route Handler 错误处理与响应封装
- `lib/tag` - Tag 领域的 DTO / repository / service / handler 以及对应测试
- `generated/prisma` - Prisma Client 生成目录（不要手改）

## API Route 设计规范

### 分层约定

API Route 采用 `handler -> service -> repository -> dto` 分层，职责不要混写：

- `route.ts`：只负责导出 `GET` / `POST` / `PATCH` / `DELETE` 等入口，组装依赖，调用 `handleRoute(...)` 包装后的 handler。
- `handler`：处理 HTTP 层逻辑，包括 session 校验、`params` / `query` / `json body` 解析、调用 service、返回统一响应。
- `service`：处理业务规则、领域校验、冲突检测、存在性检查，必要时抛出 `ApiError`。
- `repository`：只负责数据库访问与查询拼装，不承载业务规则。
- `dto`：定义 Zod schema、输入输出类型、DTO 转换函数，负责请求数据校验和响应数据整形。

### 响应规范

所有 Route Handler 都应走统一响应结构：

- 成功响应使用 `lib/api/response.ts` 中的 `successResponse(...)`
- 错误响应使用 `lib/api/response.ts` 中的 `errorResponse(...)`
- 成功响应结构固定为：`{ success: true, code: "OK", message, data, meta? }`
- 错误响应结构固定为：`{ success: false, code, message, error: { details } }`
- 分页等附加信息放在 `meta` 中，不要混入 `data`

### 错误码规范

- 通用错误码统一定义在 `lib/api/error-codes.ts`
- 领域错误码按模块扩展，例如 `tagErrorCodes`
- 错误码必须映射到明确 HTTP 状态码，统一由 `errorStatusMap` 管理
- 业务层和校验层抛出的可预期错误，统一使用 `ApiError`
- Zod 校验错误、JSON 解析错误和未知错误统一通过 `normalizeApiError(...)` 归一化

### 推荐实现方式

- 在 `app/api/**/route.ts` 中只做依赖注入和方法导出，不直接写业务逻辑
- handler 中使用 DTO schema 解析 `params`、query 和 body
- service 返回 DTO 或可直接转 DTO 的领域结果，不直接返回原始 Prisma 记录到外层
- repository 尽量收敛查询字段，优先使用固定 `select`
- 新增一个 API 资源时，优先按 `lib/<domain>/<domain>-handler.ts`、`<domain>-service.ts`、`<domain>-repository.ts`、`<domain>-dto.ts` 的结构落地

## 重要文件路径

- `app/globals.css` - Tailwind CSS 4 入口、设计 token 与全局样式
- `app/layout.tsx` - 根布局，注入全局样式与 Providers
- `components/providers.tsx` - NiceModal Provider 与 Sonner Toaster
- `components/ui/dialog.tsx` - 基于 `@base-ui/react/dialog` 的对话框封装
- `lib/auth.ts` - Better Auth 服务端配置与 CMS Session 守卫
- `lib/auth-client.ts` - Better Auth 客户端入口
- `lib/db.ts` - Prisma Client 与 MariaDB Adapter 初始化
- `lib/api/handle-route.ts` - Route Handler 统一错误包装
- `app/api/auth/[...all]/route.ts` - Better Auth Next.js Route Handler
- `prisma/schema.prisma` - 数据库模型
- `vitest.config.ts` - Vitest 配置
- `eslint.config.mjs` - ESLint flat config 与 `better-tailwindcss` 配置

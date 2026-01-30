# 实施计划：GitHub 登录与赛博朋克风格界面

我将为您集成 `better-auth` 实现 GitHub 登录，并设计一个符合现有项目风格的赛博朋克登录页面。

## 1. 核心依赖安装与配置

- **安装依赖**：添加 `better-auth` 库。
- **环境变量**：
  - 配置 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`（需要您在 GitHub Developer Settings 中创建 OAuth App）。
  - 配置 `BETTER_AUTH_SECRET` 用于加密会话。
  - 配置 `BETTER_AUTH_URL`（开发环境为 `http://localhost:3000`）。

## 2. 数据库适配 (Prisma)

- **Schema 更新**：使用 `better-auth` CLI 自动生成所需的数据库表结构（User, Session, Account, Verification）。
- **迁移执行**：运行 `prisma migrate dev` 将更改应用到数据库。
- **配置 Auth**：在 `lib/auth.ts` 中初始化 `better-auth`，配置 Prisma Adapter 和 GitHub Provider。

## 3. API 路由搭建

- **创建路由**：建立 `app/api/auth/[...all]/route.ts`。
- **处理请求**：使用 `toNextJsHandler` 暴露 GET 和 POST 接口，处理所有认证请求。

## 4. 客户端集成

- **Auth Client**：创建 `lib/auth-client.ts`，导出用于前端组件的 `authClient`（包含 `useSession`, `signIn`, `signOut` 等 Hooks）。

## 5. 赛博朋克登录页面设计

- **页面路径**：新建 `app/(portal)/login/page.tsx`。
- **视觉风格**：
  - **背景**：复用现有的深色背景与网格纹理。
  - **容器**：使用类似 `NeonBlogCard` 的霓虹发光边框效果。
  - **标题**：使用带有 Glitch（故障）效果的文本。
  - **按钮**：设计高亮的 "Sign in with GitHub" 按钮，带有悬停发光和扫描线动画。
- **组件复用**：尽量复用 `components/cyberpunk` 下的现有组件（如 `GlitchHero` 样式）以保持风格统一。

## 6. 验证与测试

- 验证数据库表是否正确创建。
- 测试 GitHub OAuth 流程是否通畅。
- 确认登录后用户信息能否正确保存和获取。

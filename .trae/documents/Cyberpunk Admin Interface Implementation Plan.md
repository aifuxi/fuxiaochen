# 赛博朋克风格后台管理系统与标签管理模块实施计划

本计划旨在实现一个具备权限控制的赛博朋克风格后台管理界面，并优先实现标签（Tag）管理的 CRUD 功能。

## 1. 数据库与认证 (Database & Auth)

- **修改 Schema**: 在 `prisma/schema.prisma` 中添加 `Role` 枚举 (`admin`, `visitor`)，并为 `User` 模型添加 `role` 字段（默认 `visitor`）。
- **角色分配逻辑**: 在 `lib/auth.ts` 中配置 `databaseHooks`。在用户创建（`create.before`）时，检查数据库中是否已有用户。如果是第一个用户，强制设置为 `admin`，否则保持默认 `visitor`。
- **数据库迁移**: 执行 Prisma 迁移以应用更改。

## 2. 后端逻辑增强 (Backend Logic Enhancement)

- **类型定义**: 更新 `types/tag.ts` 中的 `TagListReq`，确保包含 `sortBy` 和 `order` 字段。
- **Store 更新**: 修改 `stores/tag/store.ts` 的 `findAll` 方法：
  - 支持 `slug` 模糊搜索。
  - 支持动态排序（`createdAt`, `updatedAt`）。

## 3. 后台管理布局 (Admin Layout)

- **路由结构**: 创建 `app/(admin)/layout.tsx` 作为后台根布局。
- **权限拦截**: 在布局中检查用户会话。
  - 未登录 -> 重定向至 `/login`。
  - 已登录但无权限 -> 显示“权限拒绝”或仅允许访问特定公共区域（根据需求，暂时仅做登录拦截，角色逻辑在前端展示区分）。
- **UI 框架**:
  - **Sidebar**: 侧边导航栏，包含“仪表盘”、“标签管理”、“博客管理”等链接。使用霓虹光效边框。
  - **Header**: 顶部栏，显示当前用户信息和面包屑。
  - **Main**: 内容区域，使用深色背景和玻璃拟态效果。

## 4. 标签管理页面 (Tag Management Implementation)

- **页面文件**: 创建 `app/(admin)/admin/tags/page.tsx`。
- **功能组件**:
  - **`TagTable`**: 基于 `components/ui/table`，展示标签列表。列包含：名称、Slug、描述、关联文章数、创建时间、操作。
  - **`TagToolbar`**: 包含搜索框（支持 Name/Slug 搜索）和“新建标签”按钮。
  - **`TagDialog`**: 复用 `Dialog` 和 `Form` 组件，用于创建和编辑标签。
  - **`DeleteConfirm`**: 删除前的确认弹窗。
- **交互逻辑**:
  - 使用 `useSearchParams` 管理分页、排序和搜索状态。
  - 调用 `app/actions/tag.ts` 中的 Server Actions 进行数据操作。

## 5. UI 风格规范 (Cyberpunk Styling)

- **配色**: 延续前台风格，使用 `bg-cyber-black` 作为主背景，`border-neon-cyan/20` 作为边框，高亮元素使用 `text-neon-cyan` 或 `text-neon-purple`。
- **动效**: 按钮添加 hover 发光效果，表格行添加 hover 渐变背景。

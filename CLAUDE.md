# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

### 开发
- `bun dev` - 启动开发服务器
- `bun run build` - 构建生产版本
- `bun start` - 启动生产服务器

### 代码质量
- `bun lint` - ESLint 检查
- `bun lint:fix` - ESLint 检查并自动修复
- `bun format` - Prettier 格式化代码


### 部署
- `bun pm2:start` - 使用 PM2 启动应用
- `bun pm2:stop` / `bun pm2:restart` - PM2 管理命令

### Git 提交
- `bun commit` - 使用 Commitizen 提交（遵循 Conventional Commits）
- `bun commit:retry` - 重试失败的提交

## 技术栈

- **框架**: Next.js 16.1.1 (App Router) + React 19.2.3
- **语言**: TypeScript 5.9.3（严格模式）
- **数据库**: MySQL/MariaDB + Prisma ORM
- **样式**: Tailwind CSS 4 + `@base-ui/react`(组件库文档：https://base-ui.com/llms.txt)
- **包管理器**: bun

## 代码规范

### 命名约定
- 文件: `kebab-case` (如 `blog-list.tsx`)
- 组件: `PascalCase` (如 `BlogList`)
- 变量/函数: `lowerCamelCase` (如 `fetchBlogData`)

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

# Commit 规范

所有 commit 必须遵循 [Angular Conventional Commits](https://www.conventionalcommits.org/) 规范，**优先使用中文**描述。

格式: `<type>(<scope>): <description>`

**常用 type:**
- `feat` - 新功能
- `fix` - 修复 bug
- `docs` - 文档更改
- `style` - 代码格式（不影响功能）
- `refactor` - 重构
- `perf` - 性能优化
- `test` - 测试
- `chore` - 构建/工具变动

**示例:**
```
feat(images): 允许加载任意来源的图片
fix(auth): 修复令牌过期问题
docs(readme): 更新项目说明
```

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
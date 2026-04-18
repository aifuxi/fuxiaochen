# 仓库指南

## 构建、测试与开发命令

- `pnpm dev`：启动本地 Next.js 开发服务器。
- `pnpm build`：生成生产构建；`postbuild` 会额外生成 sitemap 文件。
- `pnpm start`：本地启动生产构建产物。
- `pnpm lint` / `pnpm lint:fix`：运行 Oxlint 检查，或自动修复可安全处理的问题。
- `pnpm lint:inspect`：输出当前生效的 Oxlint 配置，便于排查规则来源。
- `pnpm format` / `pnpm format:check`：使用 Oxfmt 格式化整个仓库，或检查格式是否符合约定。
- `make build_image`：读取 `.env` 中的变量构建 Docker 镜像。

## 代码风格与命名约定

项目使用 TypeScript，启用 `strict` 模式，并通过 `@/*` 引用根目录路径。Oxfmt 统一 2 空格缩进、分号、尾随逗号和双引号，并负责导入排序与 Tailwind 类名排序。Oxlint 要求应用代码文件名使用 kebab-case，并优先使用内联 `type` imports。路由相关代码放在 `app/...`，共享工具函数放在 `lib/`，通用基础组件放在 `components/ui/`。除非确有必要，不要保留面向生产环境的 `console` 输出。

## 提交与 Pull Request 规范

提交信息遵循 Conventional Commits，例如 `feat(blog): improve card layout` 或 `fix: remove debug log`。`commitlint` 会校验提交消息；如果需要交互式提交流程，可使用 `pnpm commit` 启动 Commitizen。PR 应包含简短变更说明；涉及界面改动时附截图；涉及 schema 或 `.env` 变更时补充说明；有对应 issue 时一并关联。重构与行为修改尽量分开提交。

## 安全与配置提示

使用 Node `>=20` 和 pnpm `>=9`。敏感信息仅存放在 `.env` 中，不要提交任何密钥或凭据。Docker、认证、分析埋点和数据库配置都依赖环境变量；新增变量时，请在 PR 描述中明确说明用途与配置方式。

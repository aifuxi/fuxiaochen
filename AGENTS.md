<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 项目设计系统

- 所有新增或修改的界面以仓库根目录的 `design.md` 为视觉与交互规范来源；先阅读其 token 与各章节说明，再实现 UI。
- Tailwind CSS v4 变量须与 `design.md` 同步。交互基础组件使用 Base UI，按 `components/ui/` 中可编辑、可组合的本地组件方式组织。
- 组件必须覆盖 hover、active、focus-visible、disabled 和 `prefers-reduced-motion`；新设计规则先更新 `design.md`，再更新实现。

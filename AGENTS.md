# AGENTS.md

本文件为在本仓库中工作的编码代理提供统一约定。用户指令优先级最高；如与本文件冲突，以用户明确要求为准。

## 0. 文档分工

- `README.md`：面向人类读者的项目介绍、快速开始、部署与功能说明
- `AGENTS.md`：面向编码代理与协作者的执行规范、架构约束与改动原则
- `CLAUDE.md`：面向 Claude Code 的兼容性说明，应与 `AGENTS.md` 保持一致
- `docs/chen-serif-design-system.md`：Chen Serif 设计系统的完整规范

维护文档时，尽量避免把同一套细节完整复制到多份文件中：

- 对外介绍、使用方式放在 `README.md`
- 实施规则、约束、禁令放在 `AGENTS.md`
- 详细设计 token 和视觉规范放在 `docs/chen-serif-design-system.md`

## 1. 项目概览

- 项目名称：`fuxiaochen`
- 定位：基于 Next.js App Router 的个人博客与后台管理系统
- 当前特征：前台站点 + 后台 CMS + Chen Serif 设计系统 + Better Auth + Prisma
- 代码语言：TypeScript（严格模式）
- 包管理器：`pnpm`

## 2. 技术栈

- 框架：Next.js `16.1.1` + React `19.2.3`
- 样式：Tailwind CSS `v4` + Radix UI
- 数据库：MySQL / MariaDB + Prisma ORM
- 认证：Better Auth
- 编辑器：ByteMD
- 状态与交互：SWR、React Hook Form、Zod、NiceModal、Sonner

## 3. 常用命令

### 开发

- `pnpm dev`：启动开发服务器
- `pnpm build`：构建生产版本
- `pnpm start`：启动生产服务器
- `pnpm build:analyzer`：分析构建产物

### 质量检查

- `pnpm lint`：执行 ESLint
- `pnpm lint:fix`：自动修复可修复的 ESLint 问题
- `pnpm lint:inspect`：查看 ESLint 配置
- `pnpm format`：执行 Prettier

### 数据库

- `pnpm db:prepare`：迁移并生成 Prisma Client
- `pnpm db:gen`：生成 Prisma Client
- `pnpm db:dev`：开发环境迁移
- `pnpm db:push`：推送 schema 变更
- `pnpm db:deploy`：部署环境迁移
- `pnpm db:reset`：重置数据库
- `pnpm db:studio`：打开 Prisma Studio
- `pnpm db:seed`：填充种子数据

### 部署与运维

- `pnpm pm2:start`
- `pnpm pm2:stop`
- `pnpm pm2:restart`
- `pnpm pm2:reload`
- `pnpm pm2:logs`
- `pnpm pm2:status`
- `pnpm pm2:delete`

### 提交

- `pnpm commit`：通过 Commitizen 生成 Conventional Commits
- `pnpm commit:retry`：重试提交

## 4. 目录与模块划分

### 核心目录

- `app/`：Next.js App Router
- `app/(site)/`：前台页面
- `app/(admin)/`：后台页面与管理布局
- `app/actions/`：Server Actions
- `app/api/`：Route Handlers / API
- `components/ui/`：Chen Serif 基础组件
- `components/admin/`、`components/blog/`、`components/layout/`：业务与布局组件
- `stores/`：Interface-First Store 实现
- `types/`：类型定义
- `lib/`：通用工具、认证、请求、数据库封装
- `styles/`：全局样式与主题
- `prisma/`：Schema、迁移、种子
- `docs/`：设计文档、计划、规范说明

### 业务模块组织

新增业务模块时，优先沿用以下结构：

- `types/[module].ts`
- `stores/[module]/interface.ts`
- `stores/[module]/store.ts`
- `stores/[module]/index.ts`
- `app/actions/[module].ts`
- `components/[module]/...`

现有模块包括：

- `blog`
- `category`
- `tag`
- `changelog`
- `user`
- `upload`
- `dashboard`

## 5. 必须遵守的架构规则

### Interface-First 数据流

默认遵循以下链路：

`Client Component -> Server Action -> Store Interface -> Store Implementation -> Prisma -> MySQL/MariaDB`

除非用户明确要求，不要绕过 `app/actions/*` 直接在客户端调用数据库逻辑，也不要把业务逻辑散落到页面组件中。

### Server Action 约定

- 文件位于 `app/actions/*.ts`
- 使用 `"use server"`
- 使用 Zod 做入参校验
- 需要管理员权限时先调用 `checkAdmin()`
- 写操作后按需执行 `revalidatePath(...)`
- 返回值保持当前项目风格：`{ success: boolean, data?, error? }`

### Store 约定

- 接口定义写在 `stores/*/interface.ts`
- 实现写在 `stores/*/store.ts`
- 优先在 Store 内聚合 Prisma 查询与映射逻辑
- 如涉及 Prisma 结果到领域对象的转换，沿用 `mapToDomain` 一类的显式映射方式

### 软删除

多数模型使用 `deletedAt` 软删除。读取列表或公开内容时，默认记得过滤：

```ts
const where: Prisma.SomeModelWhereInput = { deletedAt: null };
```

不要无意中把软删除记录重新暴露到前台页面或公开接口。

## 6. 权限与认证

- 用户角色为整数：`1` = 管理员，`2` = 普通用户
- 首个注册用户会自动获得管理员权限
- 后台写操作、敏感操作默认需要 `checkAdmin()`
- Better Auth 相关模型包括：`User`、`Session`、`Account`、`Verification`

如果改动注册、登录、权限或用户管理逻辑，务必检查角色判断与权限边界是否仍然正确。

## 7. UI 与交互规范

### Chen Serif 设计系统

所有 UI 组件必须遵循 Chen Serif 设计系统和 Variant-driven Design 思路：

- 优先复用 `components/ui/*`
- 通过组件 `variant` 扩展，而不是在页面里重复堆砌样式
- 设计 token 以 `styles/global.css` 为准
- 需要额外背景、字体、动效时，先看 `docs/chen-serif-design-system.md`

### NiceModal 规则

`Dialog`、`AlertDialog`、`Drawer` 统一通过 NiceModal 管理：

- 使用 `NiceModal.create(...)` 定义弹层
- 使用 `NiceModal.show(...)` 触发
- 使用 `const modal = NiceModal.useModal()` 管理可见性

禁止：

- 用外部 `open` / `onOpenChange` 维护一套本地开关状态
- 直接使用 `DialogTrigger` 触发弹层

### UI 改动原则

- 优先在现有设计语言内扩展，不要引入与项目调性不一致的新视觉体系
- 表单优先沿用 `react-hook-form` + `zodResolver`
- 提示反馈优先沿用 `sonner`
- 先复用基础组件，再新增业务组件

## 8. 命名与代码风格

- 文件名：`kebab-case`
- React 组件：`PascalCase`
- 变量、函数：`lowerCamelCase`
- 类型、接口：`PascalCase`
- Store 接口：以 `I` 前缀命名，如 `IBlogStore`
- 类型导入优先使用 `import type { ... }`

补充约定：

- 保持 TypeScript 严格模式兼容
- 与现有代码风格一致，优先做小步修改
- 不要引入未经验证的新架构层
- 文案、报错、注释优先保持与当前文件语言一致

## 9. Prisma 与数据库注意事项

- Prisma Client 生成目录为 `generated/prisma/`
- 该目录是生成产物，不要手写业务逻辑进去
- 修改 `prisma/schema.prisma` 后，按场景运行 `pnpm db:gen`、`pnpm db:dev` 或 `pnpm db:push`
- 修改影响公开数据读取时，要额外检查是否误暴露未发布内容、草稿或软删除内容

## 10. Agent 工作方式

进入任务后，建议按以下顺序执行：

1. 先阅读本文件、`CLAUDE.md` 与相关模块代码
2. 尽量沿用现有目录结构、接口形状与交互模式
3. 只修改完成任务所需的最小范围
4. 若改动一个业务模块，优先检查是否需要同步更新：
   - `types`
   - `stores/interface`
   - `stores/store`
   - `app/actions`
   - 相关组件或页面
5. 完成后运行与改动最相关的校验命令

### 搜索与检查

- 优先使用 `rg` / `rg --files` 搜索
- 改动前先确认是否已有现成组件、Store、Action 或文档可复用
- 发现本地存在未解释的脏改动时，不要随意回退；只在自己的变更范围内工作

### 验证

至少执行与改动相关的检查；常见选择：

- `pnpm lint`
- `pnpm build`
- 与数据库变更相关的 Prisma 命令

如果因为环境、依赖、配置或时间原因无法验证，要在交付说明中明确指出。

## 11. 文档同步

遇到以下情况时，应考虑同步更新文档：

- 新增或重构业务模块
- 修改关键架构约定
- 调整设计系统使用方式
- 修改开发、部署、数据库命令

优先更新：

- `README.md`
- `CLAUDE.md`
- `docs/` 下对应专题文档

## 12. 优先级说明

当多份规范同时存在时，按以下优先级理解：

1. 用户当前指令
2. `AGENTS.md`
3. `CLAUDE.md`
4. `README.md` 与 `docs/*`

如果发现文档与代码实现不一致，以“当前运行中的代码模式”优先，但应在交付时指出差异，必要时补文档。

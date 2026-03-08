# 工业级 Code Review 报告（Next.js + Prisma + Better Auth）

- 项目：`aifuxi/fuxiaochen`（分支：`feat/ai-cr`）
- 日期：2026-03-06
- 范围：工程配置/基础设施、鉴权与权限边界、博客内容渲染与上传链路、常见安全风险点、基础可维护性

---

## 0. 结论摘要

### 总体健康度

- 工程化基础较完整：TS `strict`、ESLint flat config、Next.js 16 + React 19、Prisma adapter、Better Auth 集成路径清晰。
- 关键风险集中在“权限边界不一致 + 公网读取未过滤草稿/软删”两个点，属于可以导致数据泄露的业务安全缺陷。

### 静态验证

- `pnpm lint`：通过（命令：`pnpm lint`）
- `pnpm build`：通过（命令：`pnpm build`），但 Better Auth 对 `BETTER_AUTH_SECRET` 给出长度/熵警告（详见 P1）。

---

## 1. P0（必须优先修复）

> P0：存在明确的越权/信息泄露面，或可被公网/低权限用户稳定复现。

### P0-1 公网可访问草稿/软删博客（信息泄露）

**现象**

- 博客详情页直接通过 slug 读取博客：`app/(site)/blog/[slug]/page.tsx:47`。
- 读取链路最终落到 `BlogStore.findBySlug`，但未限制 `published` 与 `deletedAt`：`stores/blog/store.ts:125`。

**影响**

- 任何人只要猜到/拿到 slug，即可访问未发布草稿或已软删内容（典型的内容泄露）。

**建议修复（最小闭环）**

- 将公网读取与后台读取分离：
  - 公网：仅返回 `published=true AND deletedAt IS NULL`。
  - 管理后台：仅管理员可读取任意状态（通过 `checkAdmin` 或服务端鉴权）。
- 对 `getBlogBySlugAction`（server action）做“上下文感知”：
  - 公网调用路径：强制 published 过滤。
  - 后台编辑页：改为通过 `getBlogByIdAction`（已有）或新增 `getBlogBySlugAdminAction`（管理员专用）。

**验收标准**

- 公网访问 `/blog/[slug]`：草稿与软删均返回 404。
- 管理员在 `/admin/blogs/[id]`：仍可编辑草稿。

---

### P0-2 Sitemap 可能收录草稿 URL（进一步扩大泄露面）

**现象**

- Sitemap 生成：`app/(site)/server-sitemap.xml/route.ts:5` 调用 `getBlogsAction` 未传 `published: true`。
- 输出 loc 直接拼 `NEXT_PUBLIC_SITE_URL`：`app/(site)/server-sitemap.xml/route.ts:14`。

**影响**

- 草稿 URL 可能被搜索引擎收录，扩大泄露范围与恢复成本。

**建议修复**

- sitemap 拉取时强制 `published: true`。
- 对 `NEXT_PUBLIC_SITE_URL` 做必填校验：为空时返回 500 或降级为不输出（避免生成错误站点 URL）。

**验收标准**

- sitemap 中只包含已发布文章。

---

### P0-3 后台鉴权边界不一致（普通登录用户可见管理内容）

**现象**

- 管理后台 Layout 仅校验“已登录”不校验管理员角色：`app/(admin)/layout.tsx:15`。
- 后台博客列表页面也未做角色拦截，并直接读取全量博客（不带 published 过滤）：`app/(admin)/admin/blogs/blog-list.tsx:45`。

**影响**

- 非管理员登录后可能：
  - 看到后台界面与数据（至少是列表数据）。
  - 产生“前端可见但操作失败/部分成功”的不一致体验，且数据可见本身可能违规。

**建议修复**

- 统一后台 gate：在 `app/(admin)/layout.tsx` 中强制 `session.user.role === 1`，否则 redirect 或返回 403 页面。
- 所有后台列表/详情数据读取建议走管理员专用 action（服务端强校验），前端仅负责展示。

**验收标准**

- 非管理员访问任意 `/admin/**` 页面：统一被拦截。

---

## 2. P1（高优先级）

> P1：不会立刻导致泄露，但会影响安全基线、数据正确性或稳定性，且修复收益很高。

### P1-1 上传多文件逻辑错误（稳定性/正确性）

**现象**

- 编辑器上传图片回调里遍历 `files.map(file => ...)`，但实际上传 body 使用 `files[0]`：`app/(admin)/admin/blogs/blog-form.tsx:356`。

**影响**

- 多图上传时会重复上传第一张，导致内容与 OSS 对象不一致。

**建议修复**

- 将 `body: files[0]` 改为 `body: file`。
- 并建议对上传结果为空时给出明确 toast（区分签名失败/PUT 失败）。

---

### P1-2 Better Auth 生产密钥强度不足（安全基线）

**现象**

- `pnpm build` 输出警告：`BETTER_AUTH_SECRET` 长度不足或低熵（构建日志可见）。

**影响**

- 影响会话/签名安全强度（取决于 Better Auth 使用该密钥的方式），属于上线阻断级别的安全基线问题。

**建议修复**

- 生产环境确保 `BETTER_AUTH_SECRET` 使用 32+ 字节的随机值。
- 使用 Better Auth 推荐命令生成：`npx @better-auth/cli secret` 或 `openssl rand -base64 32`。

---

### P1-3 Server Action 参数缺少运行时校验（稳定性/防御性）

**现象**

- 例如博客列表排序：`stores/blog/store.ts:169` 动态拼 `orderBy = { [sortBy]: order }`。
- TS 类型约束只能限制编译期，server action 仍可能收到异常入参导致运行期错误（尤其是 `page/pageSize` 极大值或非法字符串）。

**建议修复**

- 对所有 server actions 输入统一用 Zod 做 schema 校验与默认值收敛（建议在 `app/actions/*` 层处理），并对 `pageSize` 做上限（例如 100）。

---

## 3. P2（中优先级：规范/可维护性/体验）

### P2-1 后台页面权限体验不一致

**现象**

- 有些后台页面不校验 session/role（例如 `app/(admin)/admin/categories/page.tsx:6`、`app/(admin)/admin/changelogs/page.tsx:6`、`app/(admin)/admin/tags/page.tsx:6`）。
- 但写操作 server action 又强制 `checkAdmin`（例如 `app/actions/category.ts:29`）。

**影响**

- 非管理员可进入页面、看到按钮/表格，但操作时失败，造成混乱与潜在信息暴露。

**建议修复**

- 通过 `app/(admin)/layout.tsx` 做统一强拦截（推荐），避免每个页面重复写。

---

### P2-2 Markdown/XSS 风险需要显式策略

**现象**

- 博客内容渲染使用 `@bytemd/react`：`components/blog/blog-content.tsx:24`。
- 当前未看到显式 sanitize 配置或对 HTML 渲染的策略声明。

**风险说明**

- 若允许原始 HTML 或某些插件输出不受控 DOM，可能引入 XSS。

**建议**

- 明确是否允许 HTML：
  - 若不允许：确保 bytemd 不解析 raw HTML。
  - 若允许：引入严格的 HTML sanitize（白名单）并做回归测试。

---

### P2-3 可维护性与一致性

- `lib/request.ts:3` 与 server actions 同时存在（两套数据访问方式），建议明确边界：
  - 后台管理统一用 server actions。
  - 客户端请求仅用于真正需要直连 API 的场景。
- `hooks/use-upload.ts:10` 当前未发现引用点，建议删除或接入统一使用，避免“半弃用”代码漂移。

---

## 4. 可执行修复清单（按优先级排序）

### 4.1 P0 修复（建议 1 个 PR 内完成）

1. 公网读取博客增加 `published=true && deletedAt=null` 限制（涉及：`stores/blog/store.ts`、`app/actions/blog.ts`、`app/(site)/blog/[slug]/page.tsx`）。
2. sitemap 强制只收录已发布（`app/(site)/server-sitemap.xml/route.ts`）。
3. 统一后台权限 gate：`app/(admin)/layout.tsx` 增加 `role===1` 强拦截，并梳理 `/admin/**` 页面读取链路。

### 4.2 P1 修复（建议紧随其后）

1. 修复多文件上传 body 使用错误（`app/(admin)/admin/blogs/blog-form.tsx`）。
2. 生产环境配置强随机 `BETTER_AUTH_SECRET`（部署/CI 配置层）。
3. 为 server actions 添加 Zod 运行时校验与 pageSize 上限（`app/actions/*.ts`）。

### 4.3 P2 改进（可分阶段）

1. 明确 Markdown 渲染与 sanitize 策略，并为内容渲染添加安全回归用例。
2. 清理未使用 hooks/重复的数据访问层，统一数据流（server actions vs API client）。

---

## 5. 附录：关键文件索引

- 鉴权/角色：`lib/auth.ts:5`、`lib/auth-guard.ts:4`、`app/(admin)/layout.tsx:15`
- 公网博客详情：`app/(site)/blog/[slug]/page.tsx:47`
- Blog 数据读取：`stores/blog/store.ts:125`
- Sitemap：`app/(site)/server-sitemap.xml/route.ts:5`
- 后台博客列表：`app/(admin)/admin/blogs/blog-list.tsx:45`
- 上传（OSS presign）：`app/actions/upload.ts:6`、`stores/upload/store.ts:6`


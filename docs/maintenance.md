# 数据库维护

## Prisma 8 与迁移

模型源为 `prisma/contract.ts`，配置为 `prisma.config.ts`，生成目录为 `generated/prisma/`。CLI 与应用共用 `DATABASE_URL`，配置从项目根目录 `.env` 或部署环境读取，不使用 `DATABASE_PATH`。生成 contract 和构建无需在线数据库；数据库命令必须配置连接 URL。

使用 Prisma CLI `8.0.0-rc.19`、PostgreSQL runtime `@prisma/orm-postgres@8.0.0-rc.14`，仍处于 RC 阶段。`package.json` 的 overrides 对齐 toolchain `8.0.0-rc.14` 和 CLI engine `0.6.2`，升级前核对官方文档与安装类型，不降级至 Prisma 7。

本次使用全新的 PostgreSQL 初始迁移，不导入 SQLite 数据，不复用 SQLite 的迁移 ledger/marker。旧数据库和旧备份保留，但当前恢复命令仅接受 PostgreSQL 备份。旧正文和历史 OSS 图片迁移命令已移除。

```sh
npm run db:generate
# 显式指定当前已应用迁移的目标 hash，或先设置 db ref。
npm run db:plan -- --name describe-change --from <当前目标hash>
# 审查新增 migration.ts、ops.json、migration.json 与 contract 快照。
npm run db:migrate
```

初始迁移已经提交，空库直接运行 `db:migrate`。`migration plan` 是离线命令，没有 ref 时可能按空库规划；不得对已有迁移历史无起点地生成第二份初始迁移。`db migrate` 默认不推进 ref，可使用 `prisma migration ref set db <hash>` 设置下次规划起点。迁移入口使用顶层 `await MigrationCLI.run(...)`。

提交 contract 源、迁移和快照，不提交 `generated/`、环境文件、数据库或备份。迁移后重启应用，使连接加载新 contract。

## 连接与事务

2026-10-06 增量迁移 `20261006T0523_add_site_seo` 为 `site_setting` 新增搜索描述、分享图与三项站长验证字段。数据库列允许 NULL，服务层映射为空字符串；既有资料和设置保持原值。生成新 contract 后执行 `npm run db:migrate`，再重启应用加载新 contract。

应用连接使用惰性初始化并在开发热更新中复用；CLI 使用 `finally` 关闭连接。所有业务写入必须经 `writeTransaction`／`authTransaction`，先取得固定事务级 advisory lock `734825101` 再读取和写入。Web、管理员命令与外部调度共用该锁，提交或回滚时自动释放。

数据位于 `public` schema。时间使用带时区时间戳与 JavaScript `Date`，原整数使用 `pg/int8number@1`，超出 JavaScript 安全整数范围时拒绝转换。JSON 文档仍保存为经过业务校验的文本，查询时转换为 jsonb。搜索使用 `strpos(lower(...), lower(...))`，关键词中的 `%`、`_` 不作为通配符；统计按 `Asia/Shanghai` 分日。

## 账号与工具

```sh
npm run admin:init
npm run admin:reset-password
npm run media:cleanup -- --dry-run
npm run analytics:cleanup
npm run posts:publish-due
```

账号管理交互输入密码；重置密码撤销该账号全部会话。媒体清理操作 OSS 对象，先核对 dry-run。排期和统计清理均使用与 Web 相同的 PostgreSQL。

备份、恢复和部署步骤见 [部署指南](deployment.md)。参考 [Prisma PostgreSQL 扩展](https://www.prisma.io/extensions/postgresql)、[Prisma 8 contract](https://www.prisma.io/docs/orm/contract-authoring/typescript-schema-builder)、[PostgreSQL advisory locks](https://www.postgresql.org/docs/18/explicit-locking.html)。

## 正文格式与查询机制

正文保存为带格式与版本的 Tiptap JSON 文本；`lib/posts/document.ts` 序列化 `{ format: "fuxiaochen-tiptap", version: 1, document, text }`，读取时校验格式、版本及完整节点结构。编辑器、服务端校验和前台静态渲染共用内容节点定义；正文搜索使用归一化的纯文本，不查询标记结构。当前编辑、前台渲染和搜索不读取旧 Markdown，Markdown 仅作为导入格式，不在本轮恢复旧数据迁移。

Markdown 导入由 `lib/posts/markdown-document.ts` 解析为同一种文档，支持 GFM；原始 HTML 和不支持的语法保留为文字，不执行。导入合并后再次校验完整文档，链接与图片使用共享 URL 校验。导入上限、插入语义、保存状态与失败保留见 [产品行为](product/behavior.md)，编辑器和正文布局分别见 [后台场景](design/admin.md) 与 [前台场景](design/frontend.md)。

后台筛选和搜索使用业务查询入口，查询条件变化时取消旧请求，避免旧结果覆盖新条件。访客记录每 10 秒查询，页面隐藏、卸载或暂停时停止轮询，恢复时立即刷新；暂停只冻结后台查询，不关闭前台采集。产品状态、分页和统计口径由产品文档维护，轮询不作为视觉动效。

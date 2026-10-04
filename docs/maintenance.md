# 数据库维护与旧数据迁移

新建空库按 [README](../README.md) 初始化即可；本文用于结构变更或接管旧数据，部署和备份恢复见 [部署指南](deployment.md)。

## 数据库结构变更

模型源为 `prisma/contract.ts`，配置为 `prisma.config.ts`，生成目录为 `generated/prisma/`。CLI 和应用必须使用同一 `DATABASE_PATH`；相对路径从项目运行目录解析，不使用 `file:` URL。

当前 Prisma CLI 为 `8.0.0-rc.19`、SQLite runtime 为 `8.0.0-rc.14`，处于 RC／experimental 阶段。`package.json` 的 overrides 对齐 ORM toolchain 和 CLI engine；升级时核对兼容性，不使用 Prisma 7 的迁移方式。

```sh
npm run db:generate
npm run db:plan -- --name describe-change
# 审查生成的迁移后再应用
npm run db:migrate
```

`db:migrate` 应用已规划的迁移并执行结构校验，不规划新迁移或创建管理员。没有 `db` ref 时，通过 `--from <当前已应用的目标hash>` 指定起点，不能按空库规划已有数据库的变更。生成的迁移入口若调用 `MigrationCLI.run`，需使用顶层 `await`。

提交迁移及 contract 快照，不提交数据库、备份或 `generated/`。更新 contract 并应用迁移后重启应用，使连接加载新 contract。

## 接管旧文章库

`add_public_blog` 迁移针对当时的空文章库规划。若待接管数据库在该迁移前已有文章，先制定人工 slug 回填方案，不能直接应用迁移、清空数据库或自动从标题／UUID生成 slug。

当前应用只读取块文档 JSON，旧 Markdown 正文必须先迁移；已是块文档的记录跳过。

1. 停止应用、调度和其他使用目标库的写入进程。
2. 执行 `npm run posts:migrate-content -- --dry-run`，只读检查全部文章；无效正文会阻止迁移并报告 ID。
3. 执行 `npm run posts:migrate-content -- --write`。脚本先生成包含 WAL 数据的 SQLite 在线备份，再核对文章快照并在事务中转换；失败回滚。
4. 再次执行只读检查，确认待迁移数量为零后启动应用。

只修改旧正文和版本，保留历史时间、状态、slug、分类、标签及评论。备份位于数据库旁，包含业务和鉴权数据，不得提交。回退到旧 Markdown 数据时，需同时使用支持该格式的应用版本。

## 历史 OSS 图片迁移

此脚本仅处理旧桶 `aifuxi.oss-cn-shanghai.aliyuncs.com` 的正文图片，不是通用媒体导入工具，不处理头像、友链图片或其他域名。

```sh
npm run posts:migrate-images -- --dry-run
npm run posts:migrate-images -- --write
```

`--dry-run` 读取文章并下载、解码检查图片，不上传、写库或保存进度。`--write` 使用当前 OSS 配置，核验正式对象的公开访问和内容后，在事务中更新媒体记录、正文地址及受影响文章版本。写入前停止应用、调度及其他数据库写入进程；失败时不提交正文变更，旧桶文件继续保留。

普通图片沿用上传限制；历史长动图仅按源码中的精确路径白名单放宽，不能作为新上传限制。原文件不重新编码。

进度位于 `data/posts-images-<目标摘要>.json`，记录对象 ID、摘要与备份路径。中断后复用相同命令核对并继续，不覆盖不匹配对象；锁文件异常残留时，先确认其中 PID 已停止，再移除锁重试。备份和进度文件不得提交，旧桶对象不得在迁移核对前删除。

迁移前创建数据库旁的 `.posts-images-<时间>-<UUID>.sqlite` 在线备份。恢复时停止全部连接、另行备份当前库，将 `DATABASE_PATH` 切换到已核验的迁移前备份，并使用匹配的应用；不要混用原数据库的 WAL／SHM。迁移后的对象仍保留，可按进度核对。

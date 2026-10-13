# SQLite 基础层与业务查询适配验收

日期：2026-10-13。范围为 SQLite + Drizzle + better-sqlite3 基础层、当前业务查询和相应测试；不包括 PostgreSQL 数据导出/导入、生产 Compose 改造、镜像合并、推送或部署。

## 已实现

- 固定 Drizzle ORM 0.45.4、drizzle-kit 0.31.11、better-sqlite3 13.0.3 和类型包 9.6.0。Kit 及旧 Prisma/PostgreSQL 工具位于 devDependencies；原有依赖的版本、resolved 和 integrity 未改变，lockfile 的大部分变化来自新增依赖、重新布局及 dev 分类。
- 22 张表映射到 `lib/database/schema.ts`，保持字段、默认值、非空、唯一约束、索引和外键语义。Date 以 UTC 毫秒保存；整数读写拒绝不安全 number。
- `DATABASE_PATH` 显式选择文件，普通连接和迁移拒绝缺失文件；`db:init` 独占创建，拒绝覆盖。用户已有 `.env`、SQLite 文件、PostgreSQL 数据库、卷和备份均未修改。
- 连接启用 WAL、外键、FULL 同步与 5 秒 busy timeout，热重载复用。所有业务写事务为同步 IMMEDIATE，嵌套使用 savepoint；类型和运行时拒绝异步回调或返回 Promise。
- 迁移校验 hash、版本、结构与外键，SQL 与 ledger 同事务。表重建前在事务外暂时关闭外键，提交前完整校验并最终恢复开关，避免 DROP 父表触发级联丢失关联。
- 登录、内容管理、媒体、评论、友链、统计、通知、排期、设置、前台查询与 sitemap 均使用直接 Drizzle 查询。事务内鉴权同步执行，密码校验、OSS 和在线备份等异步操作留在事务外。
- 字面子串查询使用 instr，正文和日志数组使用 JSON 函数；连接注册 Unicode lower，统计保持北京时间分日。
- 备份接口使用 SQLite 在线快照，新 manifest 区分 SQLite 与 PostgreSQL；完整校验使用 integrity_check。恢复只接受独立新文件并撤销会话、关闭自动备份、标记中断任务。
- standalone 显式追踪 better-sqlite3 当前平台原生文件及迁移 SQL/journal。历史 PostgreSQL 源码与本地 data 发布副本不属于当前应用编译，保留作旧版本迁移对照。

## 运行通过

| 验证                | 结果与证据                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SQLite 基础层       | 10/10：独立文件、22 表字段/约束对照、重复迁移、结构/hash 漂移、同步和嵌套回滚、Date/整数、评论外键、CLI 独占初始化                                            |
| 跨进程写锁          | 两个真实 Node 进程各更新同一临时计数 40 次，最终为 80，无丢失更新                                                                                             |
| 索引内容损坏        | 在专用临时库只改一个索引键；quick_check 仍为 ok，完整 verify 拒绝该备份库                                                                                     |
| 增量表重建          | 临时两版本迁移重建 post，保留 comment/post_tag/page_visit 关联；外键破坏迁移整笔回滚、ledger 不前进、开关恢复                                                 |
| 内容与展示          | 9/9：真实迁移/密码/登录与 Next 动态请求上下文，覆盖关系、发布、slug、精选、排期、搜索、设置、日志、公开条件和会话撤销                                         |
| 登录与互动          | 13/13：真实认证、重置期间失效、限流、评论幂等/级联、友链冲突、媒体租约/上传/引用/删除/清理；OSS 全部 mock                                                     |
| 运维与统计          | 7/7：全站搜索、通知、排期、运维设置、北京时间统计、访问采集、WAL 在线备份与新文件恢复/拒绝覆盖及坏格式                                                        |
| 原有登录与 SEO      | 登录 18/18、SEO 9/9；所有既有对外规则保持                                                                                                                     |
| 真实 HTTP           | `test:seo:integration` 1/1，独立临时 SQLite 与临时源码副本；覆盖 HTTP 登录、后台保存、文章发布撤回、公开索引与 robots/sitemap                                 |
| 类型与构建          | `npm run typecheck`、`npm run build` 通过；构建无需数据库连接或生成 Prisma contract                                                                           |
| 源码检查            | oxlint 无错误；保留的历史 PostgreSQL importer 有 2 条类型断言警告，不属于本阶段运行代码                                                                       |
| standalone 实际运行 | 本地 Node 24.21.0 / darwin-arm64，临时产物目录和独立 SQLite；原生文件、迁移资源、HTTP 登录、后台分类/通知、首页/文章列表/sitemap 通过，正常停止后清理临时目录 |

SQLite 正式回归总计 39 项，连同登录、SEO 与 HTTP 共 67 项。测试只访问新建临时 SQLite 文件，未运行 PostgreSQL 测试或访问真实 OSS。

## 修复后回归

- 将显式数据库/备份/恢复校验从 quick_check 升为 integrity_check，并补充索引页损坏复现；普通连接仍使用快速检查加版本/结构/外键校验。
- 修复事务内关闭外键无效的表重建问题，补充增量重建和失败回滚用例。
- 同步 getSession 的路由消费者去除多余 await，并重新验证真实 HTTP 流程。
- standalone 首次测试错误地使用 HTTP APP_ORIGIN，被原生产 HTTPS 校验拒绝。改为 HTTPS origin 模拟代理后的本机 HTTP 请求后验证通过，没有削弱应用校验。

## 未验证与后续范围

- 未执行 PostgreSQL → SQLite 真实数据迁移，也未导入历史 SQLite。迁移工具、业务数据数量/内容摘要核对和正式切换另行实施。
- Dockerfile、Compose、Portainer 环境模板与 Actions 保持历史双镜像 PostgreSQL 配置。它们不能直接部署当前 SQLite 源码，单镜像打包、启动自动备份/迁移、生产调度切换与实际 Portainer 回归仍未实施。
- 未进行 linux/amd64 Docker 构建与服务器原生验证；当前原生运行证据仅为本地 darwin-arm64。
- 没有浏览器 UI 布局改动，未做视觉截图验收；现有接口和服务行为通过源码、独立库及 HTTP 回归核对。
- 没有修改用户本地开发数据库、线上数据库或真实媒体对象，没有推送、发布或部署。

参考：[Drizzle SQLite](https://orm.drizzle.team/docs/sqlite/get-started-sqlite)、[Drizzle migrations](https://orm.drizzle.team/docs/migrations)、[better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)、[SQLite quick_check 与 integrity_check](https://sqlite.org/pragma.html#pragma_quick_check)。

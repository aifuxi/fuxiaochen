# fuxiaochen

## 路由与布局

`app/layout.tsx` 是全站共用的根布局，负责 `html/body`、全局暗色样式、字体、默认 metadata 和唯一的指针动效层。业务布局通过路由分组拆分，括号目录不进入 URL：

| 分组                          | 职责                                                                      | URL                  |
| ----------------------------- | ------------------------------------------------------------------------- | -------------------- |
| `app/(frontend)/`             | 前台页面，首页为 `page.tsx`，独立布局入口为 `layout.tsx`                  | `/` 及后续前台路径   |
| `app/(backend)/admin/`        | 管理后台，`layout.tsx` 负责会话校验、后台壳、文章查询与其他模块的演示状态 | `/admin`、`/admin/*` |
| `app/(auth)/login/`           | 登录页面及其专属样式                                                      | `/login`             |
| `app/(showcase)/design-spec/` | 设计系统展示及独立 metadata                                               | `/design-spec`       |

新增前台页面放在 `app/(frontend)/` 下，例如 `about/page.tsx` 对应 `/about`。前台共享导航、页脚等写在该分组的 `layout.tsx` 中，仅作用于前台页面，不影响后台、登录或设计展示。分组布局不重复声明 `html/body`，也不重复挂载指针动效。

`app/api/` 保持独立，登录与退出接口仍为 `/api/login` 和 `/api/logout`。链接、表单地址和重定向使用实际 URL，不包含分组名；不同分组中不能定义相同的 URL。

## 管理员登录

后台登录使用 Hono + Zod，管理员和会话保存在 Prisma 8 SQLite 数据库中。文章、分类与标签已接入数据库，评论、媒体及其他后台业务仍使用演示数据。

### 本地初始化

运行环境为 Node.js 24 或更高版本，使用 npm 和仓库 lockfile 安装依赖：

```sh
npm ci
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run admin:init
npm run dev
```

已有 `.env` 时手动补充配置，不要覆盖原文件：

```dotenv
DATABASE_PATH=./data/admin.sqlite
APP_ORIGIN=http://localhost:3000
```

`DATABASE_PATH` 是 SQLite 文件路径，相对路径从项目运行目录解析；不使用 `file:` URL。CLI 和服务端共用路径解析规则。`APP_ORIGIN` 必须与浏览器访问的 origin 完全一致，包括协议、主机和端口，不带尾部斜杠或路径。CLI 显式读取项目根目录 `.env`，已设置的进程环境变量优先；不要只将配置写到 `.env.local`。

`admin:init` 交互式创建唯一管理员，密码隐藏输入并需要确认，长度为 15–128 个字符。已有账号时拒绝覆盖。用户名区分大小写、长度 1–128 个字符，用户名和密码均不自动去除空白；没有公开注册入口。

账号管理脚本通过 Node 的 `react-server` 条件加载服务端模块，避免绕过 `server-only` 边界。管理员创建后访问 `/login`。登录凭据从数据库校验，不再使用 `ADMIN_USERNAME`、`ADMIN_PASSWORD` 或 `AUTH_SESSION_SECRET`；旧环境变量可以移除。升级后旧签名 Cookie 失效，需要重新登录。

### 会话与密码重置

密码使用 Argon2id（19 MiB 内存、2 次迭代、并行度 1）。会话使用 32 字节随机令牌，数据库只保存 SHA-256 哈希，浏览器通过 `fx_admin_session` Cookie 携带令牌。Cookie 设置 HttpOnly、SameSite=Strict、Path=/，有效期固定为 7 天，生产环境额外设置 Secure。

`POST /api/login` 接收表单，成功后 303 跳转 `/admin`，字段无效或凭据错误统一跳转 `/login?error=invalid`。重新登录更换令牌并撤销当前浏览器旧会话；成功登录时清理过期会话。`POST /api/logout` 撤销当前数据库会话后清除 Cookie，303 跳转 `/login`。

重置密码：

```sh
npm run admin:reset-password
```

新密码和全部会话撤销在同一事务完成。后台页面入口与 layout 使用共用服务端鉴权函数；以后增加后台 API 或服务端数据访问时，也需要在对应入口校验会话。

接口拒绝缺失或不匹配的 Origin（403），请求体上限 16 KiB（413），不支持的登录 Content-Type 返回 415。全站登录请求固定窗口限流为每分钟 20 次，计数保存在 SQLite 中；超过限制返回 429 和 Retry-After，所有账号输入共用额度。内部错误返回通用 503，不建立会话；日志不记录凭据和完整令牌。

### Prisma 8 版本与迁移

当前锁定 Prisma CLI `8.0.0-rc.19` 和 `@prisma/orm-sqlite` `8.0.0-rc.14`。Prisma 8 处于 RC，SQLite 官方标为 experimental。SQLite 包内置 `node:sqlite`，不使用 Prisma 7 的 Client 或 adapter。CLI 发布包带入较旧的 ORM toolchain，`package.json` overrides 将其对齐到 SQLite 包的 `8.0.0-rc.14`，并统一 CLI engine 为 `0.6.2`。CLI 间接依赖的 Hono、Node adapter、Valibot 和 Lodash 同样锁定到已修复审计漏洞的版本；升级时必须重新核对兼容性。

模型源为 `prisma/contract.ts`，配置为 `prisma.config.ts`。生成的 contract 在 `generated/prisma/`，开发启动和构建前自动生成。数据库和生成目录不提交；迁移及其 contract 快照需要提交。SQLite 包暂不支持声明 CHECK 约束，单管理员创建流程固定使用主键 1，没有创建其他管理员的接口。

修改 contract 后：

```sh
npm run db:generate
npm run db:plan -- --name describe-change
# 审查 prisma/migrations 中的迁移后应用
npm run db:migrate
```

`db:migrate` 创建数据库父目录、应用已规划迁移，并执行 `db verify` 检查数据库结构及 marker。它不规划新迁移，不初始化管理员。新生成的迁移入口中，`MigrationCLI.run` 返回 Promise，需使用顶层 `await` 以符合项目 lint 规则。

检查命令：

```sh
npm run typecheck
npm run lint
npm run format:check
npm run build
```

### 自托管部署

使用单实例 Node.js 服务或 Docker，设置 `APP_ORIGIN=https://你的域名` 和持久化磁盘上的绝对 `DATABASE_PATH`，提供可写目录。反向代理对外提供 HTTPS；请求保留浏览器 Origin，应用通过配置的 APP_ORIGIN 校验，不通过客户端转发头推断可信 origin。

构建前生成 contract；发布时在受控步骤执行 `npm run db:migrate`，首次部署通过 CLI 初始化管理员，再运行 `npm start`。迁移和账号管理命令依赖 devDependencies，执行这些步骤的环境需安装完整依赖。数据库目录必须挂载持久化卷，不将本机数据库打包进镜像，不依赖临时文件系统，也不在服务启动时自动重置账号或数据库。

## 分类与标签 API（第一阶段）

分类页、快捷分类弹窗和文章编辑器共享 `/api/admin/categories`、`/api/admin/tags` 数据。两个集合支持 GET 查询、POST 创建及 DELETE `/:id` 删除。POST 分类接收 `{ name, color }`，标签接收 `{ name }`；颜色可省略，默认为 `#0066df`。名称去除首尾空白、长度 1–40 个字符，唯一键按 NFC 规范化及小写转换；分类、标签分别唯一，数据库约束保证并发重名请求返回 409。

响应为 `{ data }`，分类包含 `id/name/color/createdAt/postCount`，标签包含 `id/name/createdAt/postCount`，时间为 ISO 字符串。列表按创建时间和 ID 升序排列；创建返回 201，删除返回 200 和 `{ data: { id } }`。错误为 `{ error: { code, message } }`：400 `INVALID_INPUT`、401 `UNAUTHORIZED`、403 `FORBIDDEN_ORIGIN`、404 `NOT_FOUND`、409 `DUPLICATE_NAME` 或 `RESOURCE_IN_USE`、413 `PAYLOAD_TOO_LARGE`、415 `UNSUPPORTED_MEDIA_TYPE`、503 `SERVICE_UNAVAILABLE`。JSON 请求最多 16 KiB，写请求必须携带与 APP_ORIGIN 一致的 Origin，所有后台业务响应禁止缓存，业务错误不重定向登录页。

本阶段不导入 Mock 数据，新库分类与标签为空。已有数据库执行 `npm run db:migrate` 应用新增表迁移，管理员与会话保持不变。若本地缺少 `db` ref，规划下一迁移时使用 `--from` 显式指定当前已应用的 contract 快照，不能从空库规划。

关联数量统计所有状态的文章；被文章引用的分类、标签无法删除，返回 409 `RESOURCE_IN_USE`。请先修改或删除关联文章，或移除文章中的标签。

构建可使用 `NEXT_BUILD_DIR=.next-build npm run build`，与现有开发服务器的 `.next` 输出隔离。

## 文章管理 API（第二阶段）

文章正文为纯文本，后台持久化文章及分类、标签关联，不自动导入演示文章，不提供前台文章接口。管理员、会话、已有分类和标签保留；本地与部署环境执行 `npm run db:migrate` 应用 `add_posts` 增量迁移，启动应用前生成最新 contract。已有开发进程需重启，以重新创建采用最新 contract 的数据库单例。

| 接口                                    | 行为                                                 |
| --------------------------------------- | ---------------------------------------------------- |
| `GET /api/admin/posts`                  | 筛选、字面搜索、分页查询摘要                         |
| `GET /api/admin/posts/summary`          | 全局状态数量与按排期时间升序的前 5 条排期            |
| `GET /api/admin/posts/:id`              | 完整详情，含正文和版本号                             |
| `POST /api/admin/posts`                 | 创建文章，返回 201                                   |
| `PUT /api/admin/posts/:id`              | 按版本完整更新，返回 200                             |
| `DELETE /api/admin/posts/:id?version=1` | 按确认时版本永久删除，返回 200 和 `{ data: { id } }` |

列表参数为 `q/status/categoryId/page/pageSize`。关键词去除首尾空白，最多 200 个字符，覆盖标题、正文、分类和标签；`instr(lower(...))` 使用绑定参数，按字面包含匹配，`%`、`_` 没有通配符含义。SQLite 内置 `lower` 忽略 ASCII 大小写，其他字符按字面匹配。页码从 1 开始，默认每页 8 条，最多 100 条；按创建时间、ID 降序排列，超出范围的页码回退到最后一页。列表响应 `{ data: { items, total, page, pageSize, pageCount, statusCounts } }`，`statusCounts` 始终为全局数量 `{ all, draft, published, scheduled }`。列表不含正文；摘要与详情包含分类 `{ id, name, color }` 和标签数组 `{ id, name }`，时间统一为 ISO 字符串。

创建输入为 `{ title, content, categoryId, tagIds, status, scheduledFor }`，更新额外要求 `version`。标题去除首尾空白后为 1–120 个字符；正文原样保存，必须包含非空白内容，最多 100,000 个字符。分类必选且已存在，标签可为空，重复 ID 去重，所有关联 ID 必须存在。状态为 `draft/published/scheduled`；非排期文章的 `scheduledFor` 必须为 `null`，排期文章传入含时区的 ISO 时间。界面使用北京时间。新设或调整排期必须晚于服务端当前时间；过期排期可保留原时间修改其他内容，不自动转为已发布。进入已发布时设置 `publishedAt`，普通编辑保留；转为其他状态清空，取消排期清空 `scheduledFor` 并转为草稿。

版本从 1 开始，每次更新增加 1，更新与删除拒绝旧版本并返回 409 `VERSION_CONFLICT`。文章及标签关联在同一事务写入；删除文章级联清理标签关联，分类、标签本身保留。错误沿用业务 JSON 格式，新增 `VERSION_CONFLICT`；输入校验失败可返回 `error.fieldErrors`。页面、API 和数据访问入口均鉴权，写事务内重新核对会话，同源与 Cookie 规则不变。仅文章 POST、PUT 请求体上限为 1 MiB，其他接口仍为 16 KiB。

编辑器在冲突时保留草稿，重新载入前确认替换；提交中禁止重复提交与关闭。写入成功后刷新文章、控制台摘要和分类标签数量，查询刷新失败单独显示重试，不将已完成的写入报成失败。全局搜索与排期管理同样分页读取数据库。排期入口仅管理真实文章，不再创建独立的演示计划；控制台其他统计仍标记演示，文章浏览量显示“尚未接入”。

### 人工验收场景（待执行）

项目默认不新增或运行测试；下列场景作为人工验收清单，不代表已经验证：

- 新建文章并选择分类、标签，刷新或重新登录后读取；编辑保留正文空白及关联变化。
- 超过 8 篇文章后跨页筛选搜索，检查全局状态数量；删除末页最后一篇后回退有效页。
- 搜索标题、正文、分类、标签及包含 `%`、`_` 的关键词；清空、切换筛选或关闭弹窗时旧请求不覆盖新结果。
- 被引用分类、标签删除返回冲突；文章永久删除后关联清理，未被引用的分类、标签可删除。
- 设置未来排期、调整或取消排期；过期排期保留状态并提示，原时间不变时仍可编辑正文。
- 两个浏览器页面编辑同一文章，旧版本保存保留草稿；旧版本删除要求重新确认，失败不修改关联。
- 未登录、会话撤销、错误 Origin、无效 ID、空白正文、不存在的关联、非法 JSON、错误 Content-Type、请求体超限及服务失败，检查错误反馈与重试。
- 保存成功后列表刷新失败，检查写入成功反馈与独立查询错误；检查加载、空数据、重复提交、键盘焦点和减少动态效果。

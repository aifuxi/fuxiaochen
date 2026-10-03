# fuxiaochen

历史验收清单与验证记录见 [历史验收记录](docs/engineering/verification-history.md)。

## 路由与布局

`app/layout.tsx` 是全站共用的根布局，负责 `html/body`、全局暗色样式、字体、默认 metadata 和唯一的指针动效层。业务布局通过路由分组拆分，括号目录不进入 URL：

| 分组                          | 职责                                                     | URL                  |
| ----------------------------- | -------------------------------------------------------- | -------------------- |
| `app/(frontend)/`             | 前台页面，首页为 `page.tsx`，独立布局入口为 `layout.tsx` | `/` 及后续前台路径   |
| `app/(backend)/admin/`        | 管理后台，`layout.tsx` 负责会话校验、后台壳与业务上下文  | `/admin`、`/admin/*` |
| `app/(auth)/login/`           | 登录页面及其专属样式                                     | `/login`             |
| `app/(showcase)/design-spec/` | 仅开发环境开放的设计系统展示                             | `/design-spec`       |

新增前台页面放在 `app/(frontend)/` 下，例如 `about/page.tsx` 对应 `/about`。前台共享导航、页脚等写在该分组的 `layout.tsx` 中，仅作用于前台页面，不影响后台、登录或设计展示。分组布局不重复声明 `html/body`，也不重复挂载指针动效。

`app/api/` 保持独立，登录与退出接口仍为 `/api/login` 和 `/api/logout`。链接、表单地址和重定向使用实际 URL，不包含分组名；不同分组中不能定义相同的 URL。

## 管理员登录

后台登录使用 Hono + Zod，管理员和会话保存在 Prisma 8 SQLite 数据库中。文章、分类、标签、评论、设置、友链、更新日志及访问统计由数据库提供，媒体文件保存在 OSS。仪表盘汇总真实文章、评论和访问统计，全局检索、通知与数据库备份也由服务端提供。

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

## 分类与标签 API

分类页、快捷分类弹窗和文章编辑器共享 `/api/admin/categories`、`/api/admin/tags` 数据。两个集合支持 GET 查询、POST 创建及 DELETE `/:id` 删除。POST 分类接收 `{ name, color }`，标签接收 `{ name }`；颜色可省略，默认为 `#0066df`。名称去除首尾空白、长度 1–40 个字符，唯一键按 NFC 规范化及小写转换；分类、标签分别唯一，数据库约束保证并发重名请求返回 409。

响应为 `{ data }`，分类包含 `id/name/color/createdAt/postCount`，标签包含 `id/name/createdAt/postCount`，时间为 ISO 字符串。列表按创建时间和 ID 升序排列；创建返回 201，删除返回 200 和 `{ data: { id } }`。错误为 `{ error: { code, message } }`：400 `INVALID_INPUT`、401 `UNAUTHORIZED`、403 `FORBIDDEN_ORIGIN`、404 `NOT_FOUND`、409 `DUPLICATE_NAME` 或 `RESOURCE_IN_USE`、413 `PAYLOAD_TOO_LARGE`、415 `UNSUPPORTED_MEDIA_TYPE`、503 `SERVICE_UNAVAILABLE`。JSON 请求最多 16 KiB，写请求必须携带与 APP_ORIGIN 一致的 Origin，所有后台业务响应禁止缓存，业务错误不重定向登录页。

不导入 Mock 数据，新库分类与标签为空。已有数据库执行 `npm run db:migrate` 应用新增表迁移，管理员与会话保持不变。若本地缺少 `db` ref，规划下一迁移时使用 `--from` 显式指定当前已应用的 contract 快照，不能从空库规划。

关联数量统计所有状态的文章；被文章引用的分类、标签无法删除，返回 409 `RESOURCE_IN_USE`。请先修改或删除关联文章，或移除文章中的标签。

构建可使用 `NEXT_BUILD_DIR=.next-build npm run build`，与现有开发服务器的 `.next` 输出隔离。

## 文章块编辑器

后台正文使用锁定在 `3.31.4` 的 Tiptap 开源包及本地 Base UI 控件，不使用官方付费 Notion 模板、Start 订阅、云协作或 AI 服务。支持 `/` 搜索插入、选中文字的浮动格式菜单、拖拽排序及键盘可用的复制/删除/上移/下移操作；图片沿用现有媒体库与 OSS 上传流程。可插入标题、普通列表、任务列表、引用、代码块、分隔线和表格，表格支持行列增删。

`Post.content` 继续使用 SQLite TEXT，不增加数据库迁移。API 的 `content` 仍为字符串：新内容序列化为 `{ format: "fuxiaochen-tiptap", version: 1, document, text }`，其中 `document` 是 Tiptap JSON，`text` 由服务端重新生成用于搜索。JSON 原始字符串最多 500,000 字符，可见文本最多 100,000 字符；文档深度最多 32、节点最多 20,000，表格列数及单元格跨度最多 100。写请求仍受既有 1 MiB 请求体限制，规范化后的正文预留其他字段所需空间。节点、属性、链接和图片协议均经过校验；公开页面使用共用节点定义静态渲染，不输出原始 HTML。

正文只接受块文档 JSON，后台与前台不再读取或渲染 Markdown，搜索只读取文档的 `text`。工具条“导入 Markdown”支持 UTF-8 的 `.md`／`.markdown` 文件和粘贴源码；文件最多 1 MiB，源码最多 100,000 字符。导入插入打开弹窗时的光标位置，不替换选区、不修改标题或文章设置，合并后的正文须通过现有完整校验。导入作为一次可撤销操作，不自动保存；失败保留源码和原正文。转换保留标题、列表、任务、引用、代码、表格、图片和链接；HTML 和未支持的语法作为文字保留。

### 旧文章正文迁移

现有 Markdown 文章必须先迁移，再启动仅支持块文档的应用。命令复用 `DATABASE_PATH`（默认 `./data/admin.sqlite`），不改变数据库结构，也不调用 Prisma 7 接口。仍使用 Prisma CLI `8.0.0-rc.19` 与 SQLite 包 `8.0.0-rc.14`（RC；[SQLite 支持为 experimental](https://www.prisma.io/extensions/sqlite)），写入通过已安装包的 Prisma 8 `db.transaction` 完成。

1. 停止应用和所有使用目标数据库的写入进程。
2. 执行 `npm run posts:migrate-content -- --dry-run`，只读预检查全部文章；无效正文会阻止迁移并报告文章 ID。
3. 执行 `npm run posts:migrate-content -- --write`。命令先通过 SQLite backup API 创建包含 WAL 数据的完整备份，输出备份路径，再在单个事务内转换全部旧文章。事务前校验文章快照没有变化，失败整体回滚。
4. 再执行只读预检查，确认待迁移数量为零，然后启动应用。

只更新旧文章的正文和版本（`version + 1`），保留全部时间、发布状态、slug、分类、标签和评论。已是块文档的文章跳过，重复执行不再修改。备份位于数据库旁，含完整业务及鉴权数据，保留在本地且不得提交。恢复时先停止所有连接，使用 SQLite 恢复备份，配套恢复支持旧格式的应用版本。此命令不会发布或部署应用。

## 文章管理 API

文章正文通过开源 Tiptap 块编辑器编辑；所有文章使用带格式标记的 JSON 字符串，Markdown 仅作为导入来源。后台持久化文章及分类、标签关联，不自动导入演示文章；公开阅读入口见下方“博客前台”。管理员、会话、已有分类和标签保留；本地与部署环境执行 `npm run db:migrate` 应用 `add_posts` 增量迁移，启动应用前生成最新 contract。已有开发进程需重启，以重新创建采用最新 contract 的数据库单例。

| 接口                                    | 行为                                                 |
| --------------------------------------- | ---------------------------------------------------- |
| `GET /api/admin/posts`                  | 筛选、字面搜索、分页查询摘要                         |
| `GET /api/admin/posts/summary`          | 全局状态数量与按排期时间升序的前 5 条排期            |
| `GET /api/admin/posts/:id`              | 完整详情，含正文和版本号                             |
| `POST /api/admin/posts`                 | 创建文章，返回 201                                   |
| `PUT /api/admin/posts/:id`              | 按版本完整更新，返回 200                             |
| `DELETE /api/admin/posts/:id?version=1` | 按确认时版本永久删除，返回 200 和 `{ data: { id } }` |

列表参数为 `q/status/categoryId/page/pageSize`。关键词去除首尾空白，最多 200 个字符，覆盖标题、正文、分类和标签；`instr(lower(...))` 使用绑定参数，按字面包含匹配，`%`、`_` 没有通配符含义。SQLite 内置 `lower` 忽略 ASCII 大小写，其他字符按字面匹配。页码从 1 开始，默认每页 8 条，最多 100 条；按创建时间、ID 降序排列，超出范围的页码回退到最后一页。列表响应 `{ data: { items, total, page, pageSize, pageCount, statusCounts } }`，`statusCounts` 始终为全局数量 `{ all, draft, published, scheduled }`。列表不含正文；摘要与详情包含分类 `{ id, name, color }` 和标签数组 `{ id, name }`，时间统一为 ISO 字符串。

创建输入为 `{ title, slug, content, categoryId, tagIds, status, scheduledFor }`，更新额外要求 `version`。标题去除首尾空白后为 1–120 个字符；正文的可见文本最多 100,000 个字符，必须包含非空白文本或图片；接口仅接受带格式标记的块文档 JSON 字符串，经服务端校验与规范化后保存；Markdown 源码输入返回校验错误。分类必选且已存在，标签可为空，重复 ID 去重，所有关联 ID 必须存在。状态为 `draft/published/scheduled`；非排期文章的 `scheduledFor` 必须为 `null`，排期文章传入含时区的 ISO 时间。界面使用北京时间。新设或调整排期必须晚于服务端当前时间；过期排期可保留原时间修改其他内容，不自动转为已发布。首次发布设置 `publishedAt` 与 `slugLockedAt`，编辑、退回草稿及重新发布均保留首次时间；取消排期清空 `scheduledFor` 并转为草稿。

版本从 1 开始，每次更新增加 1，更新与删除拒绝旧版本并返回 409 `VERSION_CONFLICT`。文章及标签关联在同一事务写入；删除文章级联清理标签关联及全部评论回复，分类、标签本身保留。错误沿用业务 JSON 格式，新增 `VERSION_CONFLICT`；输入校验失败可返回 `error.fieldErrors`。页面、API 和数据访问入口均鉴权，写事务内重新核对会话，同源与 Cookie 规则不变。仅文章 POST、PUT 请求体上限为 1 MiB，其他接口仍为 16 KiB。

编辑器在冲突时保留草稿，重新载入前确认替换；提交中禁止重复提交与关闭。写入成功后刷新文章、控制台摘要和分类标签数量，查询刷新失败单独显示重试，不将已完成的写入报成失败。全局搜索与排期管理同样分页读取数据库。排期到期后由外部调度执行，后台也可手动执行到期计划。文章列表不展示浏览量，文章访问表现可在数据分析页查询。

## 媒体资产库 API

媒体库与全局上传入口改为浏览器预签名直传阿里云 OSS，SQLite 保存上传者、原始文件名、字节数、SHA-256、图片宽高、对象 key 和处理状态。不自动上传或导入 `public/media` 的参考图片。

依赖锁定 AWS S3 SDK / presigner `3.1145.0`、`@alicloud/credentials` `2.4.7` 和 `sharp` `0.35.5`。Prisma 继续使用 CLI `8.0.0-rc.19`、SQLite `8.0.0-rc.14`（RC / experimental），通过 contract 和增量迁移新增 `media`、`media_upload_limit`，保留原有数据。升级时执行 `npm run db:migrate`，重启已有开发进程，使数据库单例使用最新 contract。

### 本地 OSS 连接与凭证

应用和清理 CLI 均在本地 Node.js 环境运行，文件仍上传到真实阿里云 OSS。使用 OSS 默认外网域名和环境变量中的 RAM 用户凭证，无需配置 ECS、RAM Role、自定义域名、CNAME 或自有 HTTPS 证书。

将 `.env.example` 的 OSS 字段补充到已有项目根目录 `.env`，不要覆盖数据库及应用配置。配置只在服务端读取，不使用 `NEXT_PUBLIC_`，不要将凭证提交到仓库；修改连接或凭证后重启应用。

| 配置                                                              | 本地填写方式                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `OSS_BUCKET` / `OSS_REGION`                                       | 实际桶名和地域，例如 `my-media-bucket`、`cn-hangzhou`                                        |
| `OSS_SERVER_ENDPOINT`                                             | `https://s3.oss-{region}.aliyuncs.com`，本地服务端用此地址核验、复制和删除对象               |
| `OSS_UPLOAD_ENDPOINT`                                             | 与服务端填相同的默认 S3 外网服务 endpoint，浏览器用它生成的预签名 URL 上传                   |
| `OSS_SERVER_ENDPOINT_MODE` / `OSS_UPLOAD_ENDPOINT_MODE`           | 两项均为 `service`，SDK 使用 virtual-hosted 寻址自动添加桶名                                 |
| `OSS_PUBLIC_ORIGIN`                                               | 默认 Bucket HTTPS 访问地址：`https://{bucket}.oss-{region}.aliyuncs.com`，不含路径或查询参数 |
| `OSS_CREDENTIAL_MODE`                                             | 固定填 `environment`                                                                         |
| `ALIBABA_CLOUD_ACCESS_KEY_ID` / `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | 最小权限 RAM 用户 AccessKey，仅填到未提交的 `.env`                                           |
| `ALIBABA_CLOUD_SECURITY_TOKEN`                                    | RAM 用户 AccessKey 时留空；使用临时 STS 凭证时填写 token，过期后手动更新并重启               |

例如，Bucket 为 `my-media-bucket`、地域为 `cn-hangzhou` 时，两个服务 endpoint 都填 `https://s3.oss-cn-hangzhou.aliyuncs.com`，公开访问地址填 `https://my-media-bucket.oss-cn-hangzhou.aliyuncs.com`。公开地址与上传服务地址的格式不同，不要混用；示例里的 `your-bucket` 必须手动替换，配置不会自动插入 `OSS_BUCKET` 或 `OSS_REGION`。本地不要使用 `-internal` 内网 endpoint，不改写签名后的 URL。

默认公网域名的可用性须先核对。根据 [阿里云 AWS SDK 接入文档](https://www.alibabacloud.com/help/zh/oss/developer-reference/use-aws-sdks-to-access-oss)，自 2025-03-20 起新开通 OSS 服务的用户在中国内地地域无法通过默认外网域名调用上传、下载等数据 API。若账号与 Bucket 命中此限制，本方案无法完成真实联调，本地运行或修改 `.env` 不能解除云端策略。遇到 `0002-00000033` 时按 [S3 兼容鉴权错误说明](https://help.aliyun.com/en/oss/user-guide/0002-00000033) 确认账号的兼容鉴权能力。配置缺失时上传返回 503 `STORAGE_NOT_CONFIGURED`，空库仍可查询。

默认域名可能按地域、Bucket 创建时间和文件类型强制返回下载响应头。图片的永久链接在浏览器直接打开时可能下载，即使应用发布时设置了 `inline`；图片网格与预览以真实浏览器行为验收，不承诺默认域名始终支持在线打开。参见 [OSS 默认域名强制下载规则](https://help.aliyun.com/zh/oss/how-to-ensure-an-object-is-previewed-when-you-access-the-object/)。附件始终按应用规定强制下载。

S3 SDK 的 request / response checksum 模式为 `WHEN_REQUIRED`，避免不兼容的默认 CRC / aws-chunked 请求；应用仍逐字节计算 SHA-256，校验真实内容，兼容性回退 PUT 额外发送 Content-MD5。不能将 ETag 当作 SHA-256 或通用内容校验和。参见 [AWS checksum 配置](https://docs.aws.amazon.com/sdkref/latest/guide/feature-dataintegrity.html)。

### 权限、跨域与生命周期模板

Bucket ACL 保持 private；正式 key 为 `media/<随机 UUID>`，临时 key 为 `staging/<随机 UUID>`。以下模板的账号和桶名须替换为实际值，Bucket Policy 不使用 AWS 的 ARN 或 Action 名称。

本地服务端使用的 RAM 用户仅需对象读写与删除，不需要建桶、修改 ACL、匿名写入或列举权限：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["oss:GetObject", "oss:PutObject", "oss:DeleteObject"],
      "Resource": ["acs:oss:*:<账号ID>:<Bucket>/staging/*", "acs:oss:*:<账号ID>:<Bucket>/media/*"]
    }
  ]
}
```

Bucket Policy 仅允许匿名读取正式前缀（包含公开图片与所有正式附件）；其余对象按私有 ACL 与 RAM 权限控制：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": ["*"],
      "Action": ["oss:GetObject"],
      "Resource": ["acs:oss:*:<账号ID>:<Bucket>/media/*"],
      "Condition": { "Bool": { "acs:SecureTransport": "true" } }
    }
  ]
}
```

核对桶及账号的阻止公共访问配置，使此限定前缀的策略能够生效；不要改为整桶 public-read。确认匿名请求不能读取 `staging/`、列举对象或上传文件。参见 [Bucket Policy](https://help.aliyun.com/zh/oss/user-guide/oss-bucket-policy/) 与 [S3 兼容范围](https://help.aliyun.com/zh/oss/developer-reference/compatibility-with-amazon-s3)。

OSS 控制台 CORS 设置：AllowedOrigin 为本地实际 `APP_ORIGIN`（示例为 `http://localhost:3000`；用 `127.0.0.1` 或其他端口访问时须同步修改应用配置与 CORS），AllowedMethod 为 PUT，AllowedHeader 为 `Content-Type`，ExposeHeader 可留空，MaxAgeSeconds 为 300；不要使用通配 Origin。浏览器不携带 Cookie 或直接接收访问凭证。对象读取若不需要跨域脚本访问，无需额外开放 GET CORS。

上传 URL 绑定 `Content-Type: application/octet-stream` 和精确字节数。浏览器自动设置已签名的 Content-Length，不手动添加该禁止写入的请求头；对象元数据、尺寸及摘要仍需服务端复核。正式图片按真实格式返回 MIME / inline；其他附件统一返回 `application/octet-stream` / attachment，并使用 RFC 5987 编码下载文件名，SVG、HTML、脚本和可执行文件不内嵌打开、不解压或执行。上传不执行病毒扫描。

在 OSS 控制台为 `staging/` 配置 1 天过期删除规则；不要对 `media/` 配置过期删除。上传不使用分片，不需要应用侧分片清理。本地运行期间每 15 分钟执行清理 CLI，可先用 `--dry-run` 查看待处理数量：

```sh
npm run media:cleanup -- --dry-run
npm run media:cleanup
```

如需本地定时执行，可使用操作系统的任务调度；以下为 cron 模板，须替换项目路径和通过 `command -v npm` 查到的 npm 绝对路径，并设置包含 Node.js >=24 的 PATH：

```cron
*/15 * * * * cd /absolute/path/to/fuxiaochen && /absolute/path/to/npm run media:cleanup >> ./data/media-cleanup.log 2>&1
```

电脑关机或休眠时本地任务不会运行；恢复开发后执行一次清理。OSS 的 `staging/` 生命周期规则在云端继续生效。

CLI 读取与应用相同的 `.env`、数据库路径及凭证，正常退出释放数据库和 SDK 资源，失败返回非零退出码。`--dry-run` 只统计待处理记录，不请求 OSS 或修改记录。清理过期 pending、租约到期 finalizing、未完成删除及墓碑；ready 记录只回收临时对象，不删除正式文件。墓碑保留至少一天并重复回收残留，兜底处理签名重放和中断操作；临时目录生命周期继续处理迟到的临时对象。

### 接口与状态规则

| 接口                                         | 输入与响应                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /api/admin/media`                       | `q/kind/page/pageSize`；返回 `{ data: { items, total, page, pageSize, pageCount } }`  |
| `POST /api/admin/media/uploads`              | `{ name, kind, bytes, sha256 }`；201 返回 `{ data: { id, url, headers, expiresAt } }` |
| `POST /api/admin/media/uploads/:id/complete` | 空 JSON 对象 `{}`；返回已保存记录，重复完成返回同一记录                               |
| `DELETE /api/admin/media/:id`                | 返回 `{ data: { id } }`，墓碑保留期内重复删除成功                                     |

kind 为 `image/attachment`。q 去除首尾空白、最多 200 字符，SQLite 字面包含搜索（ASCII 忽略大小写），`%`、`_` 没有通配含义。默认每页 12 条，最大 100；超范围页码回退最后一页；按创建时间、ID 降序。列表包含 ready 及已发布文件的 deleting 记录，返回真实字节数、MIME、宽高与 ISO 时间，deleting 记录 url 为 null，禁止复制和预览。

仅 JPEG、PNG、WebP、AVIF、GIF 可按图片处理，最大 20 MiB，所有帧合计最大 4000 万像素；其他文件没有扩展名限制，最大 100 MiB，零字节与非法文件名拒绝。大小限制统一定义在 `lib/media/schema.ts`，前端、API 与存储核验共用，不需要修改 OSS 配置。图片真实格式、解码、宽高来自 sharp，不信任客户端 MIME 或尺寸。上传者可将任意文件作为附件，但附件始终强制下载。

签名有效期 5 分钟，允许已开始的 PUT 结束后完成核验；浏览器单次上传超时为 15 分钟，上传记录完成窗口为 30 分钟。每管理员固定窗口每分钟最多 20 次签发，未完成记录最多 20 个，超限返回 429 和 Retry-After。失败签发标记为待回收墓碑，不占未完成额度。

流程为 pending → finalizing → ready → deleting → deleted。finalizing / deleting 使用随机处理租约，最长 10 分钟，核验与发布总时限 5 分钟，短于处理租约；SDK 单次请求超时为 5 分钟，删除仍使用独立的 1 分钟终止信号。网络请求不放在 SQLite 写事务内。完成前及写事务内重新核对会话。校验失败或超时不返回永久 URL；按已验证 ETag 条件复制，条件复制明确不支持时仅从已核验临时文件 PUT，不退回无条件复制。正式目录不给浏览器写入 URL，因此临时签名重放不会覆盖正式文件。DB 失败补偿删除正式对象，补偿失败保留租约供清理恢复。删除失败保留 deleting 并可重试，OSS 文件与数据库状态均成功更新后才提示已删除。

所有接口要求管理员会话，写请求校验 Origin，JSON 上限 16 KiB，不缓存业务响应。错误沿用 `{ error: { code, message } }`，包括 400 `INVALID_INPUT/UPLOAD_EXPIRED`、401 `UNAUTHORIZED`、403 `FORBIDDEN_ORIGIN`、404 `NOT_FOUND`、409 `PROCESSING`、413 `PAYLOAD_TOO_LARGE`、415 `UNSUPPORTED_MEDIA_TYPE`、429 `RATE_LIMITED`、503 `STORAGE_NOT_CONFIGURED/STORAGE_UNAVAILABLE/SERVICE_UNAVAILABLE`。日志不记录 URL 签名、凭证、Cookie 或原始 SDK 异常内容。

前端最多并行处理 2 个文件，显示准备、上传进度、服务端核验、成功及逐项失败。准备阶段使用 `@noble/hashes@2.4.0` 按 4 MiB 分块读取并计算整个文件的 SHA-256，避免一次加载整个大文件，取消后停止继续读取；这不是 OSS 分片上传，浏览器仍直接发送原始 File。已上传但完成失败时优先重试完成，不重复上传；过期或失效记录重新申请。批量部分失败不抹掉成功结果，站内切换保留上传状态。写成功后独立刷新查询，查询失败单独重试，不将已成功保存报成失败。删除是永久操作，引用该 URL 的文章或外部页面会出现失效链接；正文尚未提供媒体引用追踪。

## 评论管理 API

评论管理页、控制台待审核数量与前五条摘要、侧栏徽标统一读取 SQLite。评论保存真实文章 ID、父评论 ID、留言者、可选邮箱、纯文本正文、审核状态、ISO 时间与版本号；展示时间为北京时间，博主回复的身份和名称从当前管理员会话取得，不使用占位邮箱。不导入 Mock 评论。

依赖继续使用 Hono `4.13.12`、Zod `4.6.5`、Prisma CLI `8.0.0-rc.19` 和 `@prisma/orm-sqlite` `8.0.0-rc.14`（RC / experimental），没有新增依赖。增量迁移只新增 `comment` 表及索引，执行 `npm run db:migrate`，随后重启已有应用进程，让数据库单例载入新 contract；CLI 与应用继续使用相同数据库路径。

| 接口                                   | 输入与响应                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `GET /api/admin/comments`              | `q/status/postId/page/pageSize`，返回 `{ data: { items, total, page, pageSize, pageCount, statusCounts } }` |
| `GET /api/admin/comments/summary`      | 返回 `{ data: { statusCounts, pending } }`；pending 为最新五条待审核评论                                    |
| `GET /api/admin/comments/:id`          | 返回单条评论及文章标题、直接父评论摘要                                                                      |
| `POST /api/admin/comments`             | `{ postId, author, email, content }`，201 返回待审核根评论                                                  |
| `PUT /api/admin/comments/:id/status`   | `{ status, version }`，status 为 `approved/rejected`，返回更新后评论                                        |
| `POST /api/admin/comments/:id/replies` | `{ content, version }`，201 返回已通过的博主回复                                                            |
| `DELETE /api/admin/comments/:id`       | query 中要求 `version`，返回 `{ data: { id } }`                                                             |

所有接口均要求管理员会话，页面与数据访问入口也执行鉴权。根评论写入接口用于已授权后台录入或后续来源对接，目前没有后台新增评论表单；匿名留言与公开查询使用独立的 `/api/public` 入口，见下方“博客前台”；新增根评论始终为 pending，不能通过请求伪造博主身份、父评论、审核状态或时间。公开入口的限流和隐私规则见下方说明。写请求校验 Origin，JSON 上限 16 KiB，不缓存响应；JSON 写入使用严格 Zod 对象，拒绝未知字段，业务层只接收校验后的输入。[Hono 校验文档](https://hono.dev/docs/guides/validation)与 [Zod schema 文档](https://zod.dev/api)说明输入校验方式。

根评论文章必须存在，author 去除首尾空格后为 1–80 个字符，email 为有效邮箱且最多 254 字符，正文去除首尾空格后为 1–2000 个字符。正文只按文本渲染，不执行 HTML，内部换行保留。状态为 `pending/approved/rejected`；页面使用中文标签，统计包含读者评论与博主回复，状态数量不受搜索筛选影响。q 最多 200 个字符，按留言者、邮箱、正文、文章当前标题进行 SQLite 字面包含搜索（ASCII 忽略大小写，`%`、`_` 不作为通配符）；默认每页 8 条、最多 100 条，按创建时间与 ID 降序，超范围页码回退最后一页。每次读取的列表、关联、数量与摘要均使用事务快照，并与写入共用队列。

版本从 1 开始，审核、回复和删除要求当前版本，旧版本返回 409 `VERSION_CONFLICT`。回复创建与父评论版本递增在同一事务完成，同一版本重试不会重复创建；响应丢失后应先重新载入，确认现有回复再决定是否继续提交。回复目标和所有祖先均须已通过审核；最大深度 16 层（根评论为第 1 层）。回复只继承目标文章 ID，关系不允许修改，数据库复合外键禁止跨文章回复。拒绝评论会在同一事务拒绝全部后代并更新其版本；重新通过父评论不会自动恢复子评论，需逐条重新审核。父评论删除级联删除其所有后代，文章删除级联删除全部评论与回复；删除提示明确说明影响且要求确认。管理员移除时保留回复历史并清空管理员外键。

错误格式为 `{ error: { code, message, fieldErrors? } }`，包括 400 `INVALID_INPUT`、401 `UNAUTHORIZED`、403 `FORBIDDEN_ORIGIN`、404 `NOT_FOUND`、409 `VERSION_CONFLICT`、413 `PAYLOAD_TOO_LARGE`、415 `UNSUPPORTED_MEDIA_TYPE`、503 `SERVICE_UNAVAILABLE`；不向客户端暴露内部异常，不记录评论正文、邮箱、Cookie 或原始数据库异常。

页面覆盖加载、空库、无匹配结果、读取失败重试和写入中状态；不会用空状态掩盖查询错误。版本冲突保留回复草稿，重新载入原评论后显式确认提交；删除冲突也须重新载入并确认。写入成功后刷新列表、摘要与侧栏数量，后续查询失败独立反馈，不将成功写入报为失败。删除完成后焦点回到评论搜索框，控制台删除后回到“查看全部”；取消和回复关闭优先返回原触发按钮。审核与回复不发送邮件或通知。

## 站点设置 API

`GET /api/admin/settings` 读取完整设置，`PUT /api/admin/settings` 提交设置与 `socials` 全量列表，响应均为 `{ data: ... }`。PUT 包含当前 `version`，成功递增版本并返回 ISO `updatedAt`；旧版本返回409 `VERSION_CONFLICT`，页面保留草稿，重新载入需要确认替换。站点默认设置在首次读取时于事务内初始化，备案为空、统计关闭、社交为空，不导入演示数据。字段与默认值以 `lib/settings/schema.ts` 为准。单例记录 ID 为1，社交记录保留 UUID，按列表顺序原子替换；最多20条，同平台可重复。

两类备案各配置展示文案与 HTTPS 查询链接，整项留空不展示；填写时两字段完整。社交账号配置 `label/url/icon/imageUrl/enabled`，链接只接受不含凭据的 HTTP(S)，图片接受 HTTPS 或站内绝对路径；不接收 SVG／HTML 代码。预置图标来自已有 Lucide：代码、视频、相机等通用图标对应平台名称，不包含品牌商标素材。图片失败显示通用图标。单次设置请求上限256 KiB，其余小型接口仍为16 KiB；严格 Zod 校验拒绝未知字段，字段错误使用点分路径，如 `socials.0.url`。

设置由前台服务端按请求读取，首页资料、metadata、备案与启用社交账号在保存后完整刷新生效，不需重新构建。公开读取只输出展示字段和启用的统计 ID，不输出设置版本或开发配置；分页数量与评论开关供公开服务使用。阅读数量控制前台文章分页，评论开关控制新评论和回复，关闭后历史公开评论保留；设置页只提供已实现的配置项，数据库自动备份在控制台备份面板管理，不提供 AI 服务。

Google 支持 GA4 `G-…` Measurement ID，百度使用统计代码 `hm.js?` 后的32位十六进制站点 ID。二者分别启停，默认关闭，可同时启用；这些公开 ID 不是服务端密钥。固定脚本域名为 `www.googletagmanager.com` 与 `hm.baidu.com`，不允许配置任意脚本。仅生产环境前台布局加载，开发模式、后台、登录与设计展示页不加载。首次访问和路径变化手动发送 PV，查询参数与 hash 不进入手动 PV 路径；脚本加载失败不阻塞页面。后台分析使用本地访问采集，不读取第三方统计报表。

GA4 使用 `send_page_view: false`；同时必须在 GA4 的 Web 数据流 → 增强型衡量 → 网页浏览中关闭“基于浏览器历史记录事件的网页更改”，否则仍会重复收集历史变化 PV。参见 [Google 官方页面浏览说明](https://developers.google.com/analytics/devguides/collection/ga4/views)。百度在脚本前初始化 `_setAutoPageview: false`，用 `_trackPageview` 上报路径，参见 [百度官方说明](https://tongji.baidu.com/web/help/article?id=235&type=0)。真实收数需配置有效账号，并在生产环境核对平台实时报告。

沿用 Hono4.13.12、Zod4.6.5、Prisma CLI8.0.0-rc.19 和 SQLite runtime8.0.0-rc.14（RC／experimental）。新增迁移只创建 `site_setting/social_account`；执行 `npm run db:migrate` 后重启已有应用进程，使数据库单例载入新 contract。无 `db` ref 时规划迁移须通过 `--from <上一迁移的目标hash>` 明确起点，避免以空库为起点。CLI与应用继续共享 `DATABASE_PATH`。

## 友情链接 API

`GET/POST /api/admin/friends-links` 提供分页查询与创建；`GET/PUT/DELETE /api/admin/friends-links/:id` 读取、编辑、删除单条。输入模型见 `lib/friends-links/schema.ts`，创建不接受status，服务端固定为pending；编辑需包含完整字段和version，删除在query携带version。审核为pending/approved/rejected，enabled独立表示展示偏好；只有approved且enabled才在前台展示，没有健康检测，也不访问所填URL。

查询支持q/category/status/enabled/page/pageSize；enabled为true/false字符串，默认8条、最多100条，按创建时间与ID降序，超范围页码回退末页。q搜索名称、链接、简介，SQLite字面包含匹配，ASCII忽略大小写，百分号和下划线不作通配符。列表返回 `{ data: { items, total, page, pageSize, pageCount } }`，时间为ISO，版本从1开始。更新和删除旧版本返回409 VERSION_CONFLICT，不静默覆盖；编辑冲突保留草稿，显式放弃草稿重新载入后才能保存，删除冲突须重新载入并再次确认。

同样要求会话、Origin、严格JSON与16 KiB上限，使用统一JSON错误，不泄漏内部异常。名称1–100字符，简介最多500字符，链接不含凭据，图标接受HTTPS或站内绝对路径。空库不导入Mock。新增friend_link表及索引，应用迁移后重启已有进程。验收关注持久化、审核与展示组合、字面搜索、分页回退、冲突、会话失效、查询失败与写入成功后刷新失败的分别反馈。

## 更新日志 API

`GET /api/admin/changelog` 使用q/page/pageSize查询，返回 `{ data: { items, total, page, pageSize, pageCount } }`；`POST /api/admin/changelog` 接收 `{ version, title, type, changes }`，201返回保存的记录。接口只提供读取与新增，不提供修改、删除或软件部署。version是1–80字符的展示文案，不要求SemVer或唯一；title为1–200字符；type为feature/fix/performance/security；changes为最多20项的字符串数组，每项1–200字符，也可为空。空条目显示“未填写更新详情”，不会补造内容。

服务端生成UUID和创建时间，条目经过Zod校验后存为JSON文本。默认每页8条、最多100条，按创建时间和ID降序；字面搜索版本、主题与实际条目内容，百分号和下划线不作通配符。API返回ISO时间，界面以Asia/Shanghai显示北京时间。新增release_log表及索引，迁移不导入演示数据。

页面按需查询，覆盖加载、空库、搜索无结果、读取失败重试、发布中禁用与字段错误焦点。成功写入与后续查询失败分别反馈。发布响应不确定时保留草稿、禁止继续发布；先查询核对相同版本的最新记录及时间，再明确确认未发布才能重新提交，避免自动重试造成重复记录。接口沿用管理员鉴权、Origin校验、16 KiB限制及严格JSON错误格式，未知字段、非法类型和超长条目拒绝。

## 博客前台

前台与后台共用 SQLite，公开服务位于 `lib/public/`，全部页面按请求读取真实数据，构建不会固化文章或设置。没有读者账号、邮件通知或友链申请；排期发布由外部调度执行。访问采集独立配置，默认关闭，见“本地访问采集”。

| 路径                   | 行为                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| `/`                    | 站点介绍与独立文章页入口                                         |
| `/posts`               | 文章列表；`q/categoryId/tagId/page` 可组合筛选，每页数量来自设置 |
| `/posts/[slug]`        | 已发布文章块文档正文与审核通过的评论，缺失、草稿和排期均返回404  |
| `/categories`、`/tags` | 仅展示包含已发布文章的分类或标签及其公开数量                     |
| `/friends-links`       | 已通过且启用的友链，支持 `category` 筛选                         |
| `/about`               | 公开作者资料及启用的社交账号                                     |
| `/changelog`           | 实际更新记录，每页8条                                            |

文章列表按首次发布时间与ID降序，评论按创建时间与ID正序；超范围页码回退到有效末页。搜索使用绑定参数和字面包含匹配；公开响应不包含草稿、排期、私人邮箱、审核状态、内部版本或全局后台计数。顶部导航使用居中胶囊，空间不足时折叠菜单，文章详情归属文章栏目；分类与标签筛选、返回文章列表及分页均指向 `/posts`，首页不承担列表查询。登录入口位于页脚。正文采用共用内容类型的 Tiptap 静态渲染，仅展示校验后的块文档；Markdown 导入保留 `remark-gfm@4.0.1`，HTML 作为文字显示，链接与图片协议按白名单校验。图片不超宽，代码和表格局部滚动。

### slug 与迁移

后台必须手动填写1–120字符的slug，去除首尾空白，仅允许小写ASCII字母、数字及分隔单词的单个连字符。数据库唯一约束覆盖所有状态；首次发布后永久锁定，退回草稿也不能修改。409 `SLUG_CONFLICT`、`SLUG_LOCKED` 返回 `fieldErrors.slug`。改标题不改变slug；删除文章释放slug，不保存历史跳转。UUID继续用于数据库、后台与评论API内部关联。

增量迁移 `add_public_blog` 添加slug、锁定时间、评论显式身份、提交UUID/内容指纹和限流记录。迁移规划针对本地已确认的空文章库；已有文章的其他数据库不能直接应用此迁移，必须先制定人工slug回填方案，不自动从标题或UUID生成slug。表重建保留已有列与关系，历史管理员回复身份由 `adminId` 或旧回复关系回填，之后使用显式 `authorKind`，管理员移除后身份仍保留。Prisma仍为SQLite RC运行时8.0.0-rc.14与CLI8.0.0-rc.19，版本和配置约定不变。

启动前执行 `npm run db:generate`、`npm run db:migrate`；已有开发服务器需重启，避免使用旧contract的连接单例。迁移失败时不继续启动；非空文章库需先准备上述回填，不清空数据库。

### 匿名评论 API

| 接口                                        | 行为                                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------- |
| `GET /api/public/posts/:id/comments?page=1` | 每页20条，只有自身及全部祖先已通过的评论；先筛选再统计与分页                            |
| `POST /api/public/posts/:id/comments`       | JSON `{ author, email, content, parentId?, submissionId }`，201仅返回“已收到，等待审核” |

昵称去除首尾空白后1–80字符，邮箱必填、最多254字符，规范为小写；正文纯文本1–2000字符。邮箱只供后台管理，不公开。读者根评论与回复均待审核；父评论必须属于同一篇已发布文章且自身及全部祖先已通过，最多16层（根为第1层）。服务端身份不能由客户端指定。关闭评论只阻止新提交与回复，不影响历史查询。

提交UUID为全局唯一键，同一UUID与规范化内容返回原结果，不重复创建或消耗限流额度；不同文章、内容或回复对象返回409 `SUBMISSION_CONFLICT`。表单失败保留草稿；网络超时后复用同一UUID重试，成功或改变规范化内容后换新UUID。审核或删除不提供访客追踪查询。

公开写入校验Origin和JSON Content-Type，请求体上限16KiB。SQLite事务内检查文章、开关、回复关系、去重与额度；固定窗口全站30条/分钟、同一规范化邮箱3条/10分钟，邮箱额度键保存哈希，过期记录在新提交时清理。额度不代表邮箱验证或访客身份。429带 `Retry-After`，界面显示等待时间。所有公开错误为JSON `{ error: { code, message, fieldErrors? } }`；字段错误就近显示，通用错误在表单顶部，不暴露内部异常。

## 本地访问采集

本地统计与 GA4／百度独立，在系统设置 → 访问统计中启用，默认关闭。仅生产环境采集公开页面，后台、登录、展示、API、资源和不存在的文章均不采集。`POST /api/public/analytics/events` 接收严格 JSON 累计快照，成功或采集关闭返回204；同源检查、16 KiB上限、每访客每分钟30次和全站每分钟600次限流分别返回403、413及429（含Retry-After）。非法输入400、访问ID冲突409、内部失败503。

匿名UUID在第一方localStorage保存最多180天，数据库仅保存SHA-256哈希；禁用存储时退化为当前文档标识。不使用指纹。路径不包含query/hash，来源只保存hostname，浏览器和设备使用MIT许可的 `bowser@2.14.1` 解析。机器人UA过滤是启发式，不能视为完整爬虫检测；无JavaScript、采集拦截或发送失败的访问不进入统计。

`ANALYTICS_CLIENT_IP_HEADER` 默认为空，IP显示未知。只有受信代理覆盖该单值头、应用禁止直接公网访问时才设置，例如nginx覆盖 `X-Real-IP` 后配置 `ANALYTICS_CLIENT_IP_HEADER=x-real-ip`。不自动信任X-Forwarded-For；非法或多值IP显示未知。IPv4保存/24、IPv6保存/48网络前缀；不存完整IP，不调用外部地域服务，地域显示未知。

PV按页面显示计数，刷新与路径变化生成新访问ID，重试复用ID；query/hash变化不增PV。UV按匿名标识去重。可见页面每30秒发送累计时长及正文进度，隐藏和离开时补报；重复、乱序累计值只增不减，服务端将时长限制在访问已存在的时间内。会话30分钟无活动后结束，在线按最近五分钟活动去重；平均阅读时长为文章可见停留时间除以文章PV；已结束会话停留不足10秒且只浏览一页计为跳出；正文进度达到90%且停留至少10秒计为完读。短正文完整进入视口即可达到100%进度。

详细记录查询与存储保留180天；请求触发每天一次分批清理。站点长期无请求时，物理文件里的过期行保留至下一次清理，但不进入查询。运维可执行 `npm run analytics:cleanup`，共享DATABASE_PATH且执行后释放连接。删除文章保留访问历史、关联置空。

Prisma仍为CLI8.0.0-rc.19和SQLite运行时8.0.0-rc.14（RC／experimental）。增量迁移 `add_local_analytics` 只新增访问、会话、限流表和两个可空设置列；历史空值按关闭读取。执行 `npm run db:migrate` 后重启应用，使数据库单例加载新contract。首次启用时间由服务端写入，关闭不会删除历史数据。

### 后台日志与报表

`GET /api/admin/visitors` 默认每页10条，最多100条；支持 `q/page/pageSize/sortBy/sortDirection`，排序字段为 `ip/location/entryPage/platform/duration/time`。搜索脱敏IP、地域和路径；摘要不随搜索变化，页码超范围时回退。`GET /api/admin/analytics?range=7d|30d|quarter` 默认近30天，返回PV、区间UV、平均文章阅读时长、跳出率、每日趋势、来源、设备及PV前20篇文章。查询限于保留期；时间按Asia/Shanghai分组，包含当日截至查询时刻的数据。环比使用前一个等长区间，基数为零或首次启用至今未覆盖比较区间时返回null，页面显示“暂无可比数据”；没有文章或已结束会话时，相应指标显示“—”。

后台页面、API及数据服务均检查管理员会话，响应 `no-store`。仪表盘、访客日志与数据分析使用 `@tanstack/react-query@5.104.1`；QueryClient在已鉴权布局内保持稳定，请求复用 `resourceRequest` 并传递AbortSignal。网络错误和5xx最多重试两次，间隔1秒、2秒；鉴权和校验错误不重试。访客数据每10秒轮询，暂停、隐藏或卸载时停止，恢复立即查询；焦点变化不触发查询。新鲜期分别为5秒与30秒，缓存保留5分钟；401清理统计查询缓存并提示重新登录，刷新失败明确标记仍显示的旧数据。

## 控制台与全局操作（第七阶段）

继续使用 Hono 4.13.12、Zod 4.6.5、Prisma CLI 8.0.0-rc.19 与 SQLite runtime 8.0.0-rc.14（RC／[experimental](https://www.prisma.io/extensions/sqlite)），无新增依赖。迁移 `add_global_operations` 只新增 `notification/notification_read/operation_setting/backup_run` 及索引；执行 `npm run db:migrate` 后重启应用，已有管理员、会话和业务数据保留。业务接口复用会话鉴权、同源写入校验、16 KiB 请求限制和统一 JSON 错误。

| 接口                                                             | 行为                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `GET /api/admin/search?q=...&kind=...&page=...&pageSize=...`     | 全局字面检索，kind 可选 `post/category/tag/comment/media/friend/release` |
| `GET /api/admin/notifications?page=...&pageSize=...&unread=true` | 通知分页；不传 unread 或传 false 时查询全部                              |
| `GET /api/admin/notifications/summary`                           | 当前管理员的未读且未处理数量                                             |
| `POST /api/admin/notifications/read`                             | `{ ids: [...] }`，幂等标记 1–50 条通知已读                               |
| `GET/PUT /api/admin/operations/settings`                         | 自动备份开关与真实调度时间，更新要求 `{ autoBackup, version }`           |
| `POST /api/admin/operations/publish-due`                         | 严格空 JSON 对象 `{}`，执行最多 100 篇到期文章                           |
| `GET /api/admin/backups?page=...&pageSize=...`                   | 备份执行记录、字节数、SHA-256 与状态                                     |
| `POST /api/admin/backups`                                        | `{ id: UUID }`，同 ID 返回已有结果，避免响应丢失后重复备份               |

检索 q 去除首尾空白，最多 200 字符；空关键词不遍历全库。搜索文章标题、slug、可见正文、分类与标签，并包含独立分类/标签、评论作者与正文及文章标题、ready 媒体名称、友链名称/地址/简介、更新日志版本/主题/条目。使用绑定参数的 SQLite 字面包含搜索，ASCII 忽略大小写，`%` 和 `_` 不作为通配符；不输出邮箱、正文 JSON、密码、会话或存储凭据。统一按时间、类型、ID 排序，默认每页 8 条、最多 100 条，超范围页码回退末页。文章结果打开编辑器，其余结果进入对应管理模块。

通知由真实待审核评论、待审核友链、排期发布结果与备份结果产生，不导入演示通知。待办按来源 ID 与版本去重，首次查询同步已有待办，来源审核完成、删除或版本变化后标为已处理并退出未读数量；历史通知保留。已读按管理员独立保存，标为已读不会审核来源。本页全部已读仅提交当前显示的 ID，不会吞掉同时到达的新通知；未读数量在评论操作、全局操作、窗口恢复与可见页面每分钟刷新。通知不发送邮件或系统推送。

### 排期与外部调度

在部署主机的项目目录运行以下命令，使用与 Web 服务相同的 `DATABASE_PATH`、Node.js 24+ 和项目依赖：

```sh
npm run operations:run
# 独立执行到期发布，不执行自动备份
npm run posts:publish-due
# 独立生成一次数据库备份
npm run db:backup
```

`operations:run` 先发布到期文章，记录调度执行时间，再按数据库中的自动备份开关执行当天备份。建议通过部署平台或系统 cron 每分钟调用一次，例如替换真实绝对项目路径与 npm 路径后配置：

```cron
* * * * * cd /srv/fuxiaochen && /usr/bin/npm run operations:run >> /srv/fuxiaochen/logs/operations.log 2>&1
```

配置前创建日志目录并确认调度环境的 Node/npm 版本和 PATH。应用不会安装或修改主机 cron。调度命令必须运行在共享同一持久数据库和备份磁盘的主机，不能运行在无共享磁盘的临时实例。调度未配置或停止时，排期仍为 scheduled，界面显示等待执行；手动执行到期计划可以补发，不会把未到期文章提前发布。

每次执行最多处理 100 篇，以排期时间/ID 排序。发布与通知在同一事务内完成，通过 status/version 条件防止重复执行，版本加一并清空 scheduledFor，保留首次 publishedAt 与 slugLockedAt；首次发布记录实际执行时间。正文损坏或版本达到上限的文章不发布，产生去重通知并以非零退出码提示，其他有效文章继续处理。事务失败整体回滚，下一次调度可重试；CLI 完成后关闭数据库连接。

### 数据库备份与恢复

**仅备份数据库，不备份 OSS 文件。** 产物包含文章、评论、配置、鉴权数据、统计和媒体元数据，不访问或修改 OSS。默认目录为数据库旁的 `backups/`，可用 `BACKUP_DIRECTORY` 指定持久目录；空值使用默认目录。每次备份创建独立 UUID 目录，包含 `database.sqlite` 与 `manifest.json`，记录字节数、SHA-256、contract 摘要及 metadata-only 范围。备份目录为 0700，文件为 0600；不通过公开 URL 或后台下载接口暴露完整鉴权数据，产物不得提交 Git。

使用 SQLite 在线 backup API 读取主文件与 WAL，不使用文件复制代替在线备份。备份结束执行 quick_check、foreign_key_check 和摘要计算后才记录 complete；失败或进程中断保留 failed 记录，未完成产物清理，完整产物在最终登记失败时保留以供人工核对。单次在线复制最多 10 分钟，running 记录超过 15 分钟后在查询或下一次执行时转为 failed。跨进程通过数据库 running 记录互斥；锁冲突由现有服务错误返回，不绕过 SQLite 锁。

手动备份最少间隔一分钟。响应不确定时使用同一个 ID 核对；failed 记录需要新的 ID 重新执行。自动备份默认关闭，开关保存具有版本冲突检查；启用后在当天第一次调度执行，按北京时间日期幂等，每天最多一份成功自动备份，失败后下一次调度可重试。当前没有自动删除备份的保留策略，应按实际磁盘容量管理历史产物。

恢复命令只写入不存在的新文件，不覆盖正在使用的数据库：

```sh
npm run db:restore -- /absolute/backups/<UUID> /absolute/restored.sqlite
DATABASE_PATH=/absolute/restored.sqlite npm run db:verify
```

恢复前核验字节数、摘要和 SQLite 完整性；恢复后清除所有登录会话，关闭自动备份并清空旧调度时间，避免复活已撤销令牌或误执行旧备份设置。核对结构和业务数据后，停止 Web 服务与调度进程，备份当前库，再将 `DATABASE_PATH` 切换到恢复文件并重启。不要直接覆盖打开的数据库，也不要将旧 WAL/SHM 文件与恢复文件混用；应用版本应与备份 contract 匹配，必要时先应用后续迁移。OSS 对象必须继续保留，恢复数据库不能找回已删除的 OSS 文件。历史备份校验不匹配或目标文件已经存在时，命令失败且不覆盖原文件。

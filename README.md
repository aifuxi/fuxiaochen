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

后台登录使用 Hono + Zod，管理员和会话保存在 Prisma 8 SQLite 数据库中。文章、分类与标签已接入数据库，媒体库通过 OSS 持久化文件与数据库元数据；评论及其他后台业务仍使用演示数据。

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

## 媒体资产库 API（第三阶段）

媒体库与全局上传入口改为浏览器预签名直传阿里云 OSS，SQLite 保存上传者、原始文件名、字节数、SHA-256、图片宽高、对象 key 和处理状态。不自动上传或导入 `public/media` 的演示素材，不改变文章正文与其他后台业务。

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

上传 URL 绑定 `Content-Type: application/octet-stream` 和精确字节数。浏览器自动设置已签名的 Content-Length，不手动添加该禁止写入的请求头；对象元数据、尺寸及摘要仍需服务端复核。正式图片按真实格式返回 MIME / inline；其他附件统一返回 `application/octet-stream` / attachment，并使用 RFC 5987 编码下载文件名，SVG、HTML、脚本和可执行文件不内嵌打开、不解压或执行。本阶段没有病毒扫描。

在 OSS 控制台为 `staging/` 配置 1 天过期删除规则；不要对 `media/` 配置过期删除。本阶段不实现分片上传，不需要应用侧分片清理。本地运行期间每 15 分钟执行清理 CLI，可先用 `--dry-run` 查看待处理数量：

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

前端最多并行处理 2 个文件，显示准备、上传进度、服务端核验、成功及逐项失败。准备阶段使用 `@noble/hashes@2.4.0` 按 4 MiB 分块读取并计算整个文件的 SHA-256，避免一次加载整个大文件，取消后停止继续读取；这不是 OSS 分片上传，浏览器仍直接发送原始 File。已上传但完成失败时优先重试完成，不重复上传；过期或失效记录重新申请。批量部分失败不抹掉成功结果，站内切换保留上传状态。写成功后独立刷新查询，查询失败单独重试，不将已成功保存报成失败。删除是永久操作，引用该 URL 的文章或外部页面会出现失效链接；纯文本正文不提供可靠媒体引用追踪。

### 人工验收场景（待执行）

以下为验收清单，不代表已完成真实 OSS 联调；不新增或运行测试。

- 配置默认域名与本地 RAM 用户凭证后上传常用位图及附件，刷新或重新登录后读取，检查永久 HTTPS 链接、字节数、宽高和北京时间；核对默认域名访问限制及图片直接打开时的强制下载响应。
- SVG、HTML、脚本、EXE 与任意未知扩展名均按附件强制下载；损坏图片、摘要不匹配、零字节、大小及总像素超限被拒绝。
- 验证默认 S3 服务 endpoint 的签名 host、精确长度、Content-Type，以及本地 Origin 的 CORS；公开链接使用默认 Bucket 域名，临时 STS 过期后手动更新凭证并重启。
- 检查错误 Origin、会话撤销、错误 Content-Type、非法 JSON、请求体超限、限流与 20 个未完成上传限制。
- 并发完成同一上传、响应丢失后重试、签名过期、重放临时上传；ready 记录不重复创建，正式对象不被浏览器覆写。
- 超过 12 个文件后跨页搜索筛选，关键词含 `%`、`_`，删除末页最后一项后回退有效页；旧查询不覆盖新结果。
- OSS / DB / 网络失败时检查补偿、deleting 重试、租约恢复与幂等清理；检查 dry-run 不写入，ready 清理不删除正式文件。
- 检查批量部分成功、两个上传并行、站内切换、上传成功后查询刷新失败、复制权限失败、删除弹窗禁用与焦点返回、390px 布局和减少动态效果。

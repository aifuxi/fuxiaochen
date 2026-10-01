# fuxiaochen

## 路由与布局

`app/layout.tsx` 是全站共用的根布局，负责 `html/body`、全局暗色样式、字体、默认 metadata 和唯一的指针动效层。业务布局通过路由分组拆分，括号目录不进入 URL：

| 分组                          | 职责                                                        | URL                  |
| ----------------------------- | ----------------------------------------------------------- | -------------------- |
| `app/(frontend)/`             | 前台页面，首页为 `page.tsx`，独立布局入口为 `layout.tsx`    | `/` 及后续前台路径   |
| `app/(backend)/admin/`        | 管理后台，`layout.tsx` 负责会话校验、后台壳与共享 mock 状态 | `/admin`、`/admin/*` |
| `app/(auth)/login/`           | 登录页面及其专属样式                                        | `/login`             |
| `app/(showcase)/design-spec/` | 设计系统展示及独立 metadata                                 | `/design-spec`       |

新增前台页面放在 `app/(frontend)/` 下，例如 `about/page.tsx` 对应 `/about`。前台共享导航、页脚等写在该分组的 `layout.tsx` 中，仅作用于前台页面，不影响后台、登录或设计展示。分组布局不重复声明 `html/body`，也不重复挂载指针动效。

`app/api/` 保持独立，登录与退出接口仍为 `/api/login` 和 `/api/logout`。链接、表单地址和重定向使用实际 URL，不包含分组名；不同分组中不能定义相同的 URL。

## 管理员登录

后台登录使用 Hono + Zod，管理员和会话保存在 Prisma 8 SQLite 数据库中。分类与标签已接入数据库，文章及其他后台业务仍使用演示数据。

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

响应为 `{ data }`，分类包含 `id/name/color/createdAt`，标签包含 `id/name/createdAt`，时间为 ISO 字符串。列表按创建时间和 ID 升序排列；创建返回 201，删除返回 200 和 `{ data: { id } }`。错误为 `{ error: { code, message } }`：400 `INVALID_INPUT`、401 `UNAUTHORIZED`、403 `FORBIDDEN_ORIGIN`、404 `NOT_FOUND`、409 `DUPLICATE_NAME`、413 `PAYLOAD_TOO_LARGE`、415 `UNSUPPORTED_MEDIA_TYPE`、503 `SERVICE_UNAVAILABLE`。JSON 请求最多 16 KiB，写请求必须携带与 APP_ORIGIN 一致的 Origin，所有后台业务响应禁止缓存，业务错误不重定向登录页。

本阶段不导入 Mock 数据，新库分类与标签为空。已有数据库执行 `npm run db:migrate` 应用新增表迁移，管理员与会话保持不变。若本地缺少 `db` ref，规划下一迁移时使用 `--from` 显式指定当前已应用的 contract 快照，不能从空库规划。

关联文章数量显示“尚未接入”；删除不修改会话内演示文章。编辑器选择已登记分类和标签，未登记的历史演示值须重新选择或移除后保存。文章仍未持久化，刷新恢复演示文章；第二阶段才引入文章外键与被引用分类、标签的删除限制。

构建可使用 `NEXT_BUILD_DIR=.next-build npm run build`，与现有开发服务器的 `.next` 输出隔离。

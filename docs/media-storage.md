# 媒体存储配置

文章图片使用阿里云 OSS，浏览器通过预签名地址直接上传正式对象，上传成功后插入正文。应用不下载文件、不做大小、摘要、解码或像素校验，也不维护新媒体记录。以下沿用 `.env.example` 的默认公网 S3 接入方式。

## 环境配置

将真实值填入项目根目录 `.env` 或部署环境。凭证只供服务端使用，不提交 Git，不使用 `NEXT_PUBLIC_`；修改后重启应用。

| 变量                                                              | 配置                                                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `OSS_BUCKET` / `OSS_REGION`                                       | 桶名与地域，例如 `my-media-bucket`、`cn-hangzhou`                          |
| `OSS_UPLOAD_ENDPOINT`                                             | `https://s3.oss-cn-hangzhou.aliyuncs.com`；按地域替换，默认不添加桶名前缀  |
| `OSS_UPLOAD_ENDPOINT_MODE`                                        | 默认 `service`                                                             |
| `OSS_PUBLIC_ORIGIN`                                               | `https://my-media-bucket.oss-cn-hangzhou.aliyuncs.com`，不带路径或查询参数 |
| `OSS_CREDENTIAL_MODE`                                             | `environment`                                                              |
| `ALIBABA_CLOUD_ACCESS_KEY_ID` / `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | 最小权限 RAM 用户凭证                                                      |
| `ALIBABA_CLOUD_SECURITY_TOKEN`                                    | RAM 用户凭证留空；临时 STS 凭证需填写，过期后更新并重启                    |

服务 endpoint 与公开 Bucket 地址不能混用，模板中的 `your-bucket` 不会自动替换。本地浏览器需使用可达的公网上传地址，不使用 `-internal`，不改写签名后的 URL。接入前核对账号和 Bucket 的默认域名可用性，见 [OSS S3 接入说明](https://www.alibabacloud.com/help/zh/oss/developer-reference/use-aws-sdks-to-access-oss)。默认域名下图片直接访问可能下载，见 [默认域名预览说明](https://help.aliyun.com/zh/oss/how-to-ensure-an-object-is-previewed-when-you-access-the-object/)。

## 权限与跨域

Bucket ACL 保持 private；图片直接写入 `media/`，新上传不使用 `staging/`。将模板中的账号 ID 和 Bucket 替换为真实值。

RAM 用户权限：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["oss:PutObject"],
      "Resource": ["acs:oss:*:<账号ID>:<Bucket>/media/*"]
    }
  ]
}
```

Bucket Policy 仅开放正式对象的 HTTPS 匿名读取：

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": ["*"],
      "Action": ["oss:GetObject"],
      "Resource": ["acs:oss:*:<账号ID>:<Bucket>/media/*"],
      "Condition": {
        "Bool": {
          "acs:SecureTransport": "true"
        }
      }
    }
  ]
}
```

核对账号和桶的阻止公共访问设置，确认策略生效；不开放匿名写入、列举或 `staging/` 读取。图片地址供前台公开使用。

OSS CORS：AllowedOrigin 使用实际 `APP_ORIGIN`，AllowedMethod 为 PUT，AllowedHeader 为 `Content-Type`，ExposeHeader 可留空，MaxAgeSeconds 为300。部署域名需加入允许来源，不使用通配 Origin。浏览器不接收 RAM 凭证，也不手动设置 Content-Length。

## 直传协议

编辑器通过 `POST /api/admin/media/uploads` 提交 `{ contentType }` 获取预签名 PUT 地址、对应请求头及永久 `publicUrl`。服务端验证后台会话与同源请求，签名请求使用每管理员每分钟 20 次限流；JSON 和 Content-Type 格式约束不检查文件内容。OSS 凭证只在服务器，浏览器不持有 AccessKey。

每次签发使用独立的 `media/<UUID>` 正式对象，签名有效期 5 分钟。浏览器以原始 `File` 直接 PUT，Content-Type 与签名一致；不计算 SHA-256，不传文件内容到应用服务器，不调用 complete 接口。收到 OSS 2xx 后直接把永久 URL 插入正文，失败保留文件可重试；请求最长等待 15 分钟。Content-Length 由浏览器设置，应用不设置文件大小上限。

应用不从 OSS 下载或 HEAD 探测文件，不解码图片，不建立媒体记录；文章、设置和友情链接不校验媒体记录是否存在。图片 URL 插入只检查正文允许的 HTTP／HTTPS 地址格式，不探测远程图片。读者直接从媒体域名加载图片。

## 文件管理与历史数据

独立媒体页面、列表、完成核验、引用查询、删除接口及 `media:cleanup` CLI 已移除。停止以前配置的媒体清理调度；本次代码修改不会自动变更外部调度或 Bucket 权限。

删除正文图片、替换图片、删除文章和取消上传都不删除 OSS 文件。已经上传但未插入、未保存或插入失败的正式对象同样保留，管理员按需在 OSS 控制台处理；不对 `media/` 设置自动过期规则。

旧 `staging/` 的 1 天生命周期规则可以继续回收历史临时对象，新上传不使用此前缀。历史媒体数据库记录、旧 OSS 对象和原有文章链接保留，本次无需数据库迁移；数据库备份仍包含历史元数据，但不包含 OSS 文件，新图片只随正文保存 URL。

## 验证范围

本次实现与实际运行证据见[图片直传简化验证](engineering/media-direct-upload-verification.md)。真实 OSS 的 CORS、签名兼容性及公开域名访问需使用部署账号另行核对，不把模拟上传当作云端验证。

### 编辑器真实 OSS 回归（2026-10-17）

本轮在现有 `localhost:3000` 授权来源使用 `/Users/chen/xxx/test-resources` 的两个 JPG 完成真实签名、浏览器 PUT 和公开图片加载，原图均为 1024×1024；替换成功、撤销恢复原 URL，裁剪／图注／缩放后保存重开及前台读取也已验证。没有修改 Bucket 权限、CORS 或凭证，也没有自动删除生成对象。对象标识为 `5abb297e-622e-4017-a05a-6d65831cbcce`、`29c05557-a861-4465-90df-bf9b0c1c4dd4`、`a67777ee-f469-4a6e-a6e7-935423304cce`，均位于现有 `media/` 前缀，保留供管理员按需处理。

隔离环境不加载业务 `.env`，单独验证了签名失败、文件及替代文字保留、重试错误和改用已上传 URL 继续编辑。自动媒体测试另覆盖 OSS PUT 失败后重试成功与取消；这两类证据不能替代真实断网恢复、上传中取消或生产域名 CORS 验证。详见[编辑器完整对齐验收](engineering/feishu-editor-verification.md#完整交互对齐复查2026-10-18)。

### 行内上传与故障验证（2026-10-18）

文章图片入口已去掉上传表单 Dialog，直接选择文件并在正文原位显示进度、重试与取消。任务锚点只存在于 ProseMirror 插件，保存中不出现 blob、进度和错误文案；失败保留 File，上传成功而插入失败复用 URL，取消后晚到响应不能插图。上传或等待组合输入提交期间阻止保存并保护离开，正文仍可编辑。

本轮真实来源 `localhost:3000` 再次完成授权 JPG 的签名、PUT、公开加载以及插入撤销／重做。新增正式对象 `0fcd9c70-6417-499a-add3-103b2b38fadb`、`f3e18ebd-8b28-4cb4-931a-394b70464e86`、`89c2db3d-6b39-44e8-a020-4c8f2a2cd77a` 均按既有规则保留。真实请求完成快于取消操作，本轮没有把这些尝试记为真实 OSS 上传中取消通过。

`tests/helpers/editor-browser-fixture.ts --upload-faults <测试图片绝对路径>` 只在临时项目中写入模拟签名和慢 PUT 路由，默认首个 PUT 返回 503，第二个成功，后续请求等待 10 秒；记录 abort 和晚到响应。它剥离 OSS 凭证，不连接云端。浏览器已验证失败后继续编辑／重试仅插一张、新增与替换上传取消、同文件再次选择、晚到响应、保存重开与正文检查。自动传输测试覆盖网络错误和取消竞态；这些证据不等于真实 OSS 断网恢复、真实 OSS 慢传取消或物理触屏验证。

用户确认先完成可自动验证的部分并标注剩余项。真实中文输入法候选、真实触屏拖动／长按、真实 OSS 断网恢复／上传中取消与生产域名 CORS 仍待实机验证；浏览器窄屏和合成事件测试分开记录。

### 图片粘贴与拖入（2026-10-18）

图片文件选择、剪贴板和外部拖入共用直传与取消令牌，每张图独立保留失败文件及锚点；同一次传输的 files／items 和 HTML 兜底不会造成重复插图。混合粘贴的临时定位标记在派发正文事务前移除，blob 预览不保存。内部移动已有图片不会请求新上传。

真实原生剪贴板图片从 `localhost:3000` 完成签名、PUT 和公开加载，生成对象 `media/4491dcb0-9a0c-47c0-9d19-8a987413799c`，按既有规则保留；未向常用数据库保存测试文章。选中文字未被覆盖，撤销／重做为 0／1 张。隔离副本另验证混合图文、双图独立取消、503 重试、拖入取消与晚到响应，以及 SQLite 保存重开；它使用本地模拟 PUT，不是云端断网测试。

夹具增加 `--transfer-controls`（同时提供 `--upload-faults <测试图片绝对路径>`），只在临时项目挂载合成 ClipboardEvent／DragEvent 控件。系统 Finder 文件拖入、真实 OSS 断网及慢传取消未验证，不将这些控件或窄屏鼠标操作当作实机证据。

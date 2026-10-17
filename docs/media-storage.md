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

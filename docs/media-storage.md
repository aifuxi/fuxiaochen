# 媒体存储配置

媒体上传使用阿里云 OSS，浏览器通过预签名地址直传，应用服务端核验文件。图片最多20 MiB，附件最多100 MiB。以下沿用 `.env.example` 的默认公网 S3 接入方式。

## 环境配置

将真实值填入项目根目录 `.env` 或部署环境。凭证只供服务端使用，不提交 Git，不使用 `NEXT_PUBLIC_`；修改后重启应用。

| 变量                                                              | 配置                                                                       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `OSS_BUCKET` / `OSS_REGION`                                       | 桶名与地域，例如 `my-media-bucket`、`cn-hangzhou`                          |
| `OSS_SERVER_ENDPOINT` / `OSS_UPLOAD_ENDPOINT`                     | `https://s3.oss-cn-hangzhou.aliyuncs.com`；按地域替换，默认不添加桶名前缀  |
| `OSS_SERVER_ENDPOINT_MODE` / `OSS_UPLOAD_ENDPOINT_MODE`           | 默认均为 `service`                                                         |
| `OSS_PUBLIC_ORIGIN`                                               | `https://my-media-bucket.oss-cn-hangzhou.aliyuncs.com`，不带路径或查询参数 |
| `OSS_CREDENTIAL_MODE`                                             | `environment`                                                              |
| `ALIBABA_CLOUD_ACCESS_KEY_ID` / `ALIBABA_CLOUD_ACCESS_KEY_SECRET` | 最小权限 RAM 用户凭证                                                      |
| `ALIBABA_CLOUD_SECURITY_TOKEN`                                    | RAM 用户凭证留空；临时 STS 凭证需填写，过期后更新并重启                    |

服务 endpoint 与公开 Bucket 地址不能混用，模板中的 `your-bucket` 不会自动替换。本地浏览器需使用可达的公网上传地址，不使用 `-internal`，不改写签名后的 URL。接入前核对账号和 Bucket 的默认域名可用性，见 [OSS S3 接入说明](https://www.alibabacloud.com/help/zh/oss/developer-reference/use-aws-sdks-to-access-oss)。默认域名下图片直接访问可能下载，见 [默认域名预览说明](https://help.aliyun.com/zh/oss/how-to-ensure-an-object-is-previewed-when-you-access-the-object/)。附件始终按下载处理。

## 权限与跨域

Bucket ACL 保持 private；临时对象使用 `staging/`，正式对象使用 `media/`。将模板中的账号 ID 和 Bucket 替换为真实值。

RAM 用户权限：

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

核对账号和桶的阻止公共访问设置，确认策略生效；不开放匿名写入、列举或 `staging/` 读取。正式附件也在公开前缀内，不适合存放私密文件。

OSS CORS：AllowedOrigin 使用实际 `APP_ORIGIN`，AllowedMethod 为 PUT，AllowedHeader 为 `Content-Type`，ExposeHeader 可留空，MaxAgeSeconds 为300。部署域名需加入允许来源，不使用通配 Origin。浏览器不接收 RAM 凭证，也不手动设置 Content-Length。

## 上传协议与队列

浏览器先取得预签名 URL，再用原始 `File` 直传 OSS 临时对象，最后请求服务端核验与发布。准备阶段由 `lib/media/file-hash.ts` 按 4 MiB 分块读取，计算整个文件的 SHA-256；分块读取不等于分片上传，取消后停止继续读取。浏览器上传最长等待 15 分钟，服务端核验与发布最多 5 分钟，等待期间保留对应状态，字节传输完成不代表文件已经保存。

服务端核对实际长度与 SHA-256，识别图片格式及像素数后再发布正式对象；文件大小、所有帧像素上限、可预览格式与附件强制下载条件见 [产品行为](product/behavior.md)。大小限制、页面说明及错误提示引用 `lib/media/schema.ts` 的同一份共享常量。复制入口只使用已保存的永久 HTTPS URL，不复制上传票据或预签名地址。

`AdminWorkspace` 持有上传队列的文件与进度，后台站内切换不重建队列；逐文件阶段包括准备、上传、服务端核验、成功与失败，最多两个文件并行。失败项显式重试，上传及核验取消使用同一任务的取消信号；票据失效或输入不合法时重新准备票据。列表刷新失败与文件上传失败分别反馈。任务显示、失败恢复及删除约束见产品行为，队列布局见 [后台场景](design/admin.md)。

## 临时上传清理

在 OSS 为 `staging/` 设置1天过期删除规则，不对 `media/` 设置过期规则。应用不使用分片上传。

```sh
npm run media:cleanup -- --dry-run
npm run media:cleanup
```

`--dry-run` 仅统计，不请求 OSS 或修改数据库。实际清理使用与应用相同的环境、数据库和凭证，回收中断上传、残留临时对象及未完成删除；不会删除 ready 记录的正式对象。

运行期间通过部署平台或操作系统每15分钟执行一次清理。本地电脑关机或休眠时不会执行，恢复后补跑一次；OSS 生命周期规则继续在云端生效。删除媒体是永久操作，目前没有文章引用追踪，已引用地址可能失效。

## 后台引用删除保护

删除前通过 `GET /api/admin/media/:id/references` 查询结构化内部引用及指纹，覆盖全部文章状态、站点 URL、停用社交账号及友链。按配置媒体域名和规范化路径匹配，忽略查询与片段；正文中的纯文本和外部网站不计入。

DELETE 接受可选 JSON `{ force, referenceFingerprint }`。有引用必须显式强删并提供当前指纹；事务内引用变化返回 `REFERENCES_CHANGED`（409），未确认强删返回 `RESOURCE_IN_USE`（409）。已经进入删除流程的重试沿用现有租约机制。文章、设置与友链保存使用相同事务锁校验新增引用，禁止引用未就绪、正在删除或已删除的本站媒体；旧的失效引用可随无关编辑保留。

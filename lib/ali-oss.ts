import OSS from "ali-oss";

const globalForAliOSS = global as unknown as { aliOSS: OSS | undefined };

export const aliOSS =
  globalForAliOSS.aliOSS ??
  new OSS({
    accessKeyId: process.env.OSS_ACCESS_KEY_ID ?? "",
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? "",
    region: process.env.OSS_REGION ?? "",
    bucket: process.env.OSS_BUCKET ?? "",
    // 使用V4签名算法
    authorizationV4: true,
    secure: true,
    // yourEndpoint填写Bucket所在地域对应的公网Endpoint。以华东1（杭州）为例，Endpoint填写为https://oss-cn-hangzhou.aliyuncs.com。
    endpoint: "oss-cn-shanghai.aliyuncs.com",
  } as OSS.Options & {
    authorizationV4?: boolean;
  });

if (process.env.NODE_ENV !== "production") globalForAliOSS.aliOSS = aliOSS;

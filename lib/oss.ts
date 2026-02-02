import OSS from "ali-oss";

const globalForAliOSS = global as unknown as { aliOSS: OSS | undefined };

const aliOSS =
  globalForAliOSS.aliOSS ??
  new OSS({
    accessKeyId: process.env.OSS_ACCESS_KEY_ID ?? "",
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? "",
    region: process.env.OSS_REGION ?? "",
    bucket: process.env.OSS_BUCKET ?? "",
    // 使用V4签名算法
    authorizationV4: true,
    // 使用https协议
    secure: true,
  } as OSS.Options & {
    authorizationV4?: boolean;
  });

if (process.env.NODE_ENV !== "production") {
  globalForAliOSS.aliOSS = aliOSS;
}

export { aliOSS };

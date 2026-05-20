import OSS from "ali-oss";

import { env } from "@/lib/env";

const globalForAliOSS = global as unknown as { aliOSS: OSS | undefined };

export function getAliOSS() {
  if (globalForAliOSS.aliOSS) {
    return globalForAliOSS.aliOSS;
  }

  const client = new OSS({
    accessKeyId: env.OSS_ACCESS_KEY_ID ?? "",
    accessKeySecret: env.OSS_ACCESS_KEY_SECRET ?? "",
    region: env.OSS_REGION ?? "",
    bucket: env.OSS_BUCKET ?? "",
    // 使用V4签名算法
    authorizationV4: true,
    // 使用https协议
    secure: true,
  });

  globalForAliOSS.aliOSS = client;

  return client;
}

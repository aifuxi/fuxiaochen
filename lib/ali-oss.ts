import OSS from "ali-oss";

const globalForAliOSS = global as unknown as { aliOSS: OSS | undefined };

export const aliOSS =
  globalForAliOSS.aliOSS ??
  new OSS({
    accessKeyId: process.env.OSS_ACCESS_KEY_ID ?? "",
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? "",
    region: process.env.OSS_REGION ?? "",
    bucket: process.env.OSS_BUCKET ?? "",
  });

if (process.env.NODE_ENV !== "production") globalForAliOSS.aliOSS = aliOSS;

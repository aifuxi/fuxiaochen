import OSS from 'ali-oss';

import { env } from './env.mjs';

const globalForAliOSS = global as unknown as { aliOSS: OSS | undefined };

export const aliOSS =
  globalForAliOSS.aliOSS ??
  new OSS({
    accessKeyId: env.OSS_ACCESS_KEY_ID ?? '',
    accessKeySecret: env.OSS_ACCESS_KEY_SECRET ?? '',
    region: env.OSS_REGION ?? '',
    bucket: env.OSS_BUCKET ?? '',
  });

if (env.NODE_ENV !== 'production') globalForAliOSS.aliOSS = aliOSS;

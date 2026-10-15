import "server-only";
import {
  ECSRAMRoleCredentialsProvider,
  EnvironmentVariableCredentialsProvider,
} from "@alicloud/credentials";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { MediaError } from "./error";

export const UPLOAD_TTL_SECONDS = 300;
const httpsOrigin = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash &&
    url.pathname === "/"
  );
});
const configSchema = z.object({
  bucket: z.string().regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/),
  region: z.string().min(1),
  uploadEndpoint: httpsOrigin,
  uploadMode: z.enum(["service", "bucket"]),
  publicOrigin: httpsOrigin,
  credentialMode: z.enum(["environment", "ecs_ram_role"]),
});
export function storageConfig() {
  const result = configSchema.safeParse({
    bucket: process.env.OSS_BUCKET,
    region: process.env.OSS_REGION,
    uploadEndpoint: process.env.OSS_UPLOAD_ENDPOINT,
    uploadMode: process.env.OSS_UPLOAD_ENDPOINT_MODE ?? "service",
    publicOrigin: process.env.OSS_PUBLIC_ORIGIN,
    credentialMode: process.env.OSS_CREDENTIAL_MODE ?? "environment",
  });
  const appOrigin = z.url().safeParse(process.env.APP_ORIGIN);
  if (
    !result.success ||
    !appOrigin.success ||
    new URL(result.data.publicOrigin).hostname === new URL(appOrigin.data).hostname
  )
    throw new MediaError(
      "STORAGE_NOT_CONFIGURED",
      "媒体存储配置不完整，请配置独立的 HTTPS 媒体域名及 OSS 连接。",
    );
  return result.data;
}
type StorageConfig = ReturnType<typeof storageConfig>;
const storageGlobal = globalThis as typeof globalThis & {
  mediaStorage?: ReturnType<typeof createStorage>;
};
function createStorage(config: StorageConfig) {
  const provider =
    config.credentialMode === "ecs_ram_role"
      ? ECSRAMRoleCredentialsProvider.builder()
          .withRoleName(process.env.OSS_RAM_ROLE_NAME ?? "")
          .withDisableIMDSv1(true)
          .withAsyncCredentialUpdateEnabled(false)
          .withConnectTimeout(5000)
          .withReadTimeout(10000)
          .build()
      : EnvironmentVariableCredentialsProvider.builder().build();
  const credentials = async () => {
    const value = await provider.getCredentials();
    if (!value.accessKeyId || !value.accessKeySecret)
      throw new MediaError("STORAGE_NOT_CONFIGURED", "OSS 访问凭证不可用。");
    return {
      accessKeyId: value.accessKeyId,
      secretAccessKey: value.accessKeySecret,
      sessionToken: value.securityToken || undefined,
      // 仅 RAM Role 分支需要定期重新询问会刷新 STS 的 provider，凭证包不公开真实过期时间。
      // 本地 environment 分支不自动刷新；更换 AccessKey 或临时 STS 后需重启进程。
      expiration:
        config.credentialMode === "ecs_ram_role" ? new Date(Date.now() + 60_000) : undefined,
    };
  };
  const client = (endpoint: string, mode: "service" | "bucket") =>
    new S3Client({
      endpoint,
      region: config.region,
      credentials,
      bucketEndpoint: mode === "bucket",
      forcePathStyle: false,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
      maxAttempts: 3,
      requestHandler: { connectionTimeout: 10_000, requestTimeout: 5 * 60_000 },
    });
  return {
    config,
    provider,
    upload: client(config.uploadEndpoint, config.uploadMode),
  };
}
function storage() {
  storageGlobal.mediaStorage ??= createStorage(storageConfig());
  return storageGlobal.mediaStorage;
}
export function closeStorage() {
  const current = storageGlobal.mediaStorage;
  if (!current) return;
  current.upload.destroy();
  if (current.provider instanceof ECSRAMRoleCredentialsProvider) current.provider.close();
  delete storageGlobal.mediaStorage;
}
function target(mode: "service" | "bucket", endpoint: string, bucket: string) {
  // service 模式由 SDK 拼接桶名；bucket 模式要求完整桶域名。
  return mode === "bucket" ? endpoint : bucket;
}
export function publicMediaUrl(key: string) {
  // 公开链接使用配置的访问域名，不能使用不含桶名的 S3 服务 endpoint。
  return new URL(
    key.split("/").map(encodeURIComponent).join("/"),
    `${storageConfig().publicOrigin.replace(/\/$/, "")}/`,
  ).href;
}
export async function signUpload(key: string, contentType: string) {
  const { upload, config } = storage();
  const headers = { "Content-Type": contentType };
  const url = await getSignedUrl(
    upload,
    new PutObjectCommand({
      Bucket: target(config.uploadMode, config.uploadEndpoint, config.bucket),
      Key: key,
      ContentType: headers["Content-Type"],
    }),
    { expiresIn: UPLOAD_TTL_SECONDS, signableHeaders: new Set(["content-type"]) },
  );
  return { url, headers };
}
export function storageFailure(error: unknown) {
  if (error instanceof MediaError) return error;
  const name = error instanceof Error ? error.name : "UnknownError";
  console.error("媒体存储操作失败", { name });
  return new MediaError("STORAGE_UNAVAILABLE", "媒体存储暂时不可用，请重试。");
}

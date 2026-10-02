import "server-only";
import {
  ECSRAMRoleCredentialsProvider,
  EnvironmentVariableCredentialsProvider,
} from "@alicloud/credentials";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import sharp from "sharp";
import { z } from "zod";

import { MediaError } from "./error";
import { IMAGE_MAX_BYTES, ATTACHMENT_MAX_BYTES } from "./schema";

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
  serverEndpoint: httpsOrigin,
  uploadEndpoint: httpsOrigin,
  serverMode: z.enum(["service", "bucket"]),
  uploadMode: z.enum(["service", "bucket"]),
  publicOrigin: httpsOrigin,
  credentialMode: z.enum(["environment", "ecs_ram_role"]),
});
export function storageConfig() {
  const result = configSchema.safeParse({
    bucket: process.env.OSS_BUCKET,
    region: process.env.OSS_REGION,
    serverEndpoint: process.env.OSS_SERVER_ENDPOINT,
    uploadEndpoint: process.env.OSS_UPLOAD_ENDPOINT,
    serverMode: process.env.OSS_SERVER_ENDPOINT_MODE ?? "service",
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
    server: client(config.serverEndpoint, config.serverMode),
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
  current.server.destroy();
  current.upload.destroy();
  if (current.provider instanceof ECSRAMRoleCredentialsProvider) current.provider.close();
  delete storageGlobal.mediaStorage;
}
function target(mode: "service" | "bucket", endpoint: string, bucket: string) {
  // 本地 service 模式由 SDK 将桶名拼到 S3 服务域名；bucketEndpoint 兼容分支要求完整桶域名。
  // CopySource 始终使用真实桶名，与访问域名无关。
  return mode === "bucket" ? endpoint : bucket;
}
export function publicMediaUrl(key: string) {
  // 本地示例使用默认 Bucket HTTPS 域名；S3 服务 endpoint 本身不包含桶名，不能直接生成公开链接。
  return new URL(
    key.split("/").map(encodeURIComponent).join("/"),
    `${storageConfig().publicOrigin.replace(/\/$/, "")}/`,
  ).href;
}
export async function signUpload(key: string, bytes: number) {
  const { upload, config } = storage();
  const headers = { "Content-Type": "application/octet-stream" };
  const url = await getSignedUrl(
    upload,
    new PutObjectCommand({
      Bucket: target(config.uploadMode, config.uploadEndpoint, config.bucket),
      Key: key,
      ContentLength: bytes,
      ContentType: headers["Content-Type"],
    }),
    { expiresIn: UPLOAD_TTL_SECONDS, signableHeaders: new Set(["content-type", "content-length"]) },
  );
  return { url, headers };
}
export function storageFailure(error: unknown) {
  if (error instanceof MediaError) return error;
  const name = error instanceof Error ? error.name : "UnknownError";
  console.error("媒体存储操作失败", { name });
  return new MediaError("STORAGE_UNAVAILABLE", "媒体存储暂时不可用，请重试。");
}
export async function removeObject(key: string, signal = AbortSignal.timeout(60_000)) {
  const { server, config } = storage();
  await server.send(
    new DeleteObjectCommand({
      Bucket: target(config.serverMode, config.serverEndpoint, config.bucket),
      Key: key,
    }),
    { abortSignal: signal },
  );
}
type StoredUpload = {
  stagingKey: string;
  objectKey: string;
  expectedBytes: number;
  sha256: string;
  kind: string;
  name: string;
};
function disposition(name: string) {
  return `attachment; filename="download"; filename*=UTF-8''${encodeURIComponent(name).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)}`;
}
export async function verifyAndPublish(
  row: StoredUpload,
  beforePublish: () => Promise<void>,
  signal: AbortSignal,
) {
  const { server, config } = storage();
  const Bucket = target(config.serverMode, config.serverEndpoint, config.bucket);
  const head = await server.send(new HeadObjectCommand({ Bucket, Key: row.stagingKey }), {
    abortSignal: signal,
  });
  const cap = row.kind === "image" ? IMAGE_MAX_BYTES : ATTACHMENT_MAX_BYTES;
  if (head.ContentLength !== row.expectedBytes || row.expectedBytes > cap || !head.ETag)
    throw new MediaError("INVALID_INPUT", "上传文件大小与声明不一致。");
  const directory = await mkdtemp(join(tmpdir(), "fx-media-"));
  const path = join(directory, "upload");
  try {
    const object = await server.send(new GetObjectCommand({ Bucket, Key: row.stagingKey }), {
      abortSignal: signal,
    });
    if (!(object.Body instanceof Readable)) throw new Error("Missing Node.js object stream");
    const source = object.Body;
    if (object.ETag !== head.ETag) {
      source.destroy();
      throw new MediaError("INVALID_INPUT", "上传对象已变化，请重新上传。");
    }
    const sha = createHash("sha256");
    const md5 = createHash("md5");
    let bytes = 0;
    async function* checkedBytes(input: AsyncIterable<unknown>) {
      for await (const chunk of input) {
        if (!(chunk instanceof Uint8Array)) throw new Error("Invalid object stream");
        bytes += chunk.length;
        if (bytes > row.expectedBytes || bytes > cap)
          throw new MediaError("INVALID_INPUT", "上传文件超过大小限制。");
        sha.update(chunk);
        md5.update(chunk);
        yield chunk;
      }
    }
    await pipeline(source, checkedBytes, createWriteStream(path, { mode: 0o600 }), { signal });
    if (bytes !== row.expectedBytes || sha.digest("hex") !== row.sha256)
      throw new MediaError("INVALID_INPUT", "文件校验失败，请重新上传。");
    let mime = "application/octet-stream";
    let width: number | null = null;
    let height: number | null = null;
    if (row.kind === "image") {
      try {
        const image = sharp(path, {
          animated: true,
          limitInputPixels: 40_000_000,
          failOn: "warning",
        }).timeout({ seconds: 30 });
        const meta = await image.metadata();
        const formats: Record<string, string> = {
          jpeg: "image/jpeg",
          png: "image/png",
          webp: "image/webp",
          gif: "image/gif",
        };
        mime =
          meta.format === "heif" && meta.compression === "av1"
            ? "image/avif"
            : formats[meta.format ?? ""];
        width = meta.width ?? null;
        height = meta.pageHeight ?? meta.height ?? null;
        if (!mime || !width || !height || width * height * (meta.pages ?? 1) > 40_000_000)
          throw new Error("Unsupported image");
        // stats 会解码所有所选帧，不只读取可伪造或损坏的文件头；不生成大幅 raw 输出。
        await image.stats();
      } catch {
        throw new MediaError("INVALID_INPUT", "图片损坏、格式不支持或总像素超过 4000 万。");
      }
    }
    await beforePublish();
    signal.throwIfAborted();
    const metadata = {
      ContentType: mime,
      ContentDisposition: row.kind === "image" ? "inline" : disposition(row.name),
      CacheControl: "public, max-age=3600",
      Metadata: { sha256: row.sha256 },
    };
    try {
      await server.send(
        new CopyObjectCommand({
          Bucket,
          Key: row.objectKey,
          CopySource: `${config.bucket}/${row.stagingKey}`,
          CopySourceIfMatch: head.ETag,
          MetadataDirective: "REPLACE",
          ...metadata,
        }),
        { abortSignal: signal },
      );
    } catch (error) {
      // 只有明确不支持条件复制才退回已核验文件；源对象变化、权限和网络错误不能无条件复制。
      const name = error instanceof Error ? error.name : "";
      if (
        !["NotImplemented", "InvalidArgument", "NotSupported", "UnsupportedOperation"].includes(
          name,
        )
      )
        throw error;
      const body = createReadStream(path);
      try {
        await server.send(
          new PutObjectCommand({
            Bucket,
            Key: row.objectKey,
            Body: body,
            ContentLength: bytes,
            ContentMD5: md5.digest("base64"),
            ...metadata,
          }),
          { abortSignal: signal },
        );
      } finally {
        body.destroy();
      }
    }
    return { bytes, mime, width, height };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

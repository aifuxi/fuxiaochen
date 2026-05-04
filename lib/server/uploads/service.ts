import { generateCuid } from "@/lib/cuid";
import { aliOSS } from "@/lib/oss";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

import type { AdminUploadPresignInput } from "./dto";

const SIGNED_URL_EXPIRES_SECONDS = 300;

const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
} as const;

type AllowedImageMime = keyof typeof allowedImageTypes;

export type UploadPresignResult = {
  uploadUrl: string;
  fileUrl: string;
  objectKey: string;
  headers: Record<string, string>;
};

export type UploadService = {
  createPresignedUploadUrl(
    input: AdminUploadPresignInput,
  ): Promise<UploadPresignResult>;
};

export type UploadServiceDeps = {
  generateId?: () => string;
};

const isAllowedImageMime = (
  contentType: string,
): contentType is AllowedImageMime =>
  Object.hasOwn(allowedImageTypes, contentType);

const normalizeUploadDir = (value: string | undefined) =>
  value
    ?.trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/+/g, "/") ?? "";

const assertOssConfigured = () => {
  const missingKeys = [
    "OSS_ACCESS_KEY_ID",
    "OSS_ACCESS_KEY_SECRET",
    "OSS_REGION",
    "OSS_BUCKET",
  ].filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new AppError(
      ERROR_CODES.COMMON_INTERNAL_ERROR,
      "OSS is not configured",
      500,
      { missingKeys },
    );
  }
};

const createUnsupportedTypeError = (input: AdminUploadPresignInput) =>
  new AppError(
    ERROR_CODES.COMMON_VALIDATION_ERROR,
    "Unsupported upload file type",
    400,
    {
      contentType: input.contentType,
      extension: input.extension,
      allowedContentTypes: Object.keys(allowedImageTypes),
    },
  );

const buildObjectKey = ({
  input,
  generateId,
}: {
  input: AdminUploadPresignInput;
  generateId: () => string;
}) => {
  const uploadDir = normalizeUploadDir(process.env.OSS_UPLOAD_DIR);
  const segments = [uploadDir, `${generateId()}.${input.extension}`].filter(
    Boolean,
  );

  return segments.join("/");
};

const toObjectUrl = (signedUrl: string) => {
  const url = new URL(signedUrl);
  url.search = "";
  url.hash = "";

  return url.toString();
};

export function createUploadService({
  generateId = generateCuid,
}: UploadServiceDeps = {}): UploadService {
  return {
    async createPresignedUploadUrl(input) {
      assertOssConfigured();

      if (!isAllowedImageMime(input.contentType)) {
        throw createUnsupportedTypeError(input);
      }

      const expectedExtension = allowedImageTypes[input.contentType];

      if (input.extension !== expectedExtension) {
        throw createUnsupportedTypeError(input);
      }

      const objectKey = buildObjectKey({
        input,
        generateId,
      });
      const headers = {
        "Content-Type": input.contentType,
      };
      const uploadUrl = await aliOSS.signatureUrlV4(
        "PUT",
        SIGNED_URL_EXPIRES_SECONDS,
        { headers },
        objectKey,
      );

      return {
        uploadUrl,
        fileUrl: toObjectUrl(uploadUrl),
        objectKey,
        headers,
      };
    },
  };
}

export const uploadService = createUploadService();

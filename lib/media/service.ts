import "server-only";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/session-access";
import { writeTransaction } from "@/lib/database";
import { mediaUploadLimit } from "@/lib/database/schema";

import type { UploadInput, UploadTicket } from "./schema";

import { MediaError } from "./error";
import {
  publicMediaUrl,
  signUpload,
  storageConfig,
  storageFailure,
  UPLOAD_TTL_SECONDS,
} from "./storage";

function authorize(actor: TaxonomyActor) {
  const admin = getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new MediaError("UNAUTHORIZED", "登录已失效，请重新登录。");
}

export async function createUpload(
  input: UploadInput,
  actor: TaxonomyActor,
): Promise<UploadTicket> {
  authorize(actor);
  storageConfig();
  const now = Date.now();
  const window = Math.floor(now / 60_000);
  writeTransaction((tx) => {
    authorize(actor);
    const limit = tx
      .select()
      .from(mediaUploadLimit)
      .where(eq(mediaUploadLimit.adminId, actor.adminId))
      .get();
    if (limit?.window === window && limit.count >= 20)
      throw new MediaError(
        "RATE_LIMITED",
        "上传请求过于频繁，请稍后重试。",
        Math.ceil(((window + 1) * 60_000 - now) / 1000),
      );
    tx.insert(mediaUploadLimit)
      .values({ adminId: actor.adminId, window, count: 1 })
      .onConflictDoUpdate({
        target: mediaUploadLimit.adminId,
        set: { window, count: limit?.window === window ? limit.count + 1 : 1 },
      })
      .run();
  });
  // 每次上传使用独立正式对象；成功与否由浏览器的 OSS PUT 结果决定，不建立媒体记录。
  const key = `media/${randomUUID()}`;
  try {
    const signed = await signUpload(key, input.contentType);
    authorize(actor);
    return {
      ...signed,
      publicUrl: publicMediaUrl(key),
      expiresAt: new Date(Date.now() + UPLOAD_TTL_SECONDS * 1000).toISOString(),
    };
  } catch (error) {
    throw storageFailure(error);
  }
}

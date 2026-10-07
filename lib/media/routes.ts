import "server-only";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession, SESSION_COOKIE } from "@/lib/auth/service";

import { MediaError } from "./error";
import { deleteMediaSchema, mediaIdSchema, mediaQuerySchema, uploadSchema } from "./schema";
import {
  completeUpload,
  createUpload,
  deleteMedia,
  getMediaReferences,
  listMedia,
} from "./service";

export const mediaRoutes = new Hono<{ Variables: { admin: TaxonomyActor } }>();
mediaRoutes.use("*", async (c, next) => {
  const sessionToken = getCookie(c, SESSION_COOKIE);
  const admin = await getSession(sessionToken);
  if (!admin)
    return c.json({ error: { code: "UNAUTHORIZED", message: "登录已失效，请重新登录。" } }, 401);
  c.set("admin", { adminId: admin.adminId, sessionToken });
  if (
    c.req.method === "POST" &&
    c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
  )
    return c.json(
      { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "请使用 JSON 提交。" } },
      415,
    );
  return next();
});
const idValidator = zValidator("param", mediaIdSchema, (result, c) =>
  !result.success
    ? c.json({ error: { code: "INVALID_INPUT", message: "无效的媒体 ID。" } }, 400)
    : undefined,
);
mediaRoutes.get(
  "/",
  zValidator("query", mediaQuerySchema, (result, c) =>
    !result.success
      ? c.json({ error: { code: "INVALID_INPUT", message: "媒体查询参数无效。" } }, 400)
      : undefined,
  ),
  async (c) => c.json({ data: await listMedia(c.req.valid("query"), c.get("admin")) }),
);
mediaRoutes.post(
  "/uploads",
  zValidator("json", uploadSchema, (result, c) =>
    !result.success
      ? c.json({ error: { code: "INVALID_INPUT", message: result.error.issues[0].message } }, 400)
      : undefined,
  ),
  async (c) => c.json({ data: await createUpload(c.req.valid("json"), c.get("admin")) }, 201),
);
mediaRoutes.post(
  "/uploads/:id/complete",
  idValidator,
  zValidator("json", z.object({}).strict(), (result, c) =>
    !result.success
      ? c.json(
          { error: { code: "INVALID_INPUT", message: "完成上传请求必须为空 JSON 对象。" } },
          400,
        )
      : undefined,
  ),
  async (c) => c.json({ data: await completeUpload(c.req.valid("param").id, c.get("admin")) }),
);
mediaRoutes.get("/:id/references", idValidator, async (c) =>
  c.json({ data: await getMediaReferences(c.req.valid("param").id, c.get("admin")) }),
);
mediaRoutes.delete("/:id", idValidator, async (c) => {
  const text = await c.req.text();
  if (
    text &&
    c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
  )
    return c.json(
      { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "请使用 JSON 提交。" } },
      415,
    );
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new MediaError("INVALID_INPUT", "请求 JSON 格式无效。");
  }
  const parsed = deleteMediaSchema.safeParse(body);
  if (!parsed.success) throw new MediaError("INVALID_INPUT", "删除请求参数无效。");
  return c.json({ data: await deleteMedia(c.req.valid("param").id, c.get("admin"), parsed.data) });
});
mediaRoutes.onError((error, c) => {
  if (error instanceof MediaError) {
    if (error.retryAfter) c.header("Retry-After", String(Math.max(1, error.retryAfter)));
    const status =
      error.code === "UNAUTHORIZED"
        ? 401
        : error.code === "NOT_FOUND"
          ? 404
          : error.code === "RATE_LIMITED"
            ? 429
            : ["PROCESSING", "RESOURCE_IN_USE", "REFERENCES_CHANGED"].includes(error.code)
              ? 409
              : error.code === "STORAGE_UNAVAILABLE" || error.code === "STORAGE_NOT_CONFIGURED"
                ? 503
                : 400;
    return c.json({ error: { code: error.code, message: error.message } }, status);
  }
  if (error instanceof HTTPException && error.status === 400)
    return c.json({ error: { code: "INVALID_INPUT", message: "请求 JSON 格式无效。" } }, 400);
  console.error("媒体接口失败", { name: error.name });
  return c.json(
    { error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请重试。" } },
    503,
  );
});

import "server-only";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { readAdminSession } from "@/lib/auth/service";

import { MediaError } from "./error";
import { uploadSchema } from "./schema";
import { createUpload } from "./service";

export const mediaRoutes = new Hono<{ Variables: { admin: TaxonomyActor } }>();
mediaRoutes.use("*", async (c, next) => {
  const admin = await readAdminSession(c.req.raw.headers);
  if (!admin)
    return c.json({ error: { code: "UNAUTHORIZED", message: "登录已失效，请重新登录。" } }, 401);
  c.set("admin", { adminId: admin.adminId, sessionToken: admin.sessionToken });
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
mediaRoutes.post(
  "/uploads",
  zValidator("json", uploadSchema, (result, c) =>
    !result.success
      ? c.json({ error: { code: "INVALID_INPUT", message: result.error.issues[0].message } }, 400)
      : undefined,
  ),
  async (c) => c.json({ data: await createUpload(c.req.valid("json"), c.get("admin")) }, 201),
);
mediaRoutes.onError((error, c) => {
  if (error instanceof MediaError) {
    if (error.retryAfter) c.header("Retry-After", String(Math.max(1, error.retryAfter)));
    const status =
      error.code === "UNAUTHORIZED"
        ? 401
        : error.code === "RATE_LIMITED"
          ? 429
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

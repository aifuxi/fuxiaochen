import "server-only";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { validate } from "@/lib/admin/routes";

import { collectEvent, AnalyticsError } from "./collection";
import { eventSchema } from "./schema";

export const collectionRoutes = new Hono();
collectionRoutes.post(
  "/events",
  async (c, next) => {
    if (c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json")
      return c.json(
        { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "请使用 JSON 提交。" } },
        415,
      );
    return next();
  },
  validate("json", eventSchema),
  async (c) => {
    await collectEvent(c.req.valid("json"), c.req.raw.headers);
    return c.body(null, 204);
  },
);
collectionRoutes.onError((error, c) => {
  if (error instanceof AnalyticsError) {
    if (error.retryAfter) c.header("Retry-After", String(error.retryAfter));
    return c.json(
      { error: { code: error.code, message: error.message } },
      error.code === "RATE_LIMITED" ? 429 : error.code === "EVENT_CONFLICT" ? 409 : 400,
    );
  }
  if (error instanceof HTTPException && error.status === 400)
    return c.json({ error: { code: "INVALID_INPUT", message: "请求 JSON 格式无效。" } }, 400);
  console.error("访问采集失败", { name: error.name });
  return c.json({ error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用。" } }, 503);
});

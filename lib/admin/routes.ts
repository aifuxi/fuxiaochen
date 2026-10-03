import "server-only";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession, SESSION_COOKIE } from "@/lib/auth/service";

import { AdminBusinessError } from "./service";

export function adminRoutes() {
  const routes = new Hono<{ Variables: { admin: TaxonomyActor } }>();
  routes.use("*", async (c, next) => {
    const sessionToken = getCookie(c, SESSION_COOKIE);
    const admin = await getSession(sessionToken);
    if (!admin)
      return c.json({ error: { code: "UNAUTHORIZED", message: "登录已失效，请重新登录。" } }, 401);
    c.set("admin", { adminId: admin.adminId, sessionToken });
    if (
      ["POST", "PUT"].includes(c.req.method) &&
      c.req.header("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json"
    )
      return c.json(
        { error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "请使用 JSON 提交。" } },
        415,
      );
    return next();
  });
  routes.onError((error, c) => {
    if (error instanceof AdminBusinessError) {
      const status =
        error.code === "UNAUTHORIZED"
          ? 401
          : error.code === "NOT_FOUND"
            ? 404
            : error.code === "VERSION_CONFLICT"
              ? 409
              : error.code === "SERVICE_UNAVAILABLE"
                ? 503
                : 400;
      return c.json({ error: { code: error.code, message: error.message } }, status);
    }
    if (error instanceof HTTPException && error.status === 400)
      return c.json({ error: { code: "INVALID_INPUT", message: "请求 JSON 格式无效。" } }, 400);
    console.error("后台配置接口失败", { name: error.name });
    return c.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请稍后重试。" } },
      503,
    );
  });
  return routes;
}
export function validate<T extends z.ZodType, Target extends "json" | "query" | "param">(
  target: Target,
  schema: T,
) {
  return zValidator(target, schema, (result, c) => {
    if (result.success) return undefined;
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return c.json(
      { error: { code: "INVALID_INPUT", message: result.error.issues[0].message, fieldErrors } },
      400,
    );
  });
}

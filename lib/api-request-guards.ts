import type { Context, Hono } from "hono";

import { bodyLimit } from "hono/body-limit";

import { acceptsLoginJson } from "./auth/login-response";

function expectsJsonError(c: Context) {
  return (
    c.req.path.startsWith("/api/admin/") ||
    c.req.path.startsWith("/api/public/") ||
    acceptsLoginJson(c)
  );
}

export function registerApiRequestGuards(api: Hono, origin: () => string) {
  api.use("*", async (c, next) => {
    c.header("Cache-Control", "no-store");
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(c.req.method) &&
      c.req.header("origin") !== origin()
    ) {
      if (expectsJsonError(c))
        return c.json({ error: { code: "FORBIDDEN_ORIGIN", message: "请求来源不被允许。" } }, 403);
      return c.text("请求来源不被允许。", 403);
    }
    return next();
  });

  const smallBodyLimit = bodyLimit({
    maxSize: 16 * 1024,
    onError: (c) =>
      expectsJsonError(c)
        ? c.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "请求内容过大。" } }, 413)
        : c.text("请求内容过大。", 413),
  });
  const articleBodyLimit = bodyLimit({
    maxSize: 1024 * 1024,
    onError: (c) =>
      c.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "文章请求最多 1 MiB。" } }, 413),
  });
  const settingsBodyLimit = bodyLimit({
    maxSize: 256 * 1024,
    onError: (c) =>
      c.json({ error: { code: "PAYLOAD_TOO_LARGE", message: "设置请求最多256 KiB。" } }, 413),
  });
  api.use("*", (c, next) => {
    const articleWrite =
      (c.req.method === "POST" && c.req.path === "/api/admin/posts") ||
      (c.req.method === "PUT" && /^\/api\/admin\/posts\/[^/]+$/.test(c.req.path));
    if (c.req.method === "PUT" && /^\/api\/admin\/settings\/?$/.test(c.req.path))
      return settingsBodyLimit(c, next);
    return (articleWrite ? articleBodyLimit : smallBodyLimit)(c, next);
  });
}

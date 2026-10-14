import "server-only";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { registerApiRequestGuards } from "./api-request-guards";
import { handleLoginError } from "./auth/login-response";
import { createLoginRoutes } from "./auth/login-routes";
import { passkeyRoutes } from "./auth/passkey-routes";
import { consumeLoginAttempt, login, readAdminSession, signOut } from "./auth/service";
import { changelogRoutes } from "./changelog/routes";
import { friendRoutes } from "./friends-links/routes";
import { mediaRoutes } from "./media/routes";
import { operationsRoutes } from "./operations/routes";
import { postRoutes } from "./posts/routes";
import { settingsRoutes } from "./settings/routes";
import { siteOrigin } from "./site-origin";
import { taxonomyRoutes } from "./taxonomy/routes";

export const api = new Hono().basePath("/api");

registerApiRequestGuards(api, siteOrigin);
api.route("/auth/passkey", passkeyRoutes);
api.route("/admin/posts", postRoutes);
api.route("/admin/media", mediaRoutes);
api.route("/admin/settings", settingsRoutes);
api.route("/admin/friends-links", friendRoutes);
api.route("/admin/changelog", changelogRoutes);

api.route("/admin", operationsRoutes);
api.route("/admin", taxonomyRoutes);

api.route(
  "/",
  createLoginRoutes({
    consumeLoginAttempt,
    login: async (credentials, headers) => {
      const previous = await readAdminSession(headers);
      return login(credentials, previous?.sessionToken, headers);
    },
  }),
);

api.post("/logout", async (c) => {
  const headers = await signOut(c.req.raw.headers);
  for (const cookie of headers.getSetCookie()) c.header("Set-Cookie", cookie, { append: true });
  return c.redirect("/login", 303);
});

api.onError((error, c) => {
  if (c.req.path === "/api/login") return handleLoginError(error, c);
  if (c.req.path.startsWith("/api/admin/") || c.req.path.startsWith("/api/public/")) {
    console.error("后台业务接口失败", { name: error.name });
    return c.json(
      { error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请稍后重试。" } },
      503,
    );
  }
  if (error instanceof HTTPException && error.status === 400) {
    return c.redirect("/login?error=invalid", 303);
  }
  // 不记录请求体、Cookie 或可能包含参数的数据库异常消息。
  console.error("后台鉴权接口失败", { name: error.name });
  c.header("Cache-Control", "no-store");
  return c.text("服务暂时不可用，请稍后重试。", 503);
});

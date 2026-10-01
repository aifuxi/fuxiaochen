import "server-only";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { loginSchema } from "./auth/schema";
import {
  consumeLoginAttempt,
  login,
  logout,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "./auth/service";

function appOrigin() {
  const configured = z.url().parse(process.env.APP_ORIGIN);
  const url = new URL(configured);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.origin !== configured ||
    (process.env.NODE_ENV === "production" && url.protocol !== "https:")
  ) {
    throw new Error("APP_ORIGIN 必须为站点 origin，生产环境必须使用 HTTPS");
  }
  return configured;
}

export const api = new Hono().basePath("/api");

api.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  if (c.req.method === "POST" && c.req.header("origin") !== appOrigin()) {
    return c.text("请求来源不被允许。", 403);
  }
  return next();
});

api.use("*", bodyLimit({ maxSize: 16 * 1024, onError: (c) => c.text("请求内容过大。", 413) }));

api.post(
  "/login",
  async (c, next) => {
    const limit = await consumeLoginAttempt();
    if (!limit.allowed) {
      c.header("Retry-After", String(limit.retryAfter));
      return c.text("登录请求过于频繁，请稍后重试。", 429);
    }
    const contentType = c.req.header("content-type")?.split(";")[0].trim();
    if (
      contentType !== "application/x-www-form-urlencoded" &&
      contentType !== "multipart/form-data"
    ) {
      return c.text("请使用表单提交登录凭据。", 415);
    }
    return next();
  },
  zValidator("form", loginSchema, (result, c) => {
    if (!result.success) return c.redirect("/login?error=invalid", 303);
    return undefined;
  }),
  async (c) => {
    const token = await login(c.req.valid("form"), getCookie(c, SESSION_COOKIE));
    if (!token) return c.redirect("/login?error=invalid", 303);
    setCookie(c, SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return c.redirect("/admin", 303);
  },
);

api.post("/logout", async (c) => {
  await logout(getCookie(c, SESSION_COOKIE));
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.redirect("/login", 303);
});

api.onError((error, c) => {
  if (error instanceof HTTPException && error.status === 400) {
    return c.redirect("/login?error=invalid", 303);
  }
  // 不记录请求体、Cookie 或可能包含参数的数据库异常消息。
  console.error("后台鉴权接口失败", { name: error.name });
  c.header("Cache-Control", "no-store");
  return c.text("服务暂时不可用，请稍后重试。", 503);
});

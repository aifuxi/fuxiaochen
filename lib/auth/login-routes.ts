import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";

import type { LoginFieldErrors } from "./login-response";
import type { LoginCredentials } from "./schema";

import { acceptsLoginJson, handleLoginError, loginErrorResponse } from "./login-response";
import { loginSchema } from "./schema";

type LoginDependencies = {
  consumeLoginAttempt: () => Promise<{ allowed: boolean; retryAfter: number }>;
  login: (
    credentials: LoginCredentials,
    previousToken: string | undefined,
  ) => Promise<string | null>;
  sessionCookie: string;
  sessionMaxAge: number;
  secureCookie: boolean;
};

export function createLoginRoutes(dependencies: LoginDependencies) {
  const routes = new Hono();
  routes.onError(handleLoginError);
  routes.post(
    "/login",
    async (c, next) => {
      const limit = await dependencies.consumeLoginAttempt();
      if (!limit.allowed) {
        c.header("Retry-After", String(limit.retryAfter));
        return loginErrorResponse(c, 429, "RATE_LIMITED", "登录请求过于频繁，请稍后重试。");
      }
      const contentType = c.req.header("content-type")?.split(";")[0].trim();
      if (
        contentType !== "application/x-www-form-urlencoded" &&
        contentType !== "multipart/form-data"
      )
        return loginErrorResponse(c, 415, "UNSUPPORTED_MEDIA_TYPE", "请使用表单提交登录凭据。");
      return next();
    },
    zValidator("form", loginSchema, (result, c) => {
      if (result.success) return undefined;
      const fieldErrors: LoginFieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field !== "username" && field !== "password") continue;
        const message =
          issue.code === "invalid_type"
            ? field === "username"
              ? "请输入用户名"
              : "请输入密码"
            : issue.message;
        (fieldErrors[field] ??= []).push(message);
      }
      return loginErrorResponse(c, 400, "INVALID_INPUT", "请检查用户名和密码。", fieldErrors);
    }),
    async (c) => {
      const token = await dependencies.login(
        c.req.valid("form"),
        getCookie(c, dependencies.sessionCookie),
      );
      if (!token)
        return loginErrorResponse(c, 401, "INVALID_CREDENTIALS", "用户名或密码不正确，请重试。");
      setCookie(c, dependencies.sessionCookie, token, {
        httpOnly: true,
        secure: dependencies.secureCookie,
        sameSite: "Strict",
        path: "/",
        maxAge: dependencies.sessionMaxAge,
      });
      return acceptsLoginJson(c) ? c.json({ success: true }) : c.redirect("/admin", 303);
    },
  );
  return routes;
}

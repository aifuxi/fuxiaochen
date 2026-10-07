import type { Context } from "hono";

import { HTTPException } from "hono/http-exception";

export type LoginFieldErrors = Partial<Record<"username" | "password", string[]>>;
export type LoginErrorCode =
  | "INVALID_INPUT"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN_ORIGIN"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE";
type LoginErrorStatus = 400 | 401 | 403 | 413 | 415 | 429 | 503;

export function acceptsLoginJson(c: Context) {
  if (c.req.path !== "/api/login") return false;
  return (c.req.header("accept") ?? "").split(",").some((range) => {
    const [type, ...parameters] = range.trim().toLowerCase().split(";");
    return (
      type.trim() === "application/json" &&
      !parameters.some((parameter) => /^q\s*=\s*0(?:\.0*)?$/.test(parameter.trim()))
    );
  });
}

export function loginErrorResponse(
  c: Context,
  status: LoginErrorStatus,
  code: LoginErrorCode,
  message: string,
  fieldErrors?: LoginFieldErrors,
) {
  if (acceptsLoginJson(c))
    return c.json({ error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } }, status);
  if (status === 400 || status === 401) return c.redirect("/login?error=invalid", 303);
  return c.text(message, status);
}

export function handleLoginError(error: Error, c: Context) {
  c.header("Cache-Control", "no-store");
  if (error instanceof HTTPException && error.status === 400)
    return loginErrorResponse(c, 400, "INVALID_INPUT", "登录表单格式无效，请重新填写。");
  // 不记录请求体、Cookie 或可能包含参数的内部异常消息。
  console.error("后台鉴权接口失败", { name: error.name });
  return loginErrorResponse(c, 503, "SERVICE_UNAVAILABLE", "服务暂时不可用，请稍后重试。");
}

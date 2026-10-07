import type { LoginErrorCode, LoginFieldErrors } from "./login-response";
import type { LoginCredentials } from "./schema";

export type LoginFailure = {
  code: LoginErrorCode | "NETWORK_ERROR" | "UNCONFIRMED_RESULT";
  message: string;
  fieldErrors?: LoginFieldErrors;
  retryAfter?: number;
};
export type LoginResult = { success: true } | { success: false; error: LoginFailure };

const failures: Record<number, LoginFailure> = {
  400: { code: "INVALID_INPUT", message: "请检查用户名和密码。" },
  401: { code: "INVALID_CREDENTIALS", message: "用户名或密码不正确，请重试。" },
  403: { code: "FORBIDDEN_ORIGIN", message: "请求来源不被允许，请刷新登录页后重试。" },
  413: { code: "PAYLOAD_TOO_LARGE", message: "请求内容过大，请检查输入后重试。" },
  415: { code: "UNSUPPORTED_MEDIA_TYPE", message: "登录表单提交失败，请刷新页面后重试。" },
  429: { code: "RATE_LIMITED", message: "登录请求过于频繁，请稍后重试。" },
  503: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请稍后重试。" },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFieldErrors(value: unknown): LoginFieldErrors | undefined {
  if (!isObject(value)) return undefined;
  const fieldErrors: LoginFieldErrors = {};
  for (const field of ["username", "password"] as const) {
    const messages = value[field];
    if (Array.isArray(messages)) {
      const readable = messages.filter(
        (message): message is string => typeof message === "string" && message.length > 0,
      );
      if (readable.length) fieldErrors[field] = readable;
    }
  }
  return Object.keys(fieldErrors).length ? fieldErrors : undefined;
}

export async function submitLogin(
  credentials: LoginCredentials,
  fetcher: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<LoginResult> {
  try {
    const response = await fetcher("/api/login", {
      method: "POST",
      credentials: "same-origin",
      redirect: "error",
      signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(credentials),
    });
    const payload: unknown =
      response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ===
      "application/json"
        ? await response.json().catch(() => null)
        : null;
    if (response.ok && isObject(payload) && payload.success === true) return { success: true };

    const failure: LoginFailure = {
      ...(failures[response.status] ?? {
        code: "UNCONFIRMED_RESULT",
        message: "登录结果无法确认，请稍后重试。",
      }),
    };
    if (response.status === 400 && isObject(payload) && isObject(payload.error))
      failure.fieldErrors = readFieldErrors(payload.error.fieldErrors);
    if (response.status === 429) {
      const value = response.headers.get("retry-after");
      if (value && /^\d+$/.test(value)) {
        const seconds = Number(value);
        if (Number.isSafeInteger(seconds) && seconds > 0) failure.retryAfter = seconds;
      }
    }
    return { success: false, error: failure };
  } catch {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "网络连接失败，请检查网络后重试。" },
    };
  }
}

"use client";

import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/client";
import { useSyncExternalStore } from "react";

export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [passkeyClient()],
});

export function supportsPasskey() {
  return (
    window.isSecureContext &&
    typeof PublicKeyCredential !== "undefined" &&
    Boolean(navigator.credentials)
  );
}

const subscribe = () => () => {};
const serverSnapshot = () => false;
// 能力来自浏览器 API；SSR 先禁用，hydration 后读取，避免在 effect 中派生状态。
export function usePasskeySupport() {
  return useSyncExternalStore(subscribe, supportsPasskey, serverSnapshot);
}

// 不直接展示浏览器或服务端异常，取消认证也保留可用的密码备用入口。
export function passkeyError(error: unknown) {
  const value =
    error && typeof error === "object" ? (error as { code?: string; status?: number }) : {};
  if (["AUTH_CANCELLED", "ERROR_NOT_ALLOWED", "ERROR_CEREMONY_ABORTED"].includes(value.code ?? ""))
    return "通行密钥操作已取消或未完成，可以重试或使用密码登录。";
  if (value.code === "FRESH_SESSION_REQUIRED" || value.code === "SESSION_NOT_FRESH")
    return "添加通行密钥需要近期登录，请退出后重新登录，再添加。";
  if (value.status === 401) return "认证未通过或登录已失效，请用密码重新登录后再试。";
  if (value.status === 429) return "请求过于频繁，请稍后重试。";
  if (value.status === 403) return "请求来源或设备验证未通过，请刷新页面后重试。";
  if (value.status === 400) return "通行密钥验证未通过，请重试或使用密码登录。";
  return "通行密钥操作失败，请检查网络后重试，或使用密码登录。";
}

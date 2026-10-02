"use client";
import { AdminRequestError } from "./use-posts";
export function resourceRequest(base: string) {
  return async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${base}${path}`, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
    });
    const body = await response.json().catch(() => {
      throw new AdminRequestError("无法读取服务响应，请重新载入核对。", "INVALID_RESPONSE");
    });
    if (!response.ok)
      throw new AdminRequestError(
        body?.error?.message ?? "请求失败，请重试。",
        body?.error?.code ?? "REQUEST_FAILED",
        body?.error?.fieldErrors,
      );
    if (!body || typeof body !== "object" || !("data" in body))
      throw new AdminRequestError("服务响应缺少数据，请重新载入核对。", "INVALID_RESPONSE");
    return body.data;
  };
}

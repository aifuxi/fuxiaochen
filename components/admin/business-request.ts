"use client";
import { AdminRequestError } from "./use-posts";
export function resourceRequest(base: string) {
  return async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${base}${path}`, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
    }).catch((error: unknown) => {
      if (init?.signal?.aborted) throw error;
      throw new AdminRequestError("网络连接失败，请确认服务可用后重新查询核对。", "REQUEST_FAILED");
    });
    const body = await response.json().catch((error: unknown) => {
      if (init?.signal?.aborted) throw error;
      throw new AdminRequestError(
        "无法读取服务响应，请重新载入核对。",
        "INVALID_RESPONSE",
        {},
        response.status,
      );
    });
    if (!response.ok)
      throw new AdminRequestError(
        body?.error?.message ?? "请求失败，请重试。",
        body?.error?.code ?? "REQUEST_FAILED",
        body?.error?.fieldErrors,
        response.status,
      );
    if (!body || typeof body !== "object" || !("data" in body))
      throw new AdminRequestError(
        "服务响应缺少数据，请重新载入核对。",
        "INVALID_RESPONSE",
        {},
        response.status,
      );
    return body.data;
  };
}

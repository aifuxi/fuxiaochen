"use client";
import { useEffect, useState } from "react";

import type { PostQuery } from "@/lib/posts/schema";
import type { PostList } from "@/lib/posts/schema";

export class AdminRequestError extends Error {
  constructor(
    message: string,
    public code: string,
    public fieldErrors: Record<string, string[]> = {},
    public status = 0,
  ) {
    super(message);
  }
}
export async function postRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/posts${path}`, {
    ...init,
    cache: "no-store",
    credentials: "same-origin",
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new AdminRequestError("无法读取服务响应，请重试。", "INVALID_RESPONSE");
  }
  if (!body || typeof body !== "object")
    throw new AdminRequestError("无法读取服务响应，请重试。", "INVALID_RESPONSE");
  if (!response.ok)
    throw new AdminRequestError(
      body.error?.message ?? "请求失败，请稍后重试。",
      body.error?.code ?? "REQUEST_FAILED",
      body.error?.fieldErrors,
    );
  if (!("data" in body))
    throw new AdminRequestError("服务响应缺少文章数据，请重试。", "INVALID_RESPONSE");
  return body.data;
}
export function usePostQuery<T>(
  path: string | null,
  revision: number,
  load: (path: string, init?: RequestInit) => Promise<T>,
): { data: T | null; error: string; loading: boolean; reload: () => void } {
  const [attempt, setAttempt] = useState(0);
  const key = `${path}|${revision}|${attempt}`;
  const [state, setState] = useState<{
    key: string;
    data: T | null;
    error: string;
    loading: boolean;
  }>({ key: "", data: null, error: "", loading: true });
  useEffect(() => {
    if (path === null) return undefined;
    const controller = new AbortController();
    void load(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ key, data, error: "", loading: false });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            key,
            data: null,
            error: error instanceof Error ? error.message : "文章加载失败。",
            loading: false,
          });
      });
    return () => controller.abort();
  }, [path, key, load]);
  const current = state.key === key;
  return {
    data: current ? state.data : null,
    error: current ? state.error : "",
    loading: path !== null && (!current || state.loading),
    reload: () => setAttempt((value) => value + 1),
  };
}
export function useDebouncedPostQuery(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [value]);
  return debounced;
}
export function usePostList(
  filters: {
    q?: string;
    status?: string;
    categoryId?: string;
    page?: number;
    pageSize?: number;
    sortBy?: PostQuery["sortBy"];
    sortDirection?: PostQuery["sortDirection"];
  },
  revision: number,
  enabled = true,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters))
    if (value !== undefined && value !== "" && value !== "all") params.set(key, String(value));
  return usePostQuery(enabled ? `?${params}` : null, revision, postRequest<PostList>);
}

export function usePostClock() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    queueMicrotask(tick);
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

"use client";

import { useEffect, useRef, useState } from "react";

export type PagedResource = {
  items: { id: string }[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
};

/** 合并服务端批次；保留排序顺序，跨批重复记录使用较后响应中的版本。 */
export function mergeResourcePages<P extends PagedResource>(pages: readonly P[]): P | null {
  if (!pages.length) return null;
  const ordered = pages.toSorted((a, b) => a.page - b.page);
  const latest = new Map<string, P["items"][number]>();
  for (const page of pages) for (const item of page.items) latest.set(item.id, item);
  const items = new Map<string, P["items"][number]>();
  for (const page of ordered)
    for (const item of page.items) items.set(item.id, latest.get(item.id)!);
  return { ...pages[pages.length - 1], items: [...items.values()] };
}

function pagePath(path: string, page: number) {
  const params = new URLSearchParams(path.startsWith("?") ? path.slice(1) : path);
  params.set("page", String(page));
  return `?${params}`;
}

/**
 * 页面仍按既有 API 分页取数；追加失败保留已加载内容，条件或版本变化取消旧请求。
 * 旧的 page 深链从对应批次开始，提供向前追加入口，不悄悄改写原 URL。
 */
export function usePagedResource<P extends PagedResource>(
  path: string | null,
  revision: number,
  load: (path: string, init?: RequestInit) => Promise<P>,
  initialPage = 1,
) {
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([path, revision, initialPage, attempt]);
  const [state, setState] = useState<{
    key: string;
    pages: P[];
    loading: boolean;
    loadingMore: boolean;
    error: string;
    moreError: string;
    failedDirection: "next" | "previous";
  }>({
    key: "",
    pages: [],
    loading: true,
    loadingMore: false,
    error: "",
    moreError: "",
    failedDirection: "next",
  });
  const request = useRef<AbortController | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (path === null) return undefined;
    const controller = new AbortController();
    request.current = controller;
    busy.current = true;
    void load(pagePath(path, initialPage), { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setState({
            key,
            pages: [data],
            loading: false,
            loadingMore: false,
            error: "",
            moreError: "",
            failedDirection: "next",
          });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            key,
            pages: [],
            loading: false,
            loadingMore: false,
            error: error instanceof Error ? error.message : "记录加载失败，请重试。",
            moreError: "",
            failedDirection: "next",
          });
      })
      .finally(() => {
        if (request.current === controller) busy.current = false;
      });
    return () => {
      controller.abort();
      // 包括初始请求结束后启动的追加请求。
      request.current?.abort();
      request.current = null;
      busy.current = false;
    };
  }, [path, load, initialPage, key]);

  const current = state.key === key && path !== null;
  const data = current ? mergeResourcePages(state.pages) : null;
  const firstPage =
    current && state.pages.length ? Math.min(...state.pages.map((page) => page.page)) : initialPage;
  const lastPage =
    current && state.pages.length ? Math.max(...state.pages.map((page) => page.page)) : initialPage;

  async function extend(direction: "next" | "previous"): Promise<string | undefined> {
    if (!current || !data || path === null || busy.current) return undefined;
    const page = direction === "next" ? lastPage + 1 : firstPage - 1;
    if (page < 1 || page > data.pageCount) return undefined;
    const controller = new AbortController();
    request.current = controller;
    busy.current = true;
    setState((value) => ({
      ...value,
      loadingMore: true,
      // 重试期间保留错误入口，避免按钮卸载后键盘焦点丢失。
      failedDirection: direction,
    }));
    try {
      const next = await load(pagePath(path, page), { signal: controller.signal });
      if (controller.signal.aborted) return undefined;
      const ids = new Set(data.items.map((item) => item.id));
      const firstNew = next.items.find((item) => !ids.has(item.id))?.id;
      setState((value) =>
        value.key === key
          ? {
              ...value,
              // 服务端在删除后可能回退页码，替换对应批次并丢弃已不存在的后续页。
              pages: [
                ...value.pages.filter(
                  (item) => item.page !== next.page && item.page <= next.pageCount,
                ),
                next,
              ],
              loadingMore: false,
              moreError: "",
            }
          : value,
      );
      return firstNew;
    } catch (error) {
      if (!controller.signal.aborted)
        setState((value) =>
          value.key === key
            ? {
                ...value,
                loadingMore: false,
                moreError: error instanceof Error ? error.message : "后续记录加载失败，请重试。",
              }
            : value,
        );
      return undefined;
    } finally {
      if (request.current === controller) busy.current = false;
    }
  }

  return {
    data,
    error: current ? state.error : "",
    loading: path !== null && (!current || state.loading),
    loadingMore: current && state.loadingMore,
    moreError: current ? state.moreError : "",
    hasPrevious: Boolean(data && firstPage > 1),
    hasMore: Boolean(data && lastPage < data.pageCount),
    pageForRecord: (id: string) =>
      current
        ? state.pages.findLast((page) => page.items.some((item) => item.id === id))?.page
        : undefined,
    reload: () => setAttempt((value) => value + 1),
    loadMore: () => extend("next"),
    loadPrevious: () => extend("previous"),
    retryMore: () => extend(state.failedDirection),
  };
}

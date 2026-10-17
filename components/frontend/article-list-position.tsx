"use client";

import { useLayoutEffect, useRef } from "react";

const positionKey = "fuxiaochen:article-list-position";
const restoreKey = "fuxiaochen:article-list-restore";
type ListPosition = { path: string; top: number; titleId: string };

function storedPosition(): ListPosition | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(positionKey) ?? "null");
    if (
      value &&
      typeof value === "object" &&
      "path" in value &&
      typeof value.path === "string" &&
      "top" in value &&
      typeof value.top === "number" &&
      Number.isFinite(value.top) &&
      value.top >= 0 &&
      "titleId" in value &&
      typeof value.titleId === "string"
    )
      return { path: value.path, top: value.top, titleId: value.titleId };
  } catch {
    // 存储被禁用或旧记录损坏时，仍可依赖普通链接返回文章列表。
  }
  return null;
}

/** 只有实际返回时才恢复位置，避免稍后主动浏览同一列表时跳到旧位置。 */
export function requestArticleListRestore(path: string) {
  try {
    if (storedPosition()?.path === path) {
      sessionStorage.setItem(restoreKey, path);
      return true;
    }
  } catch {
    // sessionStorage 是阅读便利功能，不影响导航是否成功。
  }
  return false;
}

export function ArticleListPosition({ path }: { path: string }) {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const scope = marker.current?.closest(".site-posts");
    if (!scope) return undefined;
    let frame: number | undefined;

    try {
      const position = storedPosition();
      if (sessionStorage.getItem(restoreKey) === path && position?.path === path) {
        frame = requestAnimationFrame(() => {
          // 等路由提交和浏览器历史恢复完成后再回焦，避免被默认的正文焦点覆盖。
          frame = requestAnimationFrame(() => {
            // 完成恢复后才消费标记；开发严格模式的 effect 重放会取消前一帧。
            try {
              sessionStorage.removeItem(restoreKey);
            } catch {
              // 存储暂时不可用时仍完成本次位置与焦点恢复。
            }
            // 缓存列表可能含同名文章，焦点只在当前可见列表内查找。
            Array.from(scope.querySelectorAll<HTMLAnchorElement>("a[data-article-list-return]"))
              .find((link) => link.getAttribute("aria-labelledby") === position.titleId)
              ?.focus({ preventScroll: true });
            window.scrollTo({ top: position.top, behavior: "instant" });
          });
        });
      }
    } catch {
      // 浏览器禁止存储时保留 Next.js 的原生滚动行为。
    }

    const rememberPosition = (event: Event) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>("a[data-article-list-return]");
      if (!link || link.dataset.articleListReturn !== path) return;
      try {
        // 只在离开文章链接时读取一次位置，不注册连续 scroll 监听。
        sessionStorage.setItem(
          positionKey,
          JSON.stringify({
            path,
            top: window.scrollY,
            titleId: link.getAttribute("aria-labelledby") ?? "",
          }),
        );
      } catch {
        // 不因存储配额或隐私模式阻止文章打开。
      }
    };
    scope.addEventListener("click", rememberPosition, true);
    return () => {
      scope.removeEventListener("click", rememberPosition, true);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [path]);

  return <span ref={marker} hidden />;
}

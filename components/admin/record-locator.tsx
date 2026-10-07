"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export function useRecordTarget() {
  return useSearchParams().get("record") ?? undefined;
}

export function RecordLocator({
  record,
  loading,
  error,
  found,
}: {
  record?: string;
  loading: boolean;
  error: string;
  found: boolean;
}) {
  useEffect(() => {
    if (!record || loading || error || !found) return undefined;
    const frame = requestAnimationFrame(() => {
      const element = [...document.querySelectorAll<HTMLElement>("[data-record-id]")].find(
        (item) => item.dataset.recordId === record,
      );
      element?.scrollIntoView({ block: "nearest" });
      element?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [record, loading, error, found]);
  if (!record) return null;
  return (
    <output className="admin-record-notice">
      <span>
        {loading
          ? "正在定位记录…"
          : error
            ? "记录定位失败，请重试。"
            : found
              ? "已定位到目标记录"
              : "记录不存在，可能已被删除。"}
      </span>
      <Button
        size="compact"
        variant="ghost"
        onClick={() => {
          const url = new URL(location.href);
          url.searchParams.delete("record");
          url.searchParams.delete("kind");
          history.replaceState(null, "", url.pathname + url.search);
        }}
      >
        返回全部
      </Button>
    </output>
  );
}

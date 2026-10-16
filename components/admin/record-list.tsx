"use client";

import Link from "next/link";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import "./record-list.css";

export function RecordSort({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  disabled?: boolean;
}) {
  return (
    <Select value={value} disabled={disabled} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger size="compact" aria-label={label}>
        <SelectValue>{options.find(([key]) => key === value)?.[1]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map(([key, name]) => (
          <SelectItem key={key} value={key}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function RecordPageSize({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <RecordSort
      label="每次加载条数"
      value={String(value)}
      onChange={(next) => onChange(Number(next))}
      disabled={disabled}
      options={[...new Set([8, 10, 20, 50, value])]
        .toSorted((a, b) => a - b)
        .map((size) => [String(size), `每次 ${size} 条`])}
    />
  );
}

type MoreResource = {
  data: { items: { id: string }[]; total: number } | null;
  hasMore: boolean;
  hasPrevious: boolean;
  loadingMore: boolean;
  moreError: string;
  loadMore: () => Promise<string | undefined>;
  loadPrevious: () => Promise<string | undefined>;
  retryMore: () => Promise<string | undefined>;
};

function reveal(id: string | undefined, anchor: HTMLOutputElement | null) {
  requestAnimationFrame(() => {
    const items = [...document.querySelectorAll<HTMLElement>("[data-record-id]")];
    const item = items.find((element) => element.dataset.recordId === id);
    if (item) item.focus();
    // 尾页被删除后服务端可能回退，无新条目且触发按钮消失时仍有稳定焦点。
    else if (document.activeElement === document.body) (items.at(-1) ?? anchor)?.focus();
  });
}

export function RecordListMore({
  resource,
  label = "显示更多记录",
  disabled = false,
}: {
  resource: MoreResource;
  label?: string;
  disabled?: boolean;
}) {
  const anchor = useRef<HTMLOutputElement | null>(null);
  const focusResult = (id: string | undefined) => reveal(id, anchor.current);
  const locked = disabled || resource.loadingMore;
  return (
    <>
      <output ref={anchor} tabIndex={-1} className="sr-only" aria-live="polite">
        {resource.data
          ? `已显示 ${resource.data.items.length} 条，共 ${resource.data.total} 条。`
          : ""}
      </output>
      {(resource.hasMore || resource.hasPrevious || resource.moreError) && (
        <div className="admin-record-more">
          {resource.moreError && (
            <div role="alert">
              <p>{resource.moreError}</p>
              <Button
                size="compact"
                disabled={locked}
                onClick={() => void resource.retryMore().then(focusResult)}
              >
                重试加载
              </Button>
              {resource.moreError.includes("登录") && <Link href="/login">重新登录</Link>}
            </div>
          )}
          {resource.hasPrevious && (
            <Button
              size="compact"
              disabled={locked}
              onClick={() => void resource.loadPrevious().then(focusResult)}
            >
              显示前面的记录
            </Button>
          )}
          {resource.hasMore && (
            <Button
              size="compact"
              disabled={locked}
              onClick={() => void resource.loadMore().then(focusResult)}
            >
              {resource.loadingMore ? "正在加载…" : label}
            </Button>
          )}
        </div>
      )}
    </>
  );
}

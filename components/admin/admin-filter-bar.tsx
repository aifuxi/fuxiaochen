"use client";

import type { ReactNode } from "react";

import { Search, X } from "lucide-react";

type AdminFilterBarProps = {
  query: string;
  queryPlaceholder?: string;
  summary?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onQueryChange?: (value: string) => void;
  onReset?: () => void;
};

export function AdminFilterBar({
  query,
  queryPlaceholder = "Search records",
  summary,
  children,
  actions,
  onQueryChange,
  onReset,
}: AdminFilterBarProps) {
  return (
    <section className="flex flex-col gap-4 ui-panel p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-control border border-white/8 bg-surface-2 px-4 py-3 text-sm text-text-base">
            <Search className="size-4 shrink-0 text-text-muted" />
            <input
              aria-label="Search records"
              className="min-w-0 flex-1 bg-transparent text-text-strong outline-none placeholder:text-text-muted"
              placeholder={queryPlaceholder}
              type="search"
              value={query}
              onChange={(event) => {
                onQueryChange?.(event.target.value);
              }}
            />
          </label>
          {children ? (
            <div className="flex flex-wrap items-center gap-3">{children}</div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onReset ? (
            <button className="ui-admin-button" type="button" onClick={onReset}>
              <X className="size-3.5" />
              Reset
            </button>
          ) : null}
          {actions}
        </div>
      </div>

      {summary ? <p className="text-sm text-text-soft">{summary}</p> : null}
    </section>
  );
}

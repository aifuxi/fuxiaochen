"use client";

import type { ReactNode } from "react";

import { Search, X } from "lucide-react";

import type {
  AdminFilterConfig,
  AdminFilterKey,
  AdminFilterOption,
  AdminFilterValues,
} from "./admin-types";

type AdminFilterBarProps = {
  filters: readonly AdminFilterConfig[];
  values?: AdminFilterValues;
  filterOptions?: Partial<Record<AdminFilterKey, readonly AdminFilterOption[]>>;
  summary?: string;
  children?: ReactNode;
  actions?: ReactNode;
  onFilterChange?: (
    key: AdminFilterKey,
    value: string | boolean | undefined,
  ) => void;
  onReset?: () => void;
};

function getBooleanFilterValue(value: boolean | undefined) {
  if (value === true) {
    return "true";
  }

  if (value === false) {
    return "false";
  }

  return "";
}

export function AdminFilterBar({
  filters,
  values,
  filterOptions,
  summary,
  children,
  actions,
  onFilterChange,
  onReset,
}: AdminFilterBarProps) {
  const searchFilter = filters.find((filter) => filter.kind === "search");
  const nonSearchFilters = filters.filter((filter) => filter.kind !== "search");

  return (
    <section className="flex flex-col gap-4 ui-panel p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          {searchFilter ? (
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-control border border-white/8 bg-surface-2 px-4 py-3 text-sm text-text-base">
              <Search className="size-4 shrink-0 text-text-muted" />
              <input
                aria-label={searchFilter.label}
                className="min-w-0 flex-1 bg-transparent text-text-strong outline-none placeholder:text-text-muted"
                name={searchFilter.key}
                placeholder={searchFilter.placeholder ?? "Search records"}
                type="search"
                value={values?.query ?? ""}
                onChange={(event) => {
                  onFilterChange?.(
                    searchFilter.key,
                    event.target.value || undefined,
                  );
                }}
              />
            </label>
          ) : null}

          {nonSearchFilters.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              {nonSearchFilters.map((filter) => {
                if (filter.kind === "boolean") {
                  return (
                    <label
                      key={filter.key}
                      className="flex items-center gap-2 text-sm text-text-soft"
                    >
                      <span>{filter.label}</span>
                      <select
                        className="ui-admin-input min-w-32 px-3 py-2"
                        name={filter.key}
                        value={getBooleanFilterValue(values?.[filter.key])}
                        onChange={(event) => {
                          const nextValue = event.target.value;

                          onFilterChange?.(
                            filter.key,
                            nextValue === "" ? undefined : nextValue === "true",
                          );
                        }}
                      >
                        <option value="">All</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </label>
                  );
                }

                const options =
                  filterOptions?.[filter.key] ?? filter.options ?? [];

                return (
                  <label
                    key={filter.key}
                    className="flex items-center gap-2 text-sm text-text-soft"
                  >
                    <span>{filter.label}</span>
                    <select
                      className="ui-admin-input min-w-40 px-3 py-2"
                      name={filter.key}
                      value={(values?.[filter.key] as string | undefined) ?? ""}
                      onChange={(event) => {
                        onFilterChange?.(
                          filter.key,
                          event.target.value || undefined,
                        );
                      }}
                    >
                      <option value="">
                        {filter.placeholder ?? `All ${filter.label}`}
                      </option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>
          ) : null}

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

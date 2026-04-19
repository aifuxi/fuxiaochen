"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { AdminTableColumn, AdminTableRow } from "./admin-types";

type AdminDataTableProps<TItem extends AdminTableRow> = {
  columns: readonly AdminTableColumn[];
  items: readonly TItem[];
  emptyState?: ReactNode;
  selectedRowId?: string | null;
  caption?: string;
  onRowClick?: (item: TItem) => void;
};

export function AdminDataTable<TItem extends AdminTableRow>({
  columns,
  items,
  emptyState,
  selectedRowId,
  caption,
  onRowClick,
}: AdminDataTableProps<TItem>) {
  return (
    <div className="overflow-hidden ui-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="border-b border-white/8 bg-surface-2/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 font-mono text-[0.68rem] tracking-[0.18em] text-text-muted uppercase",
                    column.headerClassName,
                  )}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => {
                const interactive = typeof onRowClick === "function";

                return (
                  <tr
                    key={item.id}
                    aria-selected={selectedRowId === item.id}
                    className={cn(
                      "border-b border-white/6 transition-colors duration-300 last:border-b-0",
                      interactive && "cursor-pointer hover:bg-surface-2/65",
                      selectedRowId === item.id && "bg-brand/8",
                    )}
                    onClick={() => {
                      onRowClick?.(item);
                    }}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 py-4 text-sm leading-6 text-text-base",
                          column.className,
                        )}
                      >
                        {item[column.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-4 py-16 text-center text-sm text-text-soft"
                  colSpan={Math.max(columns.length, 1)}
                >
                  {emptyState ?? "No records match the current query."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

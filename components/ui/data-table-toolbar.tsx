"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  /**
   * 搜索的列名，默认为空（不启用搜索）
   */
  searchKey?: string;
  /**
   * 搜索框占位符文本
   */
  searchPlaceholder?: string;
  /**
   * 额外的工具栏内容（如筛选器）
   */
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "搜索...",
  children,
}: DataTableToolbarProps<TData>) {
  const searchValue = searchKey
    ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
    : "";
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className={`
      flex flex-col gap-4 py-4
      sm:flex-row sm:items-center
    `}>
      <div className="flex flex-1 items-center gap-2">
        {searchKey && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className={`
              h-8 w-full border-border bg-surface
              sm:w-[250px]
            `}
          />
        )}
        {children}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className={`
              h-8 px-2 text-text-secondary
              hover:text-text
            `}
          >
            重置
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

"use client";

import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  return (
    <div className={`
      flex flex-col items-center justify-between gap-4 px-2 py-4
      sm:flex-row
    `}>
      <div className="flex-1 text-sm text-text-secondary">
        {selectedRows > 0 && (
          <>
            已选择 {selectedRows} / {totalRows} 行
          </>
        )}
        {selectedRows === 0 && <>共 {totalRows} 行</>}
      </div>
      <div className={`
        flex flex-col items-center gap-4
        sm:flex-row sm:gap-6
        lg:gap-8
      `}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text-secondary">每页行数</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] border-border bg-surface">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium text-text-secondary">
          第 {pageIndex + 1} / {pageCount} 页
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`
              hidden size-8
              lg:flex
            `}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">首页</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">上一页</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">下一页</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`
              hidden size-8
              lg:flex
            `}
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">末页</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

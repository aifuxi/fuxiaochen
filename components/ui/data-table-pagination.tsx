import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { PAGE_SIZE_OPTIONS } from "@/constants";

import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  onPaginationChange: (pageIndex: number, pageSize: number) => void;
  total?: number;
}

export function DataTablePagination<TData>({
  table,
  onPaginationChange,
  total,
}: DataTablePaginationProps<TData>) {
  const currentPageIndex = table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;
  const currentPageTotal = currentPageSize * currentPageIndex;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex-1 text-sm text-muted-foreground">
        显示第 {currentPageIndex} 页，共 {currentPageTotal} 条，共{" "}
        {total ?? "-"} 条
      </div>
      <div
        className={`
          flex items-center space-x-6
          lg:space-x-8
        `}
      >
        <div className="flex items-center space-x-2">
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const newPageSize = Number(value);
              onPaginationChange(1, newPageSize);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          第 {currentPageIndex} 页，共 {table.getPageCount()} 页
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className={`
              hidden size-8
              lg:flex
            `}
            onClick={() => {
              onPaginationChange(1, table.getState().pagination.pageSize);
            }}
            disabled={table.getState().pagination.pageIndex <= 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              onPaginationChange(
                table.getState().pagination.pageIndex - 1,
                table.getState().pagination.pageSize,
              );
            }}
            disabled={table.getState().pagination.pageIndex <= 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              onPaginationChange(
                table.getState().pagination.pageIndex + 1,
                table.getState().pagination.pageSize,
              );
            }}
            disabled={
              table.getState().pagination.pageIndex === table.getPageCount()
            }
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`
              hidden size-8
              lg:flex
            `}
            onClick={() => {
              onPaginationChange(
                table.getPageCount(),
                table.getState().pagination.pageSize,
              );
            }}
            disabled={
              table.getState().pagination.pageIndex === table.getPageCount()
            }
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

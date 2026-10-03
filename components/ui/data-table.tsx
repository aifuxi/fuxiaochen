"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
  type SortingState,
  type Table as TableInstance,
  type TableMeta,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import "./data-table.css";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string;
    rowHeader?: boolean;
    width?: string;
  }
}

export function useDataTableState(pageSize = 8) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const onSortingChange = useCallback<OnChangeFn<SortingState>>((updater) => {
    setSorting((current) => (typeof updater === "function" ? updater(current) : updater));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);
  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>((updater) => {
    setPagination((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return next.pageSize === current.pageSize ? next : { ...next, pageIndex: 0 };
    });
  }, []);
  const setPage = useCallback((page: number) => {
    setPagination((current) => ({ ...current, pageIndex: page - 1 }));
  }, []);
  return {
    sorting,
    pagination,
    onSortingChange,
    onPaginationChange,
    page: pagination.pageIndex + 1,
    setPage,
  };
}

export function getDataTableSort<T extends string>(sorting: SortingState, keys: readonly T[]) {
  const sortBy = keys.find((key) => key === sorting[0]?.id);
  return {
    sortBy,
    sortDirection: sortBy ? (sorting[0].desc ? ("desc" as const) : ("asc" as const)) : undefined,
  };
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  sorting,
  pagination,
  onSortingChange,
  onPaginationChange,
  mode = "client",
  rowCount,
  paginate = true,
  loading = false,
  disabled = false,
  caption,
  tableClassName,
  scrollClassName,
  emptyState,
  meta,
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId: (row: TData) => string;
  sorting: SortingState;
  pagination: PaginationState;
  onSortingChange: OnChangeFn<SortingState>;
  onPaginationChange: OnChangeFn<PaginationState>;
  mode?: "client" | "server";
  rowCount?: number;
  paginate?: boolean;
  loading?: boolean;
  disabled?: boolean;
  caption: string;
  tableClassName?: string;
  scrollClassName?: string;
  emptyState?: ReactNode;
  meta?: TableMeta<TData>;
}) {
  "use no memo";

  const total = mode === "server" ? (rowCount ?? 0) : data.length;
  const lastPageIndex = Math.max(0, Math.ceil(total / pagination.pageSize) - 1);
  const pageIndex = Math.min(pagination.pageIndex, lastPageIndex);
  // 删除或筛选减少结果后同步有效页码；加载期间不能用暂时的空结果回退。
  useEffect(() => {
    if (paginate && !loading && !disabled && pagination.pageIndex > lastPageIndex) {
      onPaginationChange((current) => ({ ...current, pageIndex: lastPageIndex }));
    }
  }, [paginate, loading, disabled, pagination.pageIndex, lastPageIndex, onPaginationChange]);
  // oxlint-disable-next-line react/incompatible-library -- v8实例可变；use no memo已明确阻止编译器记忆化本组件。
  const table = useReactTable({
    data,
    columns,
    meta,
    getRowId,
    state: { sorting, pagination: { ...pagination, pageIndex } },
    onSortingChange,
    onPaginationChange,
    enableMultiSort: false,
    defaultColumn: { enableSorting: false },
    sortDescFirst: false,
    autoResetPageIndex: false,
    manualSorting: mode === "server",
    manualPagination: mode === "server" || !paginate,
    rowCount: total,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: mode === "client" ? getSortedRowModel() : undefined,
    getPaginationRowModel: mode === "client" && paginate ? getPaginationRowModel() : undefined,
  });
  return (
    <div className="ds-data-table" aria-busy={loading}>
      <section
        className={cn("ds-table-scroll", scrollClassName)}
        aria-label={`${caption}，可横向滚动`}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 允许键盘滚动宽表格。
        tabIndex={0}
      >
        <Table className={tableClassName}>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <colgroup>
            {table.getVisibleLeafColumns().map((column) => (
              <col key={column.id} style={{ width: column.columnDef.meta?.width }} />
            ))}
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={
                      header.column.getCanSort()
                        ? header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <DataTableColumnHeader column={header.column} disabled={loading || disabled}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </DataTableColumnHeader>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const Cell = cell.column.columnDef.meta?.rowHeader ? TableHead : TableCell;
                  return (
                    <Cell
                      key={cell.id}
                      scope={cell.column.columnDef.meta?.rowHeader ? "row" : undefined}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Cell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      {!loading &&
        !disabled &&
        !total &&
        (emptyState ?? <p className="ds-table-empty">暂无数据</p>)}
      {paginate && (
        <DataTablePagination table={table} label={caption} disabled={loading || disabled} />
      )}
    </div>
  );
}

export function DataTableColumnHeader<TData>({
  column,
  disabled,
  children,
}: {
  column: Column<TData>;
  disabled?: boolean;
  children: ReactNode;
}) {
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <button
      type="button"
      className="ds-table-sort"
      disabled={disabled}
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      <Icon size={14} aria-hidden="true" />
      <span className="sr-only">
        {sorted === "asc"
          ? "（升序；点击降序）"
          : sorted === "desc"
            ? "（降序；点击恢复默认顺序）"
            : "（点击升序）"}
      </span>
    </button>
  );
}

export function DataTablePagination<TData>({
  table,
  label,
  disabled,
}: {
  table: TableInstance<TData>;
  label: string;
  disabled?: boolean;
}) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getRowCount();
  return (
    <div className="ds-table-pagination">
      <span aria-live="polite">
        显示第 {total ? pageIndex * pageSize + 1 : 0}–{Math.min((pageIndex + 1) * pageSize, total)}{" "}
        条，共 {total} 条
      </span>
      <div className="ds-table-page-controls">
        <span>每页</span>
        <Select
          value={String(pageSize)}
          disabled={disabled}
          onValueChange={(value) => value && table.setPageSize(Number(value))}
        >
          <SelectTrigger size="compact" aria-label={`${label}每页条数`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[8, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <nav aria-label={`${label}分页`}>
          <Button
            size="compact"
            variant="ghost"
            aria-label="上一页"
            disabled={disabled || !table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </Button>
          <span aria-current="page">
            {pageIndex + 1} / {Math.max(1, table.getPageCount())}
          </span>
          <Button
            size="compact"
            variant="ghost"
            aria-label="下一页"
            disabled={disabled || !table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight size={17} aria-hidden="true" />
          </Button>
        </nav>
      </div>
    </div>
  );
}

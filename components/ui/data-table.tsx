"use client";

import * as React from "react";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";

interface PaginationConfig {
  pageIndex: number;
  pageSize: number;
  onPaginationChange: (page: number, pageSize: number) => void;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  total?: number;
  pagination: PaginationConfig;
  noResult?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  pagination,
  noResult,
  total = 0,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const pageCount = Math.ceil(total / pagination.pageSize);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    // 禁用TanStack Table的自动分页，使用手动分页
    manualPagination: true,
    pageCount,
    state: {
      rowSelection,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
  });

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="p-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>{renderContent()}</TableBody>
      </Table>
      <DataTablePagination
        table={table}
        onPaginationChange={pagination.onPaginationChange}
      />
    </div>
  );

  function renderContent() {
    if (!table.getRowModel().rows.length && !loading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            {noResult}
          </TableCell>
        </TableRow>
      );
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="p-4">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  }
}

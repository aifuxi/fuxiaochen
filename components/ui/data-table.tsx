'use client';

import React from 'react';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { type SetState } from 'ahooks/lib/useSetState';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Skeleton } from './skeleton';

import { Pagination, PaginationInfo } from '../pagination';

type PaginationConfig = {
  pageIndex: number;
  pageSize: number;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  total?: number;
  params: PaginationConfig;
  noResult?: React.ReactNode;
  updateParams: SetState<PaginationConfig>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  params,
  updateParams,
  noResult,
  total = 0,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const pageCount = Math.ceil(total / params.pageSize);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    pageCount,
    state: {
      rowSelection,
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
                  <TableHead key={header.id}>
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
      <div className="flex px-4 items-center">
        <div className="flex-1 text-sm text-muted-foreground">
          {renderInfo()}
        </div>

        <Pagination
          total={total}
          params={{ ...params }}
          updateParams={updateParams}
          showQuickJumper
          showSizeChanger
        />
      </div>
    </div>
  );

  function renderContent() {
    if (loading) {
      return Array.from({ length: params.pageSize }).map((_, idx) => {
        return (
          <TableRow key={idx}>
            {Array.from({ length: columns.length }).map((__, index) => {
              return (
                <TableCell key={index}>
                  <Skeleton className="w-full h-4 rounded-[4px]" />
                </TableCell>
              );
            })}
          </TableRow>
        );
      });
    }

    if (!table.getRowModel().rows?.length && !loading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            {noResult}
          </TableCell>
        </TableRow>
      );
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="py-2 max-w-[300px] break-all">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  }

  function renderInfo() {
    // 如果存在行选择信息，优先展示行选择信息
    if (table.getFilteredSelectedRowModel().rows.length) {
      return (
        <p>
          已选中
          <span className="font-semibold mx-1">
            {table.getFilteredSelectedRowModel().rows.length}
          </span>
          行数据
        </p>
      );
    }

    return (
      // 当前数据和总条数
      pageCount > 1 && <PaginationInfo total={total} params={{ ...params }} />
    );
  }
}

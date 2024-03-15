'use client';

import React from 'react';
import { PulseLoader } from 'react-spinners';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { type Updater } from 'use-immer';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Pagination } from '../pagination';

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
  updateParams: Updater<PaginationConfig>;
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
    getPaginationRowModel: getPaginationRowModel(),
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
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24">
            <div className="grid place-content-center gap-4 py-16">
              <div>
                <PulseLoader color="hsl(var(--primary))" loading />
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
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
          <TableCell key={cell.id}>
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
      <p>
        显示第
        <span className="font-semibold mx-1">
          {params.pageIndex === 1
            ? 1
            : (params.pageIndex - 1) * params.pageSize}
        </span>
        条-第
        <span className="font-semibold mx-1">
          {Math.min(total, params.pageIndex * params.pageSize)}
        </span>
        条，共
        <span className="font-semibold mx-1">{total}</span>条
      </p>
    );
  }
}

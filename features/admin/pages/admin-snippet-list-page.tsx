'use client';

import React from 'react';

import Link from 'next/link';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  CalendarIcon,
  HeadingIcon,
  PencilIcon,
  PlusIcon,
  TagsIcon,
  WrenchIcon,
} from 'lucide-react';

import { PATHS } from '@/config';

import { badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { type Snippet, useGetSnippets } from '@/features/snippet';
import { cn, toSlashDateString } from '@/lib/utils';

import { DeleteSnippetButton } from '../components/delete-snippet-button';

const columnHelper = createColumnHelper<Snippet>();

const columns = [
  columnHelper.accessor('title', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <HeadingIcon size={14} />
        <span>Snippet标题</span>
      </div>
    ),
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('tags', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <TagsIcon size={14} />
        <span>标签</span>
      </div>
    ),
    cell: (info) => (
      <div className="flex flex-wrap gap-2">
        {info.getValue()?.length
          ? info.getValue().map((tag) => (
              <div
                key={tag.id}
                className={cn(badgeVariants({ variant: 'default' }))}
              >
                {tag.name}
              </div>
            ))
          : '-'}
      </div>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <CalendarIcon size={14} />
        <span>创建时间</span>
      </div>
    ),
    cell: (info) => toSlashDateString(info.getValue()),
  }),
  columnHelper.accessor('updatedAt', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <CalendarIcon size={14} />
        <span>更新时间</span>
      </div>
    ),
    cell: (info) => toSlashDateString(info.getValue()),
  }),
  columnHelper.accessor('id', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <WrenchIcon size={14} />
        <span>操作</span>
      </div>
    ),
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`${PATHS.ADMIN_SNIPPET_EDIT}/${info.getValue()}`}>
              <Button size={'icon'} variant="ghost">
                <PencilIcon size={16} />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>编辑</TooltipContent>
        </Tooltip>
        <DeleteSnippetButton id={info.getValue()} />
      </div>
    ),
  }),
];

export const AdminSnippetListPage = () => {
  const getSnippetsQuery = useGetSnippets();
  const data = React.useMemo(
    () => getSnippetsQuery.data?.snippets ?? [],
    [getSnippetsQuery],
  );
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold tracking-tight transition-colors">
        Snippet管理
      </h2>

      <div className="flex justify-end">
        <Link href={PATHS.ADMIN_SNIPPET_CREATE}>
          <Button>
            <PlusIcon className="mr-2 " size={16} />
            创建Snippet
          </Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

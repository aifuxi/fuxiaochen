'use client';

import React from 'react';

import Link from 'next/link';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { NICKNAME, PATHS, PLACEHODER_TEXT } from '@/config';

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

import {
  IconSolarAddSquare,
  IconSolarCalendarMark,
  IconSolarPen,
  IconSolarTag,
  IconSolarTextField,
  IconSolarTuningSquare2,
} from '@/components/icons';
import { PageHeader } from '@/components/page-header';

import { type Blog, useGetBlogs } from '@/features/blog';
import { cn, toSlashDateString } from '@/lib/utils';

import { DeleteBlogButton } from '../../components';

// import { ToggleBlogPublishSwitch } from '../components/toggle-blog-publish-switch';

const columnHelper = createColumnHelper<Blog>();

const columns = [
  columnHelper.accessor('title', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarTextField className="text-sm" />
        <span>Blog标题</span>
      </div>
    ),
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('author', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarTextField className="text-sm" />
        <span>作者</span>
      </div>
    ),
    cell: (info) => info.getValue() ?? NICKNAME,
  }),
  columnHelper.accessor('tags', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarTag className="text-sm" />
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
          : PLACEHODER_TEXT}
      </div>
    ),
  }),

  columnHelper.accessor('createdAt', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarCalendarMark className="text-sm" />
        <span>创建时间</span>
      </div>
    ),
    cell: (info) => toSlashDateString(info.getValue()),
  }),
  columnHelper.accessor('updatedAt', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarCalendarMark className="text-sm" />
        <span>更新时间</span>
      </div>
    ),
    cell: (info) => toSlashDateString(info.getValue()),
  }),
  columnHelper.accessor('id', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarTuningSquare2 className="text-sm" />
        <span>操作</span>
      </div>
    ),
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`${PATHS.ADMIN_BLOG_EDIT}/${info.getValue()}`}>
              <Button size={'icon'} variant="ghost">
                <IconSolarPen className="text-sm" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>编辑</TooltipContent>
        </Tooltip>
        <DeleteBlogButton id={info.getValue()} />
      </div>
    ),
  }),
];

export const AdminBlogListPage = () => {
  const getBlogsQuery = useGetBlogs();
  const data = React.useMemo(
    () => getBlogsQuery.data?.blogs ?? [],
    [getBlogsQuery],
  );
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader breadcrumbList={[PATHS.ADMIN_HOME, PATHS.ADMIN_BLOG]} />

      <div className="flex justify-end">
        <Link href={PATHS.ADMIN_BLOG_CREATE}>
          <Button>
            <IconSolarAddSquare className="mr-2 text-base" />
            创建Blog
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

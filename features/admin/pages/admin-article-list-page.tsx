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
  CopyIcon,
  HashIcon,
  HeadingIcon,
  KeyRoundIcon,
  PencilIcon,
  PlusIcon,
  TagsIcon,
} from 'lucide-react';

import { PATHS } from '@/config';

import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { cn } from '@/utils/helper';

import { type Article, useGetArticles } from '@/features/article';
import { copyToClipboard, formatDateDetail } from '@/lib/util';

import { DeleteArticleButton } from '../components/delete-article-button';

// import { ToggleArticlePublishSwitch } from '../components/toggle-article-publish-switch';

const columnHelper = createColumnHelper<Article>();

const columns = [
  columnHelper.accessor('id', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <KeyRoundIcon size={14} />
        <span>id</span>
      </div>
    ),
    cell: (info) => (
      <Badge>
        {info.getValue()}
        <CopyIcon
          size={14}
          className="cursor-pointer ml-1"
          onClick={() => {
            copyToClipboard(info.getValue());
          }}
        />
      </Badge>
    ),
  }),
  columnHelper.accessor('title', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <HeadingIcon size={14} />
        <span>title</span>
      </div>
    ),
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('slug', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <HashIcon size={14} />
        <span>slug</span>
      </div>
    ),
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('tags', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <TagsIcon size={14} />
        <span>tags</span>
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
        <span>created_at</span>
      </div>
    ),
    cell: (info) => formatDateDetail(info.getValue()),
  }),
  columnHelper.accessor('updatedAt', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <CalendarIcon size={14} />
        <span>updated_at</span>
      </div>
    ),
    cell: (info) => formatDateDetail(info.getValue()),
  }),
  columnHelper.accessor('id', {
    header: 'actions',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Link href={`${PATHS.ADMIN_ARTICLE_EDIT}/${info.getValue()}`}>
          <Button size={'icon'} variant="ghost">
            <PencilIcon size={16} />
          </Button>
        </Link>
        <DeleteArticleButton id={info.getValue()} />
      </div>
    ),
  }),
];

export const AdminArticleListPage = () => {
  const getArticlesQuery = useGetArticles();
  const data = React.useMemo(
    () => getArticlesQuery.data?.articles ?? [],
    [getArticlesQuery],
  );
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold tracking-tight transition-colors">
        文章管理
      </h2>

      <div className="flex justify-end">
        <Link href={PATHS.ADMIN_ARTICLE_CREATE}>
          <Button>
            <PlusIcon className="mr-2 " size={16} />
            创建文章
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

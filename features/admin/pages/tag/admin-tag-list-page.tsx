'use client';

import React from 'react';

import Link from 'next/link';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { PATHS, PATHS_MAP } from '@/config';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  IconSolarBook,
  IconSolarCalendarMark,
  IconSolarHashtagSquare,
  IconSolarTextField,
  IconSolarTuningSquare2,
} from '@/components/icons';

import { type Tag, useGetTags } from '@/features/tag';
import { toSlashDateString } from '@/lib/utils';

import {
  CreateTagButton,
  DeleteTagButton,
  EditTagButton,
} from '../../components';

const columnHelper = createColumnHelper<Tag>();

const columns = [
  columnHelper.accessor('name', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarTextField className="text-sm" />
        <span>名称</span>
      </div>
    ),
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('slug', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarHashtagSquare className="text-sm" />
        <span>slug</span>
      </div>
    ),
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('_count.blogs', {
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarBook className="text-sm" />
        <span>Blog数量</span>
      </div>
    ),
    cell: (info) => info.getValue(),
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
      <div className="flex gap-2 items-center">
        <EditTagButton id={info.getValue()} />
        <DeleteTagButton id={info.getValue()} />
      </div>
    ),
  }),
];

export const AdminTagListPage = () => {
  const getTagsQuery = useGetTags();
  const data = React.useMemo(
    () => getTagsQuery.data?.tags ?? [],
    [getTagsQuery],
  );
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href={PATHS.ADMIN_HOME}>{PATHS_MAP[PATHS.ADMIN_HOME]}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{PATHS_MAP[PATHS.ADMIN_TAG]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className="text-4xl md:text-5xl font-bold mb-2">
        {PATHS_MAP[PATHS.ADMIN_TAG]}
      </h2>
      <p className="text-lg text-muted-foreground">
        {PATHS_MAP[PATHS.ADMIN_TAG]}管理，在这里对{PATHS_MAP[PATHS.ADMIN_TAG]}
        进行 增、删、改、查操作
      </p>
      <div className="flex justify-end">
        <CreateTagButton />
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
                <TableCell key={cell.id} className="p-2 ">
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

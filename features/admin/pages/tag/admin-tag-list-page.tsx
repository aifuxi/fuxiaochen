'use client';

import React from 'react';

import Link from 'next/link';

import { type ColumnDef } from '@tanstack/react-table';

import { PATHS, PATHS_MAP } from '@/config';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';

import {
  IconSolarBook,
  IconSolarCalendarMark,
  IconSolarHashtagSquare,
  IconSolarTextField,
} from '@/components/icons';

import { type Tag, useGetTags } from '@/features/tag';
import { toSlashDateString } from '@/lib/utils';

import {
  CreateTagButton,
  DeleteTagButton,
  EditTagButton,
} from '../../components';

const columns: ColumnDef<Tag>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarTextField className="text-sm" />
        <span>名称</span>
      </div>
    ),
  },
  {
    accessorKey: 'slug',
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarHashtagSquare className="text-sm" />
        <span>slug</span>
      </div>
    ),
  },
  {
    accessorKey: '_count.blogs',
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarBook className="text-sm" />
        <span>Blog数量</span>
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarCalendarMark className="text-sm" />
        <span>创建时间</span>
      </div>
    ),
    cell({ row }) {
      return toSlashDateString(row.getValue('createdAt'));
    },
  },
  {
    accessorKey: 'updatedAt',
    header: () => (
      <div className="flex space-x-1 items-center">
        <IconSolarCalendarMark className="text-sm" />
        <span>更新时间</span>
      </div>
    ),
    cell({ row }) {
      return toSlashDateString(row.getValue('updatedAt'));
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const tag = row.original;
      return (
        <div className="flex gap-2 items-center">
          <EditTagButton id={tag.id} />
          <DeleteTagButton id={tag.id} />
        </div>
      );
    },
  },
];

export const AdminTagListPage = () => {
  const getTagsQuery = useGetTags();
  const data = React.useMemo(
    () => getTagsQuery.data?.tags ?? [],
    [getTagsQuery],
  );

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
      <DataTable columns={columns} data={data} />
    </div>
  );
};

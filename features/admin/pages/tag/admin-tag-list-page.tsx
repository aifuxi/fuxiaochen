'use client';

import React from 'react';

import { type ColumnDef } from '@tanstack/react-table';

import { PATHS } from '@/config';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';

import {
  IconSolarBook,
  IconSolarCalendarMark,
  IconSolarHashtagSquare,
  IconSolarTextField,
} from '@/components/icons';
import { PageHeader } from '@/components/page-header';

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
      <PageHeader breadcrumbList={[PATHS.ADMIN_HOME, PATHS.ADMIN_TAG]} />

      <div className="flex justify-end">
        <CreateTagButton />
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={getTagsQuery.isLoading}
      />
    </div>
  );
};

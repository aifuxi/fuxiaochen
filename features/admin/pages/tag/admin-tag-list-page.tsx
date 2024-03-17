'use client';

import React from 'react';

import { type TagTypeEnum } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { useImmer } from 'use-immer';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  IconSolarBook,
  IconSolarCalendarMark,
  IconSolarHashtagSquare,
  IconSolarMinimalisticMagnifer,
  IconSolarRestart,
  IconSolarSortFromBottomToTopLinear,
  IconSolarSortFromTopToBottomLinear,
  IconSolarTextField,
} from '@/components/icons';
import { IllustrationNoContent } from '@/components/illustrations';
import { PageHeader } from '@/components/page-header';

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  PATHS,
  PLACEHODER_TEXT,
  TAG_TYPES,
  TAG_TYPE_MAP,
} from '@/constants';
import { type GetTagsDTO, type Tag, useGetTags } from '@/features/tag';
import { toSlashDateString } from '@/lib/utils';

import {
  AdminContentLayout,
  CreateTagButton,
  DeleteTagButton,
  EditTagButton,
} from '../../components';

export const AdminTagListPage = () => {
  const [params, updateParams] = useImmer<GetTagsDTO>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [inputParams, updateInputParams] = useImmer<
    Omit<GetTagsDTO, 'pageIndex' | 'pageSize'>
  >({
    slug: undefined,
    name: undefined,
    type: undefined,
  });

  const getTagsQuery = useGetTags(params);
  const data = React.useMemo(
    () => getTagsQuery.data?.tags ?? [],
    [getTagsQuery],
  );

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
      accessorKey: 'type',
      header: () => (
        <div className="flex space-x-1 items-center">
          <IconSolarTextField className="text-sm" />
          <span>类型</span>
        </div>
      ),
      cell({ row }) {
        return TAG_TYPE_MAP[row.original.type] ?? PLACEHODER_TEXT;
      },
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
        <Button
          variant="ghost"
          onClick={() => {
            handleOrderChange('createdAt');
          }}
        >
          <IconSolarCalendarMark className="text-sm" />
          <span className="mx-1">创建时间</span>
          {params.order === 'asc' && params.orderBy == 'createdAt' && (
            <IconSolarSortFromBottomToTopLinear />
          )}
          {params.order === 'desc' && params.orderBy == 'createdAt' && (
            <IconSolarSortFromTopToBottomLinear />
          )}
        </Button>
      ),
      cell({ row }) {
        return toSlashDateString(row.original.createdAt);
      },
    },
    {
      accessorKey: 'updatedAt',
      header: () => (
        <Button
          variant="ghost"
          onClick={() => {
            handleOrderChange('updatedAt');
          }}
        >
          <IconSolarCalendarMark className="text-sm" />
          <span className="mx-1">更新时间</span>
          {params.order === 'asc' && params.orderBy == 'updatedAt' && (
            <IconSolarSortFromBottomToTopLinear />
          )}
          {params.order === 'desc' && params.orderBy == 'updatedAt' && (
            <IconSolarSortFromTopToBottomLinear />
          )}
        </Button>
      ),
      cell({ row }) {
        return toSlashDateString(row.original.updatedAt);
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div className="flex gap-2 items-center">
            <EditTagButton id={record.id} />
            <DeleteTagButton id={record.id} />
          </div>
        );
      },
    },
  ];

  return (
    <AdminContentLayout
      pageHeader={
        <PageHeader
          breadcrumbList={[PATHS.ADMIN_HOME, PATHS.ADMIN_TAG]}
          action={<CreateTagButton />}
        />
      }
    >
      <div className="grid gap-4 grid-cols-4">
        <Input
          placeholder="请输入名称"
          value={inputParams.name}
          onChange={(v) =>
            updateInputParams((draft) => {
              draft.name = v.target.value;
            })
          }
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Input
          placeholder="请输入slug"
          value={inputParams.slug}
          onChange={(v) =>
            updateInputParams((draft) => {
              draft.slug = v.target.value;
            })
          }
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Select
          onValueChange={(v: TagTypeEnum) =>
            updateInputParams((draft) => {
              draft.type = v;
            })
          }
          value={inputParams.type}
        >
          <SelectTrigger className="text-muted-foreground">
            <SelectValue placeholder="请选择类型" />
          </SelectTrigger>
          <SelectContent>
            {TAG_TYPES.map((el) => (
              <SelectItem key={el} value={el}>
                {TAG_TYPE_MAP[el]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-4">
          <Button onClick={handleSearch}>
            <IconSolarMinimalisticMagnifer className="mr-2" />
            搜索
          </Button>
          <Button onClick={handleReset}>
            <IconSolarRestart className="mr-2" />
            重置
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        total={getTagsQuery.data?.total}
        loading={getTagsQuery.isLoading}
        params={{ ...params }}
        updateParams={updateParams}
        noResult={
          <div className="grid place-content-center gap-4 py-16">
            <IllustrationNoContent />
            <p>暂无内容</p>
            <CreateTagButton />
          </div>
        }
      />
    </AdminContentLayout>
  );

  function handleSearch() {
    updateParams((draft) => {
      draft.name = inputParams.name;
      draft.slug = inputParams.slug;
      draft.type = inputParams.type;
    });
  }

  function handleReset() {
    updateInputParams((draft) => {
      draft.name = '';
      draft.slug = '';
      draft.type = undefined;
    });
    updateParams((draft) => {
      draft.name = '';
      draft.slug = '';
      draft.type = undefined;
      draft.pageIndex = DEFAULT_PAGE_INDEX;
      draft.order = undefined;
      draft.orderBy = undefined;
    });
  }

  function handleOrderChange(orderBy: GetTagsDTO['orderBy']) {
    updateParams((draft) => {
      if (draft.orderBy !== orderBy) {
        draft.orderBy = orderBy;
        draft.order = 'asc';
      } else {
        if (draft.order === 'desc') {
          draft.orderBy = undefined;
          draft.order = undefined;
        } else if (draft.order === 'asc') {
          draft.order = 'desc';
        } else {
          draft.order = 'asc';
        }
      }
    });
  }
};

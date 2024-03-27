'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

import { TagTypeEnum } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { useSetState } from 'ahooks';
import { isUndefined } from 'lodash-es';

import { type WithSession } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Highlight } from '@/components/highlight';
import {
  IconSolarAddSquare,
  IconSolarCalendarMark,
  IconSolarEyeBold,
  IconSolarMinimalisticMagnifer,
  IconSolarPen,
  IconSolarRestart,
  IconSolarSortFromBottomToTopLinear,
  IconSolarSortFromTopToBottomLinear,
  IconSolarTag,
  IconSolarTextField,
} from '@/components/icons';
import { IllustrationNoContent } from '@/components/illustrations';
import { PageHeader } from '@/components/page-header';

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  PATHS,
  PLACEHODER_TEXT,
  PUBLISHED_ENUM,
  PUBLISHED_LABEL_MAP,
} from '@/constants';
import {
  type GetSnippetsDTO,
  type Snippet,
  useGetSnippets,
} from '@/features/snippet';
import { useGetAllTags } from '@/features/tag';
import { cn, isAdmin, toSlashDateString } from '@/lib/utils';

import {
  AdminContentLayout,
  DeleteSnippetButton,
  ToggleSnippetPublishSwitch,
} from '../../components';

export const AdminSnippetListPage = ({ session }: WithSession) => {
  const router = useRouter();
  const [params, updateParams] = useSetState<GetSnippetsDTO>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
    order: 'desc',
    orderBy: 'createdAt',
  });

  const [inputParams, updateInputParams] = useSetState<
    Omit<GetSnippetsDTO, 'pageIndex' | 'pageSize'>
  >({
    title: undefined,
    published: undefined,
    tags: undefined,
  });

  const getSnippetsQuery = useGetSnippets(params);
  const data = React.useMemo(
    () => getSnippetsQuery.data?.snippets ?? [],
    [getSnippetsQuery],
  );

  const getTagsQuery = useGetAllTags(TagTypeEnum.SNIPPET);
  const tags = React.useMemo(() => {
    return getTagsQuery.data?.tags ?? [];
  }, [getTagsQuery]);

  const columns: ColumnDef<Snippet>[] = [
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
      accessorKey: 'title',
      header: () => (
        <div className="flex space-x-1 items-center">
          <IconSolarTextField className="text-sm" />
          <span>标题</span>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <Highlight
            sourceString={row.original.title}
            searchWords={params.title ? [params.title] : undefined}
          />
        );
      },
    },
    {
      accessorKey: 'tags',
      header: () => (
        <div className="flex space-x-1 items-center">
          <IconSolarTag className="text-sm" />
          <span>标签</span>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap gap-2">
            {row.original.tags?.length
              ? row.original.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))
              : PLACEHODER_TEXT}
          </div>
        );
      },
    },
    {
      accessorKey: 'published',
      header: () => (
        <div className="flex space-x-1 items-center">
          <IconSolarEyeBold className="text-sm" />
          <span>发布状态</span>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <ToggleSnippetPublishSwitch
            id={row.original.id}
            published={row.original.published}
            refreshAsync={getSnippetsQuery.refreshAsync}
          />
        );
      },
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
        return (
          <div className="flex gap-2 items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size={'icon'}
                  variant="ghost"
                  onClick={() => handleGoToEdit(row.original.id)}
                >
                  <IconSolarPen className="text-base" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>编辑</TooltipContent>
            </Tooltip>
            <DeleteSnippetButton
              id={row.original.id}
              refreshAsync={getSnippetsQuery.refreshAsync}
            />
          </div>
        );
      },
    },
  ];

  return (
    <AdminContentLayout
      pageHeader={
        <PageHeader
          breadcrumbList={[PATHS.ADMIN_HOME, PATHS.ADMIN_SNIPPET]}
          action={
            <Button onClick={handleGoToCreate}>
              <IconSolarAddSquare className="mr-2 text-base" />
              创建片段
            </Button>
          }
        />
      }
    >
      <div className="grid gap-4 grid-cols-4 px-2 py-4 items-end">
        <Input
          placeholder="请输入标题"
          value={inputParams.title}
          onChange={(v) =>
            updateInputParams({
              title: v.target.value,
            })
          }
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Combobox
          options={
            tags?.map((el) => ({
              label: el.name,
              value: el.id,
            })) ?? []
          }
          multiple
          clearable
          selectPlaceholder="请选择标签"
          value={inputParams.tags}
          onValueChange={(v) => {
            updateInputParams({
              tags: v,
            });
          }}
        />
        {isAdmin(session?.user?.email) && (
          <Select
            onValueChange={(v: PUBLISHED_ENUM) =>
              updateInputParams({
                published: v,
              })
            }
            value={inputParams.published}
          >
            <SelectTrigger
              className={cn({
                'text-muted-foreground': isUndefined(inputParams.published),
              })}
            >
              <SelectValue placeholder="请选择发布状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PUBLISHED_ENUM.ALL}>
                {PUBLISHED_LABEL_MAP[PUBLISHED_ENUM.ALL]}
              </SelectItem>
              <SelectItem value={PUBLISHED_ENUM.PUBLISHED}>
                {PUBLISHED_LABEL_MAP[PUBLISHED_ENUM.PUBLISHED]}
              </SelectItem>
              <SelectItem value={PUBLISHED_ENUM.NO_PUBLISHED}>
                {PUBLISHED_LABEL_MAP[PUBLISHED_ENUM.NO_PUBLISHED]}
              </SelectItem>
            </SelectContent>
          </Select>
        )}
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
        total={getSnippetsQuery.data?.total}
        loading={getSnippetsQuery.loading}
        params={{ ...params }}
        updateParams={updateParams}
        noResult={
          <div className="grid place-content-center gap-4 py-16">
            <IllustrationNoContent />
            <p>暂无内容</p>
            <Button onClick={handleGoToCreate}>去创建</Button>
          </div>
        }
      />
    </AdminContentLayout>
  );

  function handleSearch() {
    updateParams({
      title: inputParams.title,
      published: inputParams.published,
      tags: inputParams.tags,
    });
  }

  function handleReset() {
    updateInputParams({
      title: '',
      tags: undefined,
      published: undefined,
    });
    updateParams({
      title: '',
      tags: undefined,
      published: undefined,
      pageIndex: DEFAULT_PAGE_INDEX,
      order: 'desc',
      orderBy: 'createdAt',
    });
  }

  function handleOrderChange(orderBy: GetSnippetsDTO['orderBy']) {
    updateParams((prev) => {
      if (prev.orderBy !== orderBy) {
        return { orderBy: orderBy, order: 'asc' };
      } else {
        if (prev.order === 'desc') {
          return { orderBy: undefined, order: undefined };
        } else if (prev.order === 'asc') {
          return { order: 'desc' };
        } else {
          return { order: 'asc' };
        }
      }
    });
  }

  function handleGoToCreate() {
    router.push(PATHS.ADMIN_SNIPPET_CREATE);
  }

  function handleGoToEdit(id: string) {
    router.push(`${PATHS.ADMIN_SNIPPET_EDIT}/${id}`);
  }
};

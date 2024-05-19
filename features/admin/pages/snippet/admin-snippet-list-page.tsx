'use client';

import React from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { TagTypeEnum } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { useSetState } from 'ahooks';
import { isUndefined } from 'lodash-es';
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Calendar,
  Eye,
  Pen,
  Plus,
  RotateCw,
  Search,
  TagsIcon,
  TypeIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
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

import { Highlight } from '@/components/highlight';
import { IllustrationNoContent } from '@/components/illustrations';
import { PageBreadcrumb } from '@/components/page-header';

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
  SearchByTags,
  ToggleSnippetPublishSwitch,
} from '../../components';

export const AdminSnippetListPage = () => {
  const { data: session } = useSession();
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
          <TypeIcon className="w-4 h-4" />
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
          <TagsIcon className="w-4 h-4" />
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
          <Eye className="w-4 h-4" />
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
          <Calendar className="w-3 h-3" />
          <span className="mx-1">创建时间</span>
          {params.order === 'asc' && params.orderBy == 'createdAt' && (
            <ArrowUpNarrowWide className="w-4 h-4" />
          )}
          {params.order === 'desc' && params.orderBy == 'createdAt' && (
            <ArrowDownNarrowWide className="w-4 h-4" />
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
          <Calendar className="w-3 h-3" />
          <span className="mx-1">更新时间</span>
          {params.order === 'asc' && params.orderBy == 'updatedAt' && (
            <ArrowUpNarrowWide className="w-4 h-4" />
          )}
          {params.order === 'desc' && params.orderBy == 'updatedAt' && (
            <ArrowDownNarrowWide className="w-4 h-4" />
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
            <Link
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
              )}
              href={`${PATHS.SITE_SNIPPET}/${row.original.slug}`}
              target="_blank"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Button
              size={'icon'}
              variant="outline"
              onClick={() => handleGoToEdit(row.original.id)}
            >
              <Pen className="h-4 w-4" />
            </Button>
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
      breadcrumb={
        <PageBreadcrumb
          breadcrumbList={[PATHS.ADMIN_HOME, PATHS.ADMIN_SNIPPET]}
        />
      }
    >
      <div className="grid gap-4 grid-cols-4 py-4 items-end px-1">
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
            <Search className="h-4 w-4 mr-2" />
            搜索
          </Button>
          <Button onClick={handleReset}>
            <RotateCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleGoToCreate}>
            <Plus className="h-4 w-4 mr-2" />
            创建片段
          </Button>
        </div>
      </div>

      <div className="pb-4">
        <SearchByTags tags={tags} params={params} updateParams={updateParams} />
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

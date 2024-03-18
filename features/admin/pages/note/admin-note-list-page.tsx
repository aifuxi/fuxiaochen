'use client';

import React from 'react';

import { TagTypeEnum } from '@prisma/client';
import { useSetState } from 'ahooks';

import { type WithSession } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { BytemdViewer } from '@/components/bytemd';
import {
  IconSolarMinimalisticMagnifer,
  IconSolarRestart,
} from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { Pagination, PaginationInfo } from '@/components/pagination';

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  PATHS,
  PUBLISHED_ENUM,
  PUBLISHED_LABEL_MAP,
} from '@/constants';
import { type GetNotesDTO, useGetNotes } from '@/features/note';
import { useGetAllTags } from '@/features/tag';
import { isAdmin, toSlashDateString } from '@/lib/utils';

import {
  AdminContentLayout,
  CreateNoteButton,
  DeleteNoteButton,
  EditNoteButton,
  ToggleNotePublishButton,
} from '../../components';

export const AdminNoteListPage = ({ session }: WithSession) => {
  const [params, updateParams] = useSetState<GetNotesDTO>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const [inputParams, updateInputParams] = useSetState<
    Omit<GetNotesDTO, 'pageIndex' | 'pageSize'>
  >({
    body: undefined,
    published: undefined,
    tags: undefined,
  });

  const getNotesQuery = useGetNotes(params);
  const pageCount = Math.ceil(
    (getNotesQuery.data?.total ?? 0) / params.pageSize,
  );
  const data = React.useMemo(
    () => getNotesQuery.data?.notes ?? [],
    [getNotesQuery],
  );

  const getTagsQuery = useGetAllTags(TagTypeEnum.NOTE);
  const tags = React.useMemo(() => {
    return getTagsQuery.data?.tags ?? [];
  }, [getTagsQuery]);

  return (
    <AdminContentLayout
      pageHeader={
        <PageHeader
          breadcrumbList={[PATHS.ADMIN_HOME, PATHS.ADMIN_NOTE]}
          action={<CreateNoteButton refresh={getNotesQuery.refresh} />}
        />
      }
    >
      <div className="w-[65ch] mx-auto grid gap-4">
        <Input
          placeholder="请输入内容"
          value={inputParams.body}
          onChange={(v) =>
            updateInputParams({
              body: v.target.value,
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
            <SelectTrigger className="text-muted-foreground">
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
        <div className="flex items-center space-x-4 justify-end">
          <Button onClick={handleSearch}>
            <IconSolarMinimalisticMagnifer className="mr-2" />
            搜索
          </Button>
          <Button onClick={handleReset}>
            <IconSolarRestart className="mr-2" />
            重置
          </Button>
        </div>

        <ul className="grid gap-4 w-[65ch]  mx-auto">
          {data.map((note) => (
            <li key={note.id}>
              <div className="border rounded-lg px-6 relative pb-6">
                <BytemdViewer body={note.body || ''} />
                <div className="grid grid-cols-12">
                  <div className="col-span-6 flex flex-wrap gap-2 mb-1">
                    {note.tags?.map((tag) => (
                      <Badge key={tag.id}>{tag.name}</Badge>
                    ))}
                  </div>
                  <div className="col-span-6 flex-1 flex items-end justify-end text-muted-foreground">
                    {toSlashDateString(note.createdAt)}
                  </div>
                </div>
                <div className="absolute right-2 top-2 space-x-2">
                  <ToggleNotePublishButton
                    id={note.id}
                    published={note.published}
                    refresh={getNotesQuery.refresh}
                  />
                  <EditNoteButton
                    id={note.id}
                    refresh={getNotesQuery.refresh}
                  />
                  <DeleteNoteButton
                    id={note.id}
                    refresh={getNotesQuery.refresh}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-betweens">
          {pageCount > 1 && (
            <PaginationInfo
              total={getNotesQuery.data?.total}
              params={{ ...params }}
            />
          )}
          <div className="flex-1 flex items-center justify-end">
            <Pagination
              total={getNotesQuery.data?.total}
              params={{ ...params }}
              updateParams={updateParams}
              showSizeChanger
            />
          </div>
        </div>
      </div>
    </AdminContentLayout>
  );

  function handleSearch() {
    updateParams({
      body: inputParams.body,
      tags: inputParams.tags,
      published: inputParams.published,
    });
  }

  function handleReset() {
    updateInputParams({
      body: '',
      published: undefined,
      tags: undefined,
    });
    updateParams({
      body: '',
      published: undefined,
      tags: undefined,
      pageIndex: DEFAULT_PAGE_INDEX,
      order: undefined,
      orderBy: undefined,
    });
  }
};

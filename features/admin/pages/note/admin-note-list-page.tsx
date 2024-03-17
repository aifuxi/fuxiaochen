'use client';

import React from 'react';

import { useImmer } from 'use-immer';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';

import { BytemdViewer } from '@/components/bytemd';
import {
  IconSolarMinimalisticMagnifer,
  IconSolarRestart,
} from '@/components/icons';
import { PageHeader } from '@/components/page-header';
import { Pagination, PaginationInfo } from '@/components/pagination';

import { DEFAULT_PAGE_INDEX, PATHS } from '@/constants';
import { type GetNotesDTO, useGetNotes } from '@/features/note';
import { useGetAllTags } from '@/features/tag';
import { toSlashDateString } from '@/lib/utils';

import {
  AdminAnimatePage,
  CreateNoteButton,
  DeleteNoteButton,
  EditNoteButton,
} from '../../components';

export const AdminNoteListPage = () => {
  const [params, updateParams] = useImmer<GetNotesDTO>({
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: 5,
  });

  const [inputParams, updateInputParams] = useImmer<
    Omit<GetNotesDTO, 'pageIndex' | 'pageSize'>
  >({
    body: undefined,
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

  const getTagsQuery = useGetAllTags();
  const tags = React.useMemo(() => {
    return getTagsQuery.data?.tags ?? [];
  }, [getTagsQuery]);

  return (
    <AdminAnimatePage className="flex flex-col gap-4">
      <PageHeader breadcrumbList={[PATHS.ADMIN_HOME, PATHS.ADMIN_NOTE]} />
      <div className="w-[65ch] mx-auto grid gap-4">
        <Input
          placeholder="内容"
          value={inputParams.body}
          onChange={(v) =>
            updateInputParams((draft) => {
              draft.body = v.target.value;
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
          selectPlaceholder="标签"
          value={inputParams.tags}
          onValueChange={(v) => {
            updateInputParams((draft) => {
              draft.tags = v;
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
          <CreateNoteButton />
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
                  <EditNoteButton id={note.id} />
                  <DeleteNoteButton id={note.id} />
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
    </AdminAnimatePage>
  );

  function handleSearch() {
    updateParams((draft) => {
      draft.body = inputParams.body;
      draft.tags = inputParams.tags;
    });
  }

  function handleReset() {
    updateInputParams((draft) => {
      draft.body = '';
      draft.tags = undefined;
    });
    updateParams((draft) => {
      draft.body = '';
      draft.tags = undefined;
      draft.pageIndex = DEFAULT_PAGE_INDEX;
      draft.order = undefined;
      draft.orderBy = undefined;
    });
  }
};

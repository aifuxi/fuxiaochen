'use client';

import React, { useState } from 'react';

import { PlusIcon } from 'lucide-react';
import useSWR from 'swr';

import { ClientPagination } from '@/components/client';
import { PageLoading } from '@/components/rsc';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants';
import { getTags, TAG_URL } from '@/services';
import { GetTagsRequest } from '@/types';
import { formatToDate, obj2QueryString } from '@/utils';

import CreateTagButton from './create-tag-button';
import DeleteTagItemButton from './delete-tag-item-button';
import EditTagButton from './edit-tag-button';

const AdminTag = () => {
  const [req, setReq] = useState<GetTagsRequest>({
    pageSize: DEFAULT_PAGE_SIZE,
    page: DEFAULT_PAGE,
  });
  const { data, isLoading, mutate } = useSWR(
    `${TAG_URL}${obj2QueryString(req)}`,
    () => getTags(req),
  );
  const tags = data?.data;
  const total = data?.total || 0;

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      <div className="flex justify-end">
        <CreateTagButton
          refreshTag={mutate}
          triggerNode={
            <Button size={'lg'}>
              <PlusIcon className="mr-2 h-4 w-4" />
              <span>创建标签</span>
            </Button>
          }
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>friendly_url</TableHead>
            <TableHead>文章数</TableHead>
            <TableHead className="w-[160px]">创建时间</TableHead>
            <TableHead className="w-[160px]">更新时间</TableHead>
            <TableHead className="min-w-[120px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tags?.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell>{tag.name}</TableCell>
              <TableCell>{tag.friendlyUrl}</TableCell>
              <TableCell>{tag.articleCount}</TableCell>
              <TableCell className="w-[160px]">
                {formatToDate(new Date(tag.createdAt))}
              </TableCell>
              <TableCell className="w-[160px]">
                {formatToDate(new Date(tag.updatedAt))}
              </TableCell>
              <TableCell className="flex space-x-2 min-w-[120px]">
                <EditTagButton tag={tag} refreshTag={mutate} />
                <DeleteTagItemButton tag={tag} refreshTag={mutate} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {Boolean(total) ? (
        <ClientPagination
          className="mt-4"
          page={req.page}
          total={total}
          changePage={(currentPage: number) => {
            setReq({
              ...req,
              page: currentPage,
            });
          }}
        />
      ) : (
        <div className="w-full text-center p-8 h-[44vh]">无数据</div>
      )}
    </div>
  );
};

export default AdminTag;

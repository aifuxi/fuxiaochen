'use client';

import React, { useState } from 'react';

import Link from 'next/link';

import { Button, IconButton, Switch, Table } from '@radix-ui/themes';
import { Edit } from 'lucide-react';
import useSWR from 'swr';

import { DeleteArticleItemButton } from './delete-article-item-button';
import { ClientPagination } from '@/components/client';
import { PageLoading } from '@/components/rsc';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  PLACEHOLDER_COVER,
  UMT_SOURCE,
  ZERO,
} from '@/constants';
import { ARTICLE_URL, getArticles, updateArticle } from '@/services';
import { type GetArticlesRequest } from '@/types';
import { cn, formatToDate, obj2QueryString } from '@/utils';

const defaultGetArticlesReq: GetArticlesRequest = {
  pageSize: DEFAULT_PAGE_SIZE,
  page: DEFAULT_PAGE,
  title: undefined,
  published: undefined,
};

const AdminArticle = () => {
  const [req, setReq] = useState<GetArticlesRequest>({
    ...defaultGetArticlesReq,
  });
  const { data, isLoading, mutate } = useSWR(
    `${ARTICLE_URL}${obj2QueryString(req)}`,
    () => getArticles(req),
  );
  const articles = data?.data;
  const total = data?.total ?? 0;

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      <div className="flex justify-end">
        <Link href={'/admin/create-article'}>
          <Button size={'2'}>创建文章</Button>
        </Link>
      </div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell className="w-[160px] max-w-[160px]">
              标题
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="min-w-[160px] w-[160px] max-w-[160px]">
              封面
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[160px] max-w-[160px]">
              friendly_url
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[160px] max-w-[160px]">
              描述
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[160px] max-w-[160px]">
              标签
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[160px] max-w-[160px]">
              创建时间
            </Table.ColumnHeaderCell>
            {/* <Table.ColumnHeaderCell className="w-[160px] max-w-[160px]">更新时间</Table.ColumnHeaderCell> */}
            <Table.ColumnHeaderCell className="min-w-[100px] w-[100px] max-w-[100px]">
              发布状态
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="min-w-[160px] w-[160px] max-w-[160px]">
              操作
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {articles?.map((article) => (
            <Table.Row key={article.id}>
              <Table.Cell className="w-[160px] max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap">
                {article.title}
              </Table.Cell>
              <Table.Cell className="min-w-[160px] w-[160px] max-w-[160px]">
                <img
                  src={article.cover ? article.cover : PLACEHOLDER_COVER}
                  className="cursor-pointer"
                  alt={article.title}
                />
              </Table.Cell>
              <Table.Cell className="w-[160px] max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap">
                <Link
                  href={`/articles/${article.friendlyUrl}${obj2QueryString({
                    [UMT_SOURCE]: '/admin/article',
                  })}`}
                  target="_blank"
                >
                  {article.friendlyUrl}
                </Link>
              </Table.Cell>
              <Table.Cell className="w-[160px] max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap">
                {article.description}
              </Table.Cell>
              <Table.Cell
                className={cn(
                  'w-[160px] max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap  text-xs font-medium',
                )}
              >
                {article.tags?.length
                  ? article.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.friendlyUrl}`}
                        target="_blank"
                        className={cn('mr-1 ')}
                      >
                        {tag.name}
                      </Link>
                    ))
                  : '-'}
              </Table.Cell>
              <Table.Cell className="w-[160px] max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap">
                {formatToDate(new Date(article.createdAt))}
              </Table.Cell>
              {/* <TableCell className="w-[160px] max-w-[160px] text-ellipsis overflow-hidden whitespace-nowrap">
                {formatToDate(new Date(article.updatedAt))}
              </TableCell> */}
              <Table.Cell className="w-[100px] min-w-[100px] max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap">
                <div className="flex flex-col justify-center space-y-1">
                  <Switch
                    checked={article.published}
                    onCheckedChange={(checked) => {
                      updateArticle(article.id, { published: checked })
                        .then((res) => {
                          if (res.code !== ZERO) {
                          } else {
                          }
                        })
                        .finally(() => {
                          mutate();
                        });
                    }}
                  />
                </div>
              </Table.Cell>
              <Table.Cell className="min-w-[160px] w-[160px] max-w-[160px] ">
                <div className="flex space-x-2 items-center">
                  <Link href={`/admin/create-article?id=${article.id}`}>
                    <IconButton>
                      <Edit size={16} />
                    </IconButton>
                  </Link>
                  <DeleteArticleItemButton
                    article={article}
                    refreshArticle={mutate}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

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

export default AdminArticle;

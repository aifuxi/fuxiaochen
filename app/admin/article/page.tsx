import React from 'react';

import Link from 'next/link';

import { Pencil1Icon, PlusIcon } from '@radix-ui/react-icons';
import { Badge, Button, Flex, IconButton, Table } from '@radix-ui/themes';

import { DeleteArticleItemButton } from './delete-article-item-button';
import { TogglePublishSwitch } from './toggle-publish-switch';
import { getArticles } from '@/app/_actions/article';
import { Pagination } from '@/components/client/pagination/pagination';
import { DEFAULT_PAGE, PLACEHOLDER_COVER } from '@/constants';
import { formatToDate } from '@/utils';

export default async function AdminArticle({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const { articles, total } = await getArticles({
    page: currentPage,
  });

  return (
    <Flex gap={'4'} direction={'column'}>
      <Flex justify={'end'}>
        <Link href={'/admin/create-article'}>
          <Button color="gray" highContrast>
            <PlusIcon />
            创建文章
          </Button>
        </Link>
      </Flex>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell className="w-[200px]">
              标题
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[200px]">
              封面
            </Table.ColumnHeaderCell>

            <Table.ColumnHeaderCell className="w-[200px]">
              描述
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[200px]">
              标签
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[200px]">
              创建时间
            </Table.ColumnHeaderCell>

            <Table.ColumnHeaderCell className="w-[200px]">
              发布状态
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="w-[200px]">
              操作
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {articles?.map((article) => (
            <Table.Row key={article.id}>
              <Table.Cell className="!align-middle  w-[200px]">
                {article.title}
              </Table.Cell>
              <Table.Cell className="!align-middle w-[200px]">
                <img
                  src={article.cover ? article.cover : PLACEHOLDER_COVER}
                  alt={article.title}
                />
              </Table.Cell>
              <Table.Cell className="!align-middle  w-[200px]">
                {article.description}
              </Table.Cell>
              <Table.Cell className={'!align-middle  w-[200px]'}>
                <Flex gap="2">
                  {article.tags?.length
                    ? article.tags.map((tag) => (
                        <Link
                          key={tag.id}
                          href={`/tags/${tag.friendlyUrl}`}
                          target="_blank"
                        >
                          <Badge>{tag.name}</Badge>
                        </Link>
                      ))
                    : '-'}
                </Flex>
              </Table.Cell>
              <Table.Cell className="!align-middle  w-[200px]">
                {formatToDate(new Date(article.createdAt))}
              </Table.Cell>

              <Table.Cell className="!align-middle  w-[200px]">
                <TogglePublishSwitch article={article} />
              </Table.Cell>
              <Table.Cell className="!align-middle w-[200px]">
                <Flex gap={'2'} align={'center'}>
                  <Link href={`/admin/create-article?id=${article.id}`}>
                    <IconButton color="gray" highContrast>
                      <Pencil1Icon />
                    </IconButton>
                  </Link>
                  <DeleteArticleItemButton article={article} />
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Pagination total={total} />
    </Flex>
  );
}

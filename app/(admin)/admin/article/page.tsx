import React from 'react';

import Link from 'next/link';

import { PencilIcon, PlusIcon } from 'lucide-react';

import { DeleteArticleItemButton } from './delete-article-item-button';
import { TogglePublishSwitch } from './toggle-publish-switch';
import { getArticles } from '@/app/actions/article';
import { Pagination } from '@/components/pagination';
import { badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PATHS } from '@/constants/path';
import { DEFAULT_PAGE, PLACEHOLDER_COVER } from '@/constants/unknown';
import { cn, formatToDate } from '@/utils';

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
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold tracking-tight transition-colors">
        文章管理
      </h2>

      <div className="flex justify-end">
        <Link href={PATHS.ADMIN_ARTICLE_CREATE}>
          <Button>
            <PlusIcon className="mr-2 " size={16} />
            创建文章
          </Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">标题</TableHead>
            <TableHead className="w-[200px]">封面</TableHead>

            <TableHead className="w-[200px]">描述</TableHead>
            <TableHead className="w-[200px]">标签</TableHead>
            <TableHead className="w-[200px]">创建时间</TableHead>

            <TableHead className="w-[200px]">发布状态</TableHead>
            <TableHead className="w-[200px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles?.map((article) => (
            <TableRow key={article.id}>
              <TableCell className="!align-middle  w-[200px]">
                {article.title}
              </TableCell>
              <TableCell className="!align-middle w-[200px]">
                <img
                  src={article.cover ? article.cover : PLACEHOLDER_COVER}
                  alt={article.title}
                />
              </TableCell>
              <TableCell className="!align-middle  w-[200px]">
                {article.description}
              </TableCell>
              <TableCell className={'!align-middle  w-[200px]'}>
                <div className="flex flex-wrap gap-2">
                  {article.tags?.length
                    ? article.tags.map((tag) => (
                        <Link
                          href={`${PATHS.SITE_TAGS}/${tag.friendlyUrl}`}
                          key={tag.id}
                          target="_blank"
                          className={cn(
                            badgeVariants({ variant: 'default' }),
                            '!rounded-none',
                          )}
                        >
                          {tag.name}
                        </Link>
                      ))
                    : '-'}
                </div>
              </TableCell>
              <TableCell className="!align-middle  w-[200px]">
                {formatToDate(new Date(article.createdAt))}
              </TableCell>

              <TableCell className="!align-middle  w-[200px]">
                <TogglePublishSwitch article={article} />
              </TableCell>
              <TableCell className="!align-middle w-[200px]">
                <div className="flex items-center gap-2">
                  <Link href={`${PATHS.ADMIN_ARTICLE_EDIT}/${article.id}`}>
                    <Button size={'icon'}>
                      <PencilIcon size={16} />
                    </Button>
                  </Link>
                  <DeleteArticleItemButton article={article} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination total={total} />
    </div>
  );
}

import React from 'react';

import { type Metadata } from 'next';

import { getTagArticles, getTagByFriendlyURL } from '@/app/actions/tag';
import { PageTitle } from '@/components/page-title';
import { DEFAULT_PAGE } from '@/constants/unknown';

import ArticleList from '../../articles/article-list';

export async function generateMetadata({
  params,
}: {
  params: { friendlyUrl: string };
}): Promise<Metadata> {
  const tag = await getTagByFriendlyURL(params.friendlyUrl);
  const name = tag?.name ?? '-';
  return {
    title: `${name}`,
  };
}

export default async function TagDetailPage({
  params,
  searchParams,
}: {
  params: { friendlyUrl: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const tag = await getTagByFriendlyURL(params.friendlyUrl);
  const { articles, total } = await getTagArticles({
    friendlyURL: params.friendlyUrl,
    page: currentPage,
  });

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-8 pb-8">
        <PageTitle title={tag?.name ?? '-'} />

        <ArticleList articles={articles} total={total} />
      </div>
    </div>
  );
}

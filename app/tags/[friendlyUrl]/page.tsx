import React from 'react';

import { Metadata } from 'next';

import {
  getTagArticlesByFriendlyURLAction,
  getTagByFriendlyURLAction,
} from '@/app/_actions/tag';
import { EmptyPage } from '@/components/client';
import { NotFound404Illustration, PageTitle } from '@/components/rsc';
import { DEFAULT_PAGE } from '@/constants';

import TagArticles from './TagArticles';

export async function generateMetadata({
  params,
}: {
  params: { friendlyUrl: string };
}): Promise<Metadata> {
  const tag = await getTagByFriendlyURLAction(params.friendlyUrl);
  const name = tag?.name || '-';
  return {
    title: `${name}`,
  };
}

export default async function TagDetailPage({
  params,
  searchParams,
}: {
  params: { friendlyUrl: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const tag = await getTagByFriendlyURLAction(params.friendlyUrl);
  const { articles, total } = await getTagArticlesByFriendlyURLAction({
    friendlyURL: params.friendlyUrl,
    page: currentPage,
  });

  if (!total) {
    return (
      <EmptyPage
        illustration={
          <NotFound404Illustration className="w-[320px] h-[320px] sm:w-[500px] sm:h-[500px]" />
        }
        title="啊噢，标签不见啦~"
      />
    );
  }

  return (
    <div className="container flex flex-col space-y-8">
      <PageTitle title={tag?.name || '-'} />

      <TagArticles total={total} articles={articles} />
    </div>
  );
}

import React from 'react';

import { type Metadata } from 'next';

import { Container, Flex } from '@radix-ui/themes';

import { getTagArticles, getTagByFriendlyURL } from '@/app/_actions/tag';
import { EmptyPage } from '@/components/client';
import { NotFound404Illustration, PageTitle } from '@/components/rsc';
import { DEFAULT_PAGE } from '@/constants';

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
    <Container size={'4'}>
      <Flex direction={'column'} gap={'8'} pb={'8'}>
        <PageTitle title={tag?.name ?? '-'} />

        <ArticleList articles={articles} total={total} />
      </Flex>
    </Container>
  );
}

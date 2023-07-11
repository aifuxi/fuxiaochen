import React from 'react';

import { Metadata } from 'next';

import ArticleItem from '@/app/articles/article-item';
import { PageTitle } from '@/components/rsc';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/constants';
import { getTags } from '@/services';

export async function generateMetadata({
  params,
}: {
  params: { friendlyUrl: string };
}): Promise<Metadata> {
  const data = await getTags({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    friendlyUrl: params.friendlyUrl,
    published: true,
  });
  const currentTag = data.data?.[0];
  return {
    title: `${currentTag?.name} - 标签`,
  };
}

export default async function TagDetailPage({
  params,
}: {
  params: { friendlyUrl: string };
}) {
  const data = await getTags({
    page: DEFAULT_PAGE,
    pageSize: MAX_PAGE_SIZE,
    friendlyUrl: params.friendlyUrl,
    published: true,
  });
  const currentTag = data.data?.[0];
  const articles = currentTag?.articles;
  const articleCount = currentTag?.articleCount;

  return (
    <div className="flex flex-col space-y-8">
      <PageTitle title={currentTag?.name || ''} />
      <p className="prose">
        共<span className="font-semibold px-1">{articleCount}</span>篇文章
      </p>
      <ul className="flex flex-col space-y-10">
        {articles?.map((article) => (
          <li key={article.id}>
            <ArticleItem article={article} />
          </li>
        ))}
      </ul>
    </div>
  );
}

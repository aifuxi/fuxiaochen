import React from 'react';

import { Metadata } from 'next';

import ArticleItem from '@/app/articles/article-item';
import EmptyArticleList from '@/app/articles/empty-article-list';
import { getServerSideTagByFriendlyUrl } from '@/app/fetch-data';
import { EmptyPage } from '@/components/client';
import { NotFound404Illustration, PageTitle } from '@/components/rsc';

export async function generateMetadata({
  params,
}: {
  params: { friendlyUrl: string };
}): Promise<Metadata> {
  const data = await getServerSideTagByFriendlyUrl(params.friendlyUrl);
  const name = data.data?.name || '标签未找到';
  return {
    title: `${name} - 标签`,
  };
}

export default async function TagDetailPage({
  params,
}: {
  params: { friendlyUrl: string };
}) {
  const data = await getServerSideTagByFriendlyUrl(params.friendlyUrl);
  const currentTag = data.data;
  const articles = currentTag?.articles;
  const articleCount = articles?.length || 0;

  if (!currentTag) {
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
      <PageTitle title={currentTag?.name || ''} />
      {renderArticles()}
    </div>
  );

  function renderArticles() {
    if (!articles?.length) {
      return <EmptyArticleList />;
    }

    return (
      <>
        <p>
          共<span className="font-semibold px-1">{articleCount}</span>
          篇文章
        </p>
        <ul className="flex flex-col space-y-10">
          {articles?.map((article) => (
            <li key={article.id}>
              <ArticleItem article={article} />
            </li>
          ))}
        </ul>
      </>
    );
  }
}

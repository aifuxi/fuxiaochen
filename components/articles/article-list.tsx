import React from 'react';

import { type Article } from '@prisma/client';

import { IllustrationNoContent } from '@/components/illustrations';

import { ArticleItem } from './article-item';

type Props = {
  total: number;
  articles?: Article[];
};

export function ArticleList({ articles }: Props) {
  return (
    <div className="flex flex-col ">
      {articles?.length ? (
        <div className="flex flex-col space-y-3">
          {articles?.map((article) => (
            <ArticleItem key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 place-content-center">
          <IllustrationNoContent className="w-[30vh] h-[30vh]" />
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            暂无文章
          </h3>
        </div>
      )}
    </div>
  );
}

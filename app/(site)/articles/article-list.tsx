import React from 'react';

import { type Article } from '@prisma/client';

import ArticleItem from './article-item';
import { IllustrationNoContent } from '@/components/illustrations';
import { Pagination } from '@/components/pagination';

type Props = {
  total: number;
  articles?: Article[];
};

const ArticleList = ({ total, articles }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      {articles?.length ? (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            共&nbsp;
            <span className="font-medium">{total}</span>
            &nbsp;篇文章
          </p>
          <div className="flex flex-col">
            {articles?.map((article) => (
              <ArticleItem key={article.id} article={article} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-8 place-content-center">
          <IllustrationNoContent className="w-[30vh] h-[30vh]" />
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center">
            暂无文章
          </h3>
        </div>
      )}

      <Pagination total={total} />
    </div>
  );
};

export default ArticleList;

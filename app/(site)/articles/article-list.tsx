import React from 'react';

import { type Article } from '@prisma/client';

import ArticleItem from './article-item';
import { Pagination } from '@/components/pagination/pagination';

type Props = {
  total: number;
  articles?: Article[];
};

const ArticleList = ({ total, articles }: Props) => {
  return (
    <div className="flex flex-col gap-4">
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

      <Pagination total={total} />
    </div>
  );
};

export default ArticleList;

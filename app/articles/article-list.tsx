import React from 'react';

import { type Article } from '@prisma/client';

import { Pagination } from '@/components/client/pagination/pagination';

import ArticleItem from './article-item';
import EmptyArticleList from './empty-article-list';

type Props = {
  total: number;
  articles?: Article[];
};

const ArticleList = ({ total, articles }: Props) => {
  if (!articles?.length) {
    return <EmptyArticleList />;
  }

  return (
    <>
      <p>
        共<span className="font-semibold px-1">{total}</span>
        篇文章
      </p>
      <ul className="flex flex-col">
        {articles?.map((article) => (
          <li key={article.id}>
            <ArticleItem article={article} />
          </li>
        ))}
      </ul>

      <Pagination total={total} />
    </>
  );
};

export default ArticleList;

import React from 'react';

import ArticleItem from '@/app/articles/article-item';
import EmptyArticleList from '@/app/articles/empty-article-list';
import { Pagination } from '@/components/client/pagination/pagination';
import { Article } from '@/types';

type Props = {
  total: number;
  articles?: Article[];
};

const TagArticles = ({ total, articles }: Props) => {
  if (!articles?.length) {
    return <EmptyArticleList />;
  }

  return (
    <>
      <p>
        共<span className="font-semibold px-1">{total}</span>
        篇文章
      </p>
      <ul className="flex flex-col space-y-10">
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

export default TagArticles;

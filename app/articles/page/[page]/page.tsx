import React from 'react';

import { Pagination } from '@/components';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { getArticles } from '@/services';

import ArticleItem from '../../article-item';

const ArticlePage = async ({ params }: { params: { page: string } }) => {
  const page = Number(params.page);
  const res = await getArticles({
    page,
    published: true,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const articles = res?.data;
  const total = res?.total || 0;

  return (
    <>
      <ul className="flex flex-col space-y-10">
        {articles?.map((article) => (
          <li key={article.id}>
            <ArticleItem article={article} />
          </li>
        ))}
      </ul>
      <Pagination currentPage={page} total={total} />
    </>
  );
};

export default ArticlePage;

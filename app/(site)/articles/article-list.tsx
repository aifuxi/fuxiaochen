import React from 'react';

import { type Article } from '@prisma/client';
import { Text } from '@radix-ui/themes';

import ArticleItem from './article-item';
import { Pagination } from '@/components/client/pagination/pagination';

type Props = {
  total: number;
  articles?: Article[];
};

const ArticleList = ({ total, articles }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <Text size={'6'} as="p">
        共&nbsp;
        <Text size={'6'} weight={'medium'} as="span">
          {total}
        </Text>
        &nbsp;篇文章
      </Text>

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

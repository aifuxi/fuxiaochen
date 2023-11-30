import React from 'react';

import { type Article } from '@prisma/client';
import { Flex, Text } from '@radix-ui/themes';

import ArticleItem from './article-item';
import EmptyArticleList from './empty-article-list';
import { Pagination } from '@/components/client/pagination/pagination';

type Props = {
  total: number;
  articles?: Article[];
};

const ArticleList = ({ total, articles }: Props) => {
  if (!articles?.length) {
    return <EmptyArticleList />;
  }

  return (
    <Flex direction={'column'} gap={'4'}>
      <Text size={'6'} as="p">
        共&nbsp;
        <Text size={'6'} weight={'medium'} as="span">
          {total}
        </Text>
        &nbsp;篇文章
      </Text>

      <Flex direction={'column'}>
        {articles?.map((article) => (
          <ArticleItem key={article.id} article={article} />
        ))}
      </Flex>

      <Pagination total={total} />
    </Flex>
  );
};

export default ArticleList;

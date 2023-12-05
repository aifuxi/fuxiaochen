import { type Metadata } from 'next';

import { Container } from '@radix-ui/themes';

import ArticleList from './article-list';
import { PageTitle } from '@/components/rsc';
import { DEFAULT_PAGE } from '@/constants';

import { getPublishedArticles } from '../../_actions/article';

export const metadata: Metadata = {
  title: '文章',
};
export const revalidate = 60;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { page } = searchParams ?? {};
  const currentPage = typeof page === 'string' ? parseInt(page) : DEFAULT_PAGE;

  const { articles, total } = await getPublishedArticles({
    page: currentPage,
  });

  return (
    <Container size={'4'}>
      <div className="flex flex-col gap-8 pb-8">
        <PageTitle title="文章" />

        <ArticleList articles={articles} total={total} />
      </div>
    </Container>
  );
}

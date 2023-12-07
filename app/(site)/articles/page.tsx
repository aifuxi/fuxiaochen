import { type Metadata } from 'next';

import ArticleList from './article-list';
import { PageTitle } from '@/components/page-title';
import { DEFAULT_PAGE } from '@/constants/unknown';

import { getPublishedArticles } from '../../actions/article';

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
    <div className="container mx-auto">
      <div className="flex flex-col gap-8 pb-8">
        <PageTitle title="文章" />

        <ArticleList articles={articles} total={total} />
      </div>
    </div>
  );
}

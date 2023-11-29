import { type Metadata } from 'next';

import ArticleList from './article-list';
import { PageTitle } from '@/components/rsc';
import { DEFAULT_PAGE } from '@/constants';

import { getArticlesAction } from '../../_actions/article';

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

  const { articles, total } = await getArticlesAction({
    page: currentPage,
  });

  return (
    <div className="container flex flex-col space-y-8">
      <PageTitle title="文章 / Articles" />

      <ArticleList articles={articles} total={total} />
    </div>
  );
}

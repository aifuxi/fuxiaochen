import { type Metadata } from 'next';

import { ArticleList } from '@/components/articles';

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
    <div className="w-full flex flex-col justify-center max-w-screen-md gap-5">
      <h2 className="text-4xl md:text-5xl leading-[1.125] font-bold tracking-tight">
        文章
      </h2>
      <ArticleList articles={articles} total={total} />
    </div>
  );
}

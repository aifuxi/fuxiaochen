import { type Metadata } from 'next';

import { ArticleList } from '@/components/articles';

import { getPublishedArticles } from '../../actions/article';

export const metadata: Metadata = {
  title: '文章',
};
export const revalidate = 60;

export default async function ArticlesPage() {
  const { articles, total } = await getPublishedArticles();

  return (
    <div className="min-h-screen flex flex-col gap-8 pb-8">
      <ArticleList articles={articles} total={total} />
    </div>
  );
}

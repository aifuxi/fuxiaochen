import { ArticleList, getPublishedArticles } from '@/features/article';

export const revalidate = 60;

export default async function Page() {
  const { articles } = await getPublishedArticles();

  return (
    <div className="w-full flex flex-col justify-center max-w-screen-md mx-auto pt-24">
      <h2 className="text-4xl md:text-5xl font-bold mb-9">文章</h2>

      <ArticleList articles={articles} />
    </div>
  );
}

import { PATHS, PATHS_MAP } from '@/config';

import { ArticleList, getPublishedArticles } from '@/features/article';

export const revalidate = 60;

export default async function Page() {
  const { articles } = await getPublishedArticles();

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md  2xl:max-w-6xl  md:mx-auto py-24">
      <h2 className="text-4xl md:text-5xl font-bold mb-9">
        {PATHS_MAP[PATHS.SITE_ARTICLES]}
      </h2>

      <ArticleList articles={articles} />
    </div>
  );
}

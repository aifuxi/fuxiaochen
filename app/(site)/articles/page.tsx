import { PATHS, PATHS_MAP } from '@/config';

import { TransitionH2 } from '@/components/transition';

import { ArticleList, getPublishedArticles } from '@/features/article';

export const revalidate = 60;

export default async function Page() {
  const { articles } = await getPublishedArticles();

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md  2xl:max-w-6xl  md:mx-auto py-24">
      <TransitionH2 className="text-4xl md:text-5xl font-bold mb-9">
        {PATHS_MAP[PATHS.SITE_ARTICLES]}
      </TransitionH2>

      <ArticleList articles={articles} />
    </div>
  );
}

import { PATHS, PATHS_MAP } from '@/config';

import { BlogList, getPublishedBlogs } from '@/features/blog';

export const revalidate = 60;

export default async function Page() {
  const { blogs } = await getPublishedBlogs();

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md  2xl:max-w-6xl  md:mx-auto py-24">
      <h2 className="text-4xl md:text-5xl font-bold mb-9">
        {PATHS_MAP[PATHS.SITE_BLOG]}
      </h2>

      <BlogList blogs={blogs} />
    </div>
  );
}

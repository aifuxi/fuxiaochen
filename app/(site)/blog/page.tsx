import { BlogList, getPublishedBlogs } from '@/features/blog';

export const revalidate = 60;

export default async function Page() {
  const { blogs, uvMap } = await getPublishedBlogs();

  return (
    <div className="w-full flex flex-col justify-center px-6 md:max-w-screen-md  2xl:max-w-6xl  md:mx-auto pb-24 pt-8">
      <h2 className="text-3xl md:text-4xl font-bold pb-8">博客</h2>

      <BlogList blogs={blogs} uvMap={uvMap} />
    </div>
  );
}

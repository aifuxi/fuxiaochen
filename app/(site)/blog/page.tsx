import { Wrapper } from '@/components/wrapper';

import { BlogList, getPublishedBlogs } from '@/features/blog';

export const revalidate = 60;

export default async function Page() {
  const { blogs, uvMap } = await getPublishedBlogs();

  return (
    <Wrapper className="flex flex-col min-h-screen pt-8 pb-24 px-6">
      <h2 className="text-3xl md:text-4xl font-bold pb-8">最新文章</h2>

      <BlogList blogs={blogs} uvMap={uvMap} />
    </Wrapper>
  );
}

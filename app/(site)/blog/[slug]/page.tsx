import { notFound } from 'next/navigation';

import { isNil } from 'lodash-es';

import { BlogDetailPage, getPlublishedBlogBySlug } from '@/features/blog';

export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const { blog } = await getPlublishedBlogBySlug(params.slug);

  if (isNil(blog)) {
    return notFound();
  }

  return <BlogDetailPage blog={blog} />;
}

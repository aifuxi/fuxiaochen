import { notFound } from "next/navigation";

import { isNil } from "lodash-es";

import { BlogDetailPage, getPublishedBlogBySlug } from "@/features/blog";
import { getBlogUV } from "@/features/statistics";

export const revalidate = 60;

export default async function Page({ params }: { params: { slug: string } }) {
  const { blog } = await getPublishedBlogBySlug(params.slug);
  const uv = await getBlogUV(blog?.id);

  if (isNil(blog)) {
    return notFound();
  }

  return <BlogDetailPage blog={blog} uv={uv} />;
}

import { notFound } from "next/navigation";

import { isNil } from "es-toolkit";

import { BlogGrid } from "@/components/blog-grid";

import { getTagDetail } from "@/api/tag";

export const revalidate = 60;

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const resp = await getTagDetail(params.slug);
  const tag = resp.data;

  if (isNil(tag)) {
    return notFound();
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">{tag.name}</h1>
          <p className="text-lg text-muted-foreground">
            标签「{tag.name}」下共计 {tag?.blogs?.length || 0} 篇博客
          </p>
        </div>

        <BlogGrid blogs={tag?.blogs || []} />
      </div>
    </div>
  );
}

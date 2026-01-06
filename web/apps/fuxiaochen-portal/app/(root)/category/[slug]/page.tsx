import { notFound } from "next/navigation";

import { isNil } from "es-toolkit";

import { BlogGrid } from "@/components/blog/blog-grid";

import { getCategoryDetail } from "@/api/category";

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const resp = await getCategoryDetail(params.slug);
  const category = resp;

  if (isNil(category)) {
    return notFound();
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold">{category.name}</h1>
          <p className="text-lg text-muted-foreground">
            分类「{category.name}」下共计 {category?.blogs?.length || 0} 篇博客
          </p>
        </div>

        <BlogGrid blogs={category?.blogs || []} />
      </div>
    </div>
  );
}

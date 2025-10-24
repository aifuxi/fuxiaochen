import { notFound } from "next/navigation";

import { isNil } from "es-toolkit";

import { BlogList } from "@/app/(root)/blogs/components/blog-list";

import { getCategoryBySlug } from "../actions";

export const revalidate = 60;

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { category } = await getCategoryBySlug(params.slug);

  if (isNil(category)) {
    return notFound();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-wrapper flex-col px-6 pt-8 pb-24">
      <h2
        className={`
          flex items-center pb-8 text-3xl font-bold
          md:text-4xl
        `}
      >
        分类 <span className="mx-3">|</span> {category.name}
      </h2>

      <div className="pb-8 text-sm text-muted-foreground">
        共计{category.blogs.length}篇博客
      </div>

      <BlogList blogs={category.blogs} />
    </div>
  );
}

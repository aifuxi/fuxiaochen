import { notFound } from "next/navigation";

import { getBlogByIdAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";

import { BlogForm } from "../blog-form";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const [blogRes, categoriesRes, tagsRes] = await Promise.all([
    getBlogByIdAction(id),
    getCategoriesAction({ page: 1, pageSize: 100 }),
    getTagsAction({ page: 1, pageSize: 100 }),
  ]);

  if (!blogRes.success || !blogRes.data) {
    notFound();
  }

  const blog = blogRes.data;
  const categories =
    categoriesRes.success && categoriesRes.data?.lists
      ? categoriesRes.data.lists
      : [];
  const tags =
    tagsRes.success && tagsRes.data?.lists ? tagsRes.data.lists : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-orbitron text-3xl font-bold tracking-wider text-white uppercase">
          <span className="text-neon-cyan">Edit</span> Blog
        </h1>
      </div>
      <BlogForm initialData={blog} categories={categories} tags={tags} />
    </div>
  );
}

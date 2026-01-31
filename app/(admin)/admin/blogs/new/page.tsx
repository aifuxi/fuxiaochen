import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";

import { BlogForm } from "../blog-form";

export default async function NewBlogPage() {
  const [categoriesRes, tagsRes] = await Promise.all([
    getCategoriesAction({ page: 1, pageSize: 100 }),
    getTagsAction({ page: 1, pageSize: 100 }),
  ]);

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
          <span className="text-neon-cyan">New</span> Blog
        </h1>
      </div>
      <BlogForm categories={categories} tags={tags} />
    </div>
  );
}

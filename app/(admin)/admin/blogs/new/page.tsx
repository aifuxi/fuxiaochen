import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";
import { auth } from "@/lib/auth";
import { BlogForm } from "../blog-form";

export default async function NewBlogPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user?.role !== "admin") {
    redirect("/admin/blogs");
  }

  const [categoriesRes, tagsRes] = await Promise.all([
    getCategoriesAction({ page: 1, pageSize: 100 }),
    getTagsAction({ page: 1, pageSize: 100 }),
  ]);

  const categories =
    categoriesRes.success && categoriesRes.data?.lists
      ? categoriesRes.data.lists
      : [];
  const tags = tagsRes.success && tagsRes.data?.lists ? tagsRes.data.lists : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-color)] uppercase">
          新建文章
        </h2>
      </div>
      <BlogForm categories={categories} tags={tags} />
    </div>
  );
}

import { BlogEditor } from "@/components/admin/blog-editor";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogEditor blogId={id} />;
}

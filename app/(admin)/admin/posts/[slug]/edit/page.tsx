import { AdminPostEditor } from "@/components/admin/admin-post-editor";

type EditPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;

  return <AdminPostEditor mode="edit" slug={slug} />;
}

import type { Metadata } from "next";

import { AdminPostEditor } from "@/components/admin/admin-post-editor";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "编辑文章 · fuxiaochen",
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  return <AdminPostEditor id={id} />;
}

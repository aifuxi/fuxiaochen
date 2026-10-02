import type { Metadata } from "next";

import { AdminPostEditor } from "@/components/admin/admin-post-editor";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "新建文章 · fuxiaochen",
};

export default async function NewPostPage() {
  await requireAdmin();
  return <AdminPostEditor />;
}

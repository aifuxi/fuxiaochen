import type { Metadata } from "next";

import { AdminPosts } from "@/components/admin/admin-posts";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "内容管理 · fuxiaochen",
  description: "管理已持久化的文章、草稿与发布计划。",
};

export default async function PostsPage() {
  await requireAdmin();
  return <AdminPosts />;
}

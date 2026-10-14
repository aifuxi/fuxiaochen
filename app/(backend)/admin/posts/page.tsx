import type { Metadata } from "next";

import { AdminPosts } from "@/components/admin/admin-posts";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "文章管理 · 付小晨",
  description: "管理文章与草稿。",
};

export default async function PostsPage() {
  await requireAdmin();
  return <AdminPosts />;
}

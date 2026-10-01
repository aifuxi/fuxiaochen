import type { Metadata } from "next";

import { AdminPosts } from "@/components/admin/admin-posts";

export const metadata: Metadata = {
  title: "内容管理 · fuxiaochen",
  description: "使用演示数据管理文章、草稿与发布计划。",
};

export default function PostsPage() {
  return <AdminPosts />;
}

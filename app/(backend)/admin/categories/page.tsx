import type { Metadata } from "next";

import { AdminCategories } from "@/components/admin/admin-categories";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "分类与标签 · fuxiaochen",
  description: "使用独立演示数据管理博文分类与标签。",
};

export default async function CategoriesPage() {
  await requireAdmin();
  return <AdminCategories />;
}

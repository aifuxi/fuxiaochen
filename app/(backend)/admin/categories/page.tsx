import type { Metadata } from "next";

import { AdminCategories } from "@/components/admin/admin-categories";

export const metadata: Metadata = {
  title: "分类与标签 · fuxiaochen",
  description: "使用独立演示数据管理博文分类与标签。",
};

export default function CategoriesPage() {
  return <AdminCategories />;
}

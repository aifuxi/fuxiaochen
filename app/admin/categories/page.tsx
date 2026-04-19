import type { Metadata } from "next";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";

export const metadata: Metadata = {
  title: "Admin Categories",
  description: "Manage category records in the admin interface.",
};

export default function AdminCategoriesPage() {
  return (
    <AdminResourcePage
      resource="categories"
      title="Categories"
      description="维护文章分类，保持 slug 和描述的一致性。"
    />
  );
}

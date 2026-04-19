import type { Metadata } from "next";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";

export const metadata: Metadata = {
  title: "Admin Posts",
  description: "Manage post records in the admin interface.",
};

export default function AdminPostsPage() {
  return (
    <AdminResourcePage
      resource="blogs"
      title="Posts"
      description="维护文章内容、分类、标签与发布状态。"
    />
  );
}

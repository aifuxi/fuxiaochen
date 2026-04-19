import type { Metadata } from "next";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";

export const metadata: Metadata = {
  title: "Admin Tags",
  description: "Manage tag records in the admin interface.",
};

export default function AdminTagsPage() {
  return (
    <AdminResourcePage
      resource="tags"
      title="Tags"
      description="维护标签，供文章多选关联使用。"
    />
  );
}

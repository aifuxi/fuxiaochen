import type { Metadata } from "next";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";

export const metadata: Metadata = {
  title: "Admin Changelog",
  description: "Manage changelog records in the admin interface.",
};

export default function AdminChangelogPage() {
  return (
    <AdminResourcePage
      resource="changelogs"
      title="Changelog"
      description="维护版本号、发布日期和 changelog 文本内容。"
    />
  );
}

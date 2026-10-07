import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/admin-overview";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "工作台 · fuxiaochen",
  description: "查看文章、评论、发布计划与访问统计。",
};

export default async function AdminPage() {
  await requireAdmin();
  return <AdminOverview />;
}

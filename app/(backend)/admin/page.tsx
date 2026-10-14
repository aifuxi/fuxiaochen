import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/admin-overview";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "工作台 · 付小晨",
  description: "查看文章与草稿。",
};

export default async function AdminPage() {
  await requireAdmin();
  return <AdminOverview />;
}

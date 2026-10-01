import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/admin-overview";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "管理仪表盘 · fuxiaochen",
  description: "fuxiaochen 管理空间的模拟运营仪表盘。",
};

export default async function AdminPage() {
  await requireAdmin();
  return <AdminOverview />;
}

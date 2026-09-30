import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata: Metadata = {
  title: "管理仪表盘 · fuxiaochen",
  description: "fuxiaochen 管理空间的模拟运营仪表盘。",
};

export default function AdminPage() {
  return <AdminOverview />;
}

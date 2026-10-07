import type { Metadata } from "next";

import { AdminAnalytics } from "@/components/admin/admin-analytics";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "数据分析 · 付小晨",
  description: "查看访问趋势、来源、设备分布与文章表现。",
};

export default async function AnalyticsPage() {
  await requireAdmin();
  return <AdminAnalytics />;
}

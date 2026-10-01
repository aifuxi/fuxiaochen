import type { Metadata } from "next";

import { AdminAnalytics } from "@/components/admin/admin-analytics";

export const metadata: Metadata = {
  title: "数据分析 · fuxiaochen",
  description: "使用演示数据查看访问趋势、设备分布与文章留存表现。",
};

export default function AnalyticsPage() {
  return <AdminAnalytics />;
}

import type { Metadata } from "next";

import { AdminVisitors } from "@/components/admin/admin-visitors";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "访客日志 · fuxiaochen",
  description: "查看浏览器采集的真实访客日志与匿名访问摘要。",
};

export default async function VisitorsPage() {
  await requireAdmin();
  return <AdminVisitors />;
}

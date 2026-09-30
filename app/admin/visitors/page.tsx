import type { Metadata } from "next";

import { AdminVisitors } from "@/components/admin/admin-visitors";

export const metadata: Metadata = {
  title: "访客日志 · fuxiaochen",
  description: "使用模拟访问流观察访客地域、受访页面与终端信息。",
};

export default function VisitorsPage() {
  return <AdminVisitors />;
}

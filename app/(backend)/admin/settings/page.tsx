import type { Metadata } from "next";

import { AdminSettings } from "@/components/admin/admin-settings";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "系统设置 · 付小晨",
  description: "管理站点资料、备案、社交账号与访问统计配置。",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string | string[] }>;
}) {
  await requireAdmin();
  const { group } = await searchParams;
  return <AdminSettings initialGroup={group === "analytics" ? "analytics" : "profile"} />;
}

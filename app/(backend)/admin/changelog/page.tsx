import type { Metadata } from "next";

import { AdminChangelog } from "@/components/admin/admin-changelog";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "更新日志 · 付小晨",
  description: "记录版本迭代、搜索更新条目与保存更新日志。",
};

export default async function ChangelogPage() {
  await requireAdmin();
  return <AdminChangelog />;
}

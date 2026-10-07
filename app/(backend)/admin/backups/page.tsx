import type { Metadata } from "next";

import { AdminBackups } from "@/components/admin/admin-backups";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "备份管理 · fuxiaochen" };
export default async function BackupsPage() {
  await requireAdmin();
  return <AdminBackups />;
}

import type { Metadata } from "next";

import { AdminMedia } from "@/components/admin/admin-media";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "媒体库 · 付小晨",
  description: "管理图片与附件，预览图片并复制文件链接。",
};

export default async function MediaPage() {
  await requireAdmin();
  return <AdminMedia />;
}

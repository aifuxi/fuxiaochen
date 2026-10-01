import type { Metadata } from "next";

import { AdminMedia } from "@/components/admin/admin-media";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "媒体库 · fuxiaochen",
  description: "使用演示数据管理图片素材、预览本地图片与复制素材链接。",
};

export default async function MediaPage() {
  await requireAdmin();
  return <AdminMedia />;
}

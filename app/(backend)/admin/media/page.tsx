import type { Metadata } from "next";

import { AdminMedia } from "@/components/admin/admin-media";

export const metadata: Metadata = {
  title: "媒体库 · fuxiaochen",
  description: "使用演示数据管理图片素材、预览本地图片与复制素材链接。",
};

export default function MediaPage() {
  return <AdminMedia />;
}

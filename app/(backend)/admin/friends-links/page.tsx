import type { Metadata } from "next";

import { AdminFriendsLinks } from "@/components/admin/admin-friends-links";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "友情链接 · fuxiaochen",
  description: "管理友情链接、分类与审核状态。",
};

export default async function FriendsLinksPage() {
  await requireAdmin();
  return <AdminFriendsLinks />;
}

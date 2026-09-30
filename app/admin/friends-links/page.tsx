import type { Metadata } from "next";

import { AdminFriendsLinks } from "@/components/admin/admin-friends-links";

export const metadata: Metadata = {
  title: "友情链接 · fuxiaochen",
  description: "使用演示数据管理友情链接、分类与审核状态。",
};

export default function FriendsLinksPage() {
  return <AdminFriendsLinks />;
}

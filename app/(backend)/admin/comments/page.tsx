import type { Metadata } from "next";

import { AdminComments } from "@/components/admin/admin-comments";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "评论管理 · fuxiaochen",
  description: "使用演示数据审核读者留言、回复评论与管理垃圾评论。",
};

export default async function CommentsPage() {
  await requireAdmin();
  return <AdminComments />;
}

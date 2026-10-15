import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";

export default async function AdminPage() {
  await requireAdmin();
  // 保留旧后台地址，统一进入文章管理。
  redirect("/admin/posts");
}

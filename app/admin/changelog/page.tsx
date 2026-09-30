import type { Metadata } from "next";

import { AdminChangelog } from "@/components/admin/admin-changelog";

export const metadata: Metadata = {
  title: "更新日志 · fuxiaochen",
  description: "使用演示数据记录版本迭代、搜索更新条目与模拟发布。",
};

export default function ChangelogPage() {
  return <AdminChangelog />;
}

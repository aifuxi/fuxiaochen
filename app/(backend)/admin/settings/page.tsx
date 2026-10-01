import type { Metadata } from "next";

import { AdminSettings } from "@/components/admin/admin-settings";

export const metadata: Metadata = {
  title: "系统设置 · fuxiaochen",
  description: "使用演示数据管理站点资料、系统偏好与开发配置。",
};

export default function SettingsPage() {
  return <AdminSettings />;
}

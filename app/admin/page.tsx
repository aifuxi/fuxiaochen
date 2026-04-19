import type { Metadata } from "next";

import { AdminHome } from "@/components/admin/admin-home";

export const metadata: Metadata = {
  title: "Admin",
  description: "Internal admin landing page for navigating content resources.",
};

export default function AdminPage() {
  return <AdminHome />;
}

import type { Metadata } from "next";

import { AdminHome } from "@/components/admin/admin-home";

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Operations dashboard for content, taxonomy, and release admin workflows.",
};

export default function AdminPage() {
  return <AdminHome />;
}

import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return <AdminWorkspace>{children}</AdminWorkspace>;
}
import type { Metadata } from "next";

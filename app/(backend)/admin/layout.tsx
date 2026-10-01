import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return <AdminWorkspace>{children}</AdminWorkspace>;
}

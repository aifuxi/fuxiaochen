import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { AnalyticsQueryProvider } from "@/components/admin/analytics-query";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <AnalyticsQueryProvider>
      <AdminWorkspace>{children}</AdminWorkspace>
    </AnalyticsQueryProvider>
  );
}

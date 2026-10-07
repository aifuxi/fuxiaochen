import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { AnalyticsQueryProvider } from "@/components/admin/analytics-query";
import { NavigationGuardProvider } from "@/components/admin/navigation-guard";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <AnalyticsQueryProvider>
      <NavigationGuardProvider>
        <AdminWorkspace>{children}</AdminWorkspace>
      </NavigationGuardProvider>
    </AnalyticsQueryProvider>
  );
}
import type { Metadata } from "next";

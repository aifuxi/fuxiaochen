import { AdminLayout } from "@/components/admin/admin-layout";

import { requireServerSession } from "@/lib/auth-session";

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireServerSession();

  return <AdminLayout user={session.user}>{children}</AdminLayout>;
}

import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

import { requireServerSession } from "@/lib/auth-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireServerSession();

  return (
    <div className="bg-background min-h-screen">
      <AdminSidebar />
      <div className="ml-64">
        <AdminNavbar user={session.user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

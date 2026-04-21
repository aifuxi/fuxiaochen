import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <AdminSidebar />
      <div className="ml-64">
        <AdminNavbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

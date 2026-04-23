import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export type AdminLayoutProps = {
  children: React.ReactNode;
  user: {
    email: string;
    image?: string | null;
    name: string;
    role?: string | null;
  };
};

export function AdminLayout({ children, user }: AdminLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      <AdminSidebar role={user.role} />
      <div className="ml-64">
        <AdminNavbar user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-background">
      <AdminSidebar role={user.role} />
      <div className="lg:ml-64">
        <AdminNavbar user={user} />
        <main className="overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

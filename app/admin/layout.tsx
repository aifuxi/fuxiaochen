import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-foreground relative flex h-screen overflow-hidden bg-cyber-black">
      {/* Global Background Effects */}
      <div
        className={`
          pointer-events-none fixed inset-0 z-0 mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center
          opacity-20
        `}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-cyber-black/50" />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto scroll-smooth p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

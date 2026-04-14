import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <AdminSidebar
        user={{
          name: session.user.name,
          role: session.user.role ?? 2, // 2: normal (default)
          image: session.user.image,
        }}
      />

      <main className={`
        min-h-screen
        lg:pl-[calc(var(--sidebar-width)+1.5rem)]
      `}>
        <div className="container-shell py-6">
          <AdminHeader />
          <div className="min-h-[calc(100vh-10rem)]">{children}</div>
        </div>
      </main>
    </div>
  );
}

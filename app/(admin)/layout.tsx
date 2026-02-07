import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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
    <div className="flex min-h-screen bg-[var(--bg-color)] font-sans text-[var(--text-color)]">
      <AdminSidebar
        user={{
          name: session.user.name,
          role: session.user.role || "visitor",
          image: session.user.image,
        }}
      />

      {/* Main Content */}
      <main className="ml-64 flex-1 transition-all duration-300">
        <div className="p-8">
          <div className="min-h-[calc(100vh-8rem)]">{children}</div>
        </div>
      </main>
    </div>
  );
}

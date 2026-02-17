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
    <div className="flex min-h-screen bg-bg font-sans text-text">
      <AdminSidebar
        user={{
          name: session.user.name,
          role: session.user.role ?? 2, // 2: normal (default)
          image: session.user.image,
        }}
      />

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <div className="p-8">
          <div className="min-h-[calc(100vh-8rem)]">{children}</div>
        </div>
      </main>
    </div>
  );
}

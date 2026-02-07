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
        <header
          className={`
            sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--glass-border)]
            bg-[var(--glass-bg)] px-8 backdrop-blur-md
          `}
        >
          <h1 className="text-lg font-bold tracking-tight text-[var(--text-color)] uppercase">
            控制台
          </h1>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-medium text-[var(--accent-color)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-color)]" />
              系统在线
            </span>
          </div>
        </header>

        <div className="p-8">
          <div className="min-h-[calc(100vh-8rem)]">{children}</div>
        </div>
      </main>
    </div>
  );
}

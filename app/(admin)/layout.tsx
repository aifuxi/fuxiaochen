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
    <div className="flex min-h-screen bg-cyber-black font-mono text-gray-300">
      <AdminSidebar
        user={{
          name: session.user.name,
          role: session.user.role || "visitor",
          image: session.user.image,
        }}
      />

      {/* Main Content */}
      <main className="ml-64 flex-1">
        <header
          className={`
            sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neon-cyan/20 bg-black/80 px-8
            backdrop-blur-md
          `}
        >
          <h1 className="text-lg font-bold tracking-wider text-white uppercase">
            控制台
          </h1>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs text-neon-cyan">
              <span className="h-2 w-2 animate-pulse rounded-full bg-neon-cyan" />
              系统在线
            </span>
          </div>
        </header>

        <div className="p-8">
          <div
            className={`
              relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-md border border-white/5 bg-white/5 p-6
              backdrop-blur-sm
            `}
          >
            {/* Cyberpunk decoration lines */}
            <div className="absolute top-0 left-0 h-16 w-1 bg-gradient-to-b from-neon-cyan to-transparent" />
            <div className="absolute top-0 left-0 h-1 w-16 bg-gradient-to-r from-neon-cyan to-transparent" />
            <div className="absolute right-0 bottom-0 h-16 w-1 bg-gradient-to-t from-neon-purple to-transparent" />
            <div className="absolute right-0 bottom-0 h-1 w-16 bg-gradient-to-l from-neon-purple to-transparent" />

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

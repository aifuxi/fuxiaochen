import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  FolderTree,
  LayoutDashboard,
  Settings,
  Tag,
  Users,
} from "lucide-react";
import { WEBSITE } from "@/constants/info";
import { auth } from "@/lib/auth";
import { UserNav } from "./user-nav";

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

  const navItems = [
    { href: "/admin/dashboard", label: "仪表盘", icon: LayoutDashboard },
    { href: "/admin/categories", label: "分类管理", icon: FolderTree },
    { href: "/admin/tags", label: "标签管理", icon: Tag },
    { href: "/admin/blogs", label: "博客管理", icon: FileText },
    { href: "/admin/users", label: "用户管理", icon: Users },
    { href: "/admin/settings", label: "系统设置", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-cyber-black font-mono text-gray-300">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-neon-cyan/20 bg-black/90 backdrop-blur-xl">
        <div className="flex h-16 items-center border-b border-neon-cyan/20 px-6">
          <Link
            href="/"
            className="text-xl font-bold tracking-widest text-neon-cyan uppercase"
          >
            {WEBSITE}
            <span className="text-neon-purple">.ADMIN</span>
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300
                hover:bg-neon-cyan/10 hover:text-neon-cyan hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]
              `}
            >
              <item.icon
                className={`
                  h-5 w-5 transition-transform
                  group-hover:scale-110
                `}
              />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-neon-cyan/20 p-4">
          <UserNav
            user={{
              name: session.user.name,
              role: session.user.role || "visitor",
              image: session.user.image,
            }}
          />
        </div>
      </aside>

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
              relative min-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6
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

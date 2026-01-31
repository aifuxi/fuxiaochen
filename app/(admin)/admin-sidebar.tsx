"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderTree,
  LayoutDashboard,
  Tag,
  Users,
} from "lucide-react";
import { WEBSITE } from "@/constants/info";
import { UserNav } from "./user-nav";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/categories", label: "分类管理", icon: FolderTree },
  { href: "/admin/tags", label: "标签管理", icon: Tag },
  { href: "/admin/blogs", label: "博客管理", icon: FileText },
  { href: "/admin/users", label: "用户管理", icon: Users },
];

interface AdminSidebarProps {
  user: {
    name: string;
    role: string;
    image?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
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
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-neon-cyan/20 text-neon-cyan shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                    : `
                      text-gray-400
                      hover:bg-neon-cyan/10 hover:text-neon-cyan
                    `
                }
              `}
            >
              <item.icon
                className={`
                  h-5 w-5 transition-transform
                  ${isActive ? "scale-110" : "group-hover:scale-110"}
                `}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full border-t border-neon-cyan/20 p-4">
        <UserNav user={user} />
      </div>
    </aside>
  );
}

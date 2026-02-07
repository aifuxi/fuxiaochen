"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock9,
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
  { href: "/admin/changelogs", label: "更新日志", icon: Clock9 },
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
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl
      `}
    >
      <div className="flex h-16 items-center border-b border-[var(--glass-border)] px-6">
        <Link
          href="/"
          target="_blank"
          className="text-xl font-bold tracking-tight text-[var(--text-color)] uppercase"
        >
          <span className="text-[var(--accent-color)]">{WEBSITE}</span>
          后台管理
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
                group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-[var(--accent-color)]/10 text-[var(--accent-color)]"
                    : `
                      text-[var(--text-color-secondary)]
                      hover:bg-[var(--accent-color)]/5 hover:text-[var(--accent-color)]
                    `
                }
              `}
            >
              <item.icon
                className={`
                  h-5 w-5 transition-transform
                  ${isActive ? "scale-105" : "group-hover:scale-105"}
                `}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full border-t border-[var(--glass-border)] p-4">
        <UserNav user={user} />
      </div>
    </aside>
  );
}

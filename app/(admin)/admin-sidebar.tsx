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
import { cn } from "@/lib/utils";
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
    role: number; // 1: admin, 2: normal
    image?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface`}
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-text"
        >
          <img
            src="/images/logo.svg"
            alt="Logo"
            className="h-6 w-6"
          />
          <span className="text-accent">{WEBSITE}</span>
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
              className={cn(
                `
                  group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ease-apple
                `,
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : `
                    text-text-secondary
                    hover:bg-surface-hover hover:text-text
                  `,
              )}
            >
              <item.icon
                className={`
                  h-5 w-5 transition-transform
                  ${isActive ? "scale-100" : "group-hover:scale-105"}
                `}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full border-t border-border p-4">
        <UserNav user={user} />
      </div>
    </aside>
  );
}

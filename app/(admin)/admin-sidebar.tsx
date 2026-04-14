"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock9,
  FileText,
  FolderTree,
  LayoutDashboard,
  Plus,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEBSITE } from "@/constants/info";
import { cn } from "@/lib/utils";
import { UserNav } from "./user-nav";

const navGroups = [
  {
    title: "Main",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/blogs", label: "Articles", icon: FileText },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/tags", label: "Tags", icon: Tag },
    ],
  },
  {
    title: "Management",
    items: [
      { href: "/admin/changelogs", label: "Changelog", icon: Clock9 },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
];

interface AdminSidebarProps {
  user: {
    name: string;
    role: number;
    image?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-white/10 bg-black/65 px-5
      py-6 backdrop-blur-xl
      lg:flex
    `}>
      <div className="mb-8">
        <Link href="/" target="_blank" className="flex items-center gap-3">
          <div className={`
            flex size-11 items-center justify-center rounded-[1rem] bg-primary text-sm font-semibold
            text-primary-foreground
          `}>
            FC
          </div>
          <div>
            <div className="font-mono text-sm font-semibold text-foreground">
              {WEBSITE}
            </div>
            <div className="text-label text-[10px] text-primary">
              Chen Serif CMS
            </div>
          </div>
        </Link>
      </div>

      <div className="mb-6">
        <Link href="/admin/blogs/new">
          <Button variant="glow" className="w-full justify-center">
            <Plus className="size-4" />
            新建文章
          </Button>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="text-label mb-3 px-3 text-muted-foreground">
              {group.title}
            </div>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      `
                        group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm transition-all
                        duration-[var(--duration-normal)]
                      `,
                      isActive
                        ? "bg-primary/10 text-primary"
                        : `
                          text-muted-foreground
                          hover:bg-white/5 hover:text-foreground
                        `,
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-4.5 transition-transform duration-[var(--duration-fast)]",
                        isActive ? "scale-100" : "group-hover:scale-110",
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 border-t border-white/10 pt-5">
        <UserNav user={user} />
      </div>
    </aside>
  );
}

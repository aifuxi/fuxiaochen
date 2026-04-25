"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Settings,
  BarChart3,
  MessageSquare,
  Shield,
  History,
  Link2,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";

import { routes } from "@/constants/routes";

const getNavigation = (isAdmin: boolean) => [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: routes.admin.root, icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Posts", href: routes.admin.posts, icon: FileText },
      { name: "Categories", href: routes.admin.categories, icon: FolderOpen },
      { name: "Tags", href: routes.admin.tags, icon: Tags },
      { name: "Changelog", href: routes.admin.changelog, icon: History },
      { name: "Friends", href: routes.admin.friends, icon: Link2 },
    ],
  },
  {
    title: "Engagement",
    items: [
      { name: "Comments", href: routes.admin.comments, icon: MessageSquare },
    ],
  },
  {
    title: "System",
    items: [
      ...(isAdmin
        ? [{ name: "Users", href: routes.admin.users, icon: Shield }]
        : []),
      { name: "Settings", href: routes.admin.settings, icon: Settings },
    ],
  },
];

export function AdminSidebar({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const navigation = getNavigation(role === "admin");

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Link href={routes.admin.root} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">
              B
            </span>
          </div>
          <span className="font-semibold text-sidebar-foreground">
            Blog Admin
          </span>
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== routes.admin.root &&
                      pathname.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}

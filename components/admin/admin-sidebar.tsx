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
  Users,
  History,
  Link2,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Posts", href: "/admin/posts", icon: FileText },
      { name: "Categories", href: "/admin/categories", icon: FolderOpen },
      { name: "Tags", href: "/admin/tags", icon: Tags },
      { name: "Changelog", href: "/admin/changelog", icon: History },
      { name: "Friends", href: "/admin/friends", icon: Link2 },
    ],
  },
  {
    title: "Engagement",
    items: [
      { name: "Comments", href: "/admin/comments", icon: MessageSquare },
      { name: "Subscribers", href: "/admin/subscribers", icon: Users },
    ],
  },
  {
    title: "System",
    items: [{ name: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-sidebar-border bg-sidebar fixed top-0 left-0 z-40 h-screen w-64 border-r">
      <div className="border-sidebar-border flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-sidebar-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-sidebar-primary-foreground text-sm font-bold">
              B
            </span>
          </div>
          <span className="text-sidebar-foreground font-semibold">
            Blog Admin
          </span>
        </Link>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="text-muted-foreground mb-2 px-3 text-xs font-medium tracking-wider uppercase">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));
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

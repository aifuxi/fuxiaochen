"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Tags,
  Users,
  Settings,
  Plus,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    section: "Main",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/cms/dashboard",
      },
      {
        icon: FileText,
        label: "Articles",
        href: "/cms/articles",
      },
      { icon: Folder, label: "Categories", href: "/cms/categories" },
      { icon: Tags, label: "Tags", href: "/cms/tags" },
      { icon: ScrollText, label: "Changelog", href: "/cms/changelog" },
    ],
  },
  {
    section: "Management",
    items: [
      { icon: Users, label: "Users", href: "/cms/users" },
      { icon: Settings, label: "Settings", href: "/cms/settings" },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "fixed top-0 bottom-0 left-0 z-90 w-[260px] overflow-y-auto border-r border-border bg-background",
        className,
      )}
    >
      <div className="p-6">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="8" fill="#10b981" />
            <path
              d="M8 12L16 8L24 12V20L16 24L8 20V12Z"
              stroke="#050505"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M16 8V24" stroke="#050505" strokeWidth="2" />
            <path d="M8 12L24 20" stroke="#050505" strokeWidth="2" />
            <path d="M24 12L8 20" stroke="#050505" strokeWidth="2" />
          </svg>
          <h1 className="font-mono text-lg font-bold text-foreground">
            Super<span className="text-primary">Blog</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-6">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="mb-3 px-3 font-mono text-[11px] tracking-wider text-muted uppercase">
                {section.section}
              </div>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                      "border border-transparent",
                      isActive(item.href)
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : `
                          text-muted
                          hover:bg-secondary hover:text-foreground
                        `,
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isActive(item.href) ? "opacity-100" : "opacity-70",
                      )}
                    />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute right-0 bottom-0 left-0 border-t border-border p-6">
        <Button className="mb-4 w-full" size="default">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
        <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
          <div
            className={`
              flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold
              text-primary-foreground
            `}
          >
            SC
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">
              Sarah Chen
            </div>
            <div className="text-xs text-muted">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

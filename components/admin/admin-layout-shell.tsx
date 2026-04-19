"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/changelog", label: "Changelog" },
] as const;

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[100dvh] bg-canvas text-text-strong">
      <header className="ui-nav-shell">
        <div className="shell-page flex items-center justify-between gap-6 py-4">
          <div>
            <p className="ui-eyebrow">Admin</p>
            <p className="mt-1 text-sm text-text-soft">Content management</p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 md:gap-6">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "ui-nav-link",
                    active && "ui-nav-link-active text-brand",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

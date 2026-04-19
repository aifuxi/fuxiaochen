import Link from "next/link";

import {
  FolderTree,
  LayoutDashboard,
  NotebookPen,
  Tags,
  TextQuote,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { adminNavigation, isAdminNavigationActive } from "./admin-navigation";

const iconByHref = {
  "/admin": LayoutDashboard,
  "/admin/posts": NotebookPen,
  "/admin/categories": FolderTree,
  "/admin/tags": Tags,
  "/admin/changelog": TextQuote,
} as const;

export function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="ui-admin-sidebar">
      <div className="flex h-full flex-col gap-8 px-5 py-6 md:px-6">
        <div className="space-y-3 border-b border-white/6 pb-5">
          <p className="ui-eyebrow">Admin Console</p>
          <div className="space-y-2">
            <p className="text-base font-medium tracking-[-0.03em] text-text-strong">
              Structured content operations for the current site.
            </p>
            <p className="text-sm leading-6 text-text-soft">
              Shared navigation and shell chrome stay consistent while resource
              flows evolve in later tasks.
            </p>
          </div>
        </div>

        <nav
          aria-label="Admin navigation"
          className="flex flex-1 flex-col gap-6"
        >
          {adminNavigation.map((group) => (
            <section key={group.label} className="space-y-3">
              <p className="ui-meta">{group.label}</p>
              <div className="flex flex-col gap-1.5">
                {group.items.map((item) => {
                  const active = isAdminNavigationActive(pathname, item);
                  const Icon = iconByHref[item.href];

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "ui-admin-sidebar-link",
                        active && "ui-admin-sidebar-link-active",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-control border border-white/6 bg-black/15 text-text-soft transition-colors duration-300",
                          active &&
                            "border-brand/25 bg-brand/10 text-brand-soft",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium tracking-[-0.02em]">
                          {item.label}
                        </span>
                        <span className="mt-1 block truncate text-xs text-text-muted">
                          {item.title}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="rounded-panel border border-white/6 bg-black/10 px-4 py-4">
          <p className="ui-meta">Status</p>
          <p className="mt-3 text-sm leading-6 text-text-soft">
            Search and quick actions live in the toolbar so every admin route
            gets the same entry point.
          </p>
        </div>
      </div>
    </aside>
  );
}

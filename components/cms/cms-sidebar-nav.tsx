"use client";

import Link from "next/link";
import type { CmsNavGroup } from "@/lib/mocks/cms-content";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { cn } from "@/lib/utils";

type CmsSidebarNavProps = {
  currentPath: string;
  groups: CmsNavGroup[];
};

function isCurrentPath(currentPath: string, href: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function CmsSidebarNav({ currentPath, groups }: CmsSidebarNavProps) {
  return (
    <nav aria-label="CMS navigation" className="flex-1 overflow-y-auto px-4 py-5">
      {groups.map((group) => (
        <section key={group.label} className="mb-6">
          <div className="px-3 pb-2 font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
            {group.label}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isCurrent = isCurrentPath(currentPath, item.href);

              return (
                <Link
                  key={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  data-current={isCurrent ? "true" : undefined}
                  href={item.href}
                  className={cn(
                    `
                      group relative flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium
                      transition-all
                    `,
                    isCurrent
                      ? `
                        border-[color:var(--color-line-default)]
                        bg-[color:var(--color-surface-2)]
                        text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]
                      `
                      : `
                        border-transparent text-muted
                        hover:border-[color:var(--color-line-default)] hover:bg-[color:var(--color-surface-2)]
                        hover:text-foreground
                      `,
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                      isCurrent
                        ? `
                          border-[color:var(--color-line-default)]
                          bg-[color:var(--color-surface-1)]
                          text-primary
                        `
                        : `
                          border-[color:var(--color-line-subtle)]
                          bg-[color:var(--color-surface-1)]
                          text-muted
                          group-hover:text-foreground
                        `,
                    )}
                  >
                    <LucideIcon
                      className="size-4"
                      name={item.icon as Parameters<typeof LucideIcon>[0]["name"]}
                    />
                  </span>
                  <span className="min-w-0 flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

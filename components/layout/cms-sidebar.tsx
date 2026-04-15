"use client";

import { usePathname } from "next/navigation";
import { Layers2Icon } from "lucide-react";
import { CmsSidebarNav } from "@/components/cms/cms-sidebar-nav";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { cmsNavGroups } from "@/lib/mocks/cms-content";
import { cn } from "@/lib/utils";

function getUserInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type CmsSidebarProps = {
  user: {
    name: string;
    email: string;
  };
};

export function CmsSidebar({ user }: CmsSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        `
          flex h-screen w-[280px] shrink-0 flex-col border-r
          border-[color:var(--color-line-default)]
          bg-[color:var(--color-surface-1)]
        `,
      )}
    >
      <div className={`
        border-b
        border-[color:var(--color-line-default)]
        px-6 py-5
      `}>
        <div className="flex items-center gap-3 font-mono text-lg font-semibold text-foreground">
          <div className={`
            flex h-8 w-8 items-center justify-center rounded-xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-2)]
            text-primary
          `}>
            <Layers2Icon className="size-4" />
          </div>
          <span>
            Chen <span className="text-primary">Blog</span>
          </span>
        </div>
      </div>

      <CmsSidebarNav currentPath={pathname} groups={cmsNavGroups} />

      <div className={`
        border-t
        border-[color:var(--color-line-default)]
        p-4
      `}>
        <button
          className={`
            mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-2)]
            px-4 py-3 text-sm font-semibold text-foreground transition
            hover:border-primary/30 hover:text-primary
          `}
        >
          <LucideIcon className="size-4" name="plus" />
          新建文章
        </button>
        <div
          className={`
            flex items-center gap-3 rounded-2xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-2)]
            p-3
          `}
        >
          <div
            className={`
              flex h-10 w-10 items-center justify-center rounded-2xl border
              border-[color:var(--color-line-default)]
              bg-[color:var(--color-surface-1)]
              text-sm font-semibold text-primary
            `}
          >
            {getUserInitials(user.name)}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {user.name}
            </div>
            <div className="max-w-[180px] truncate text-xs text-muted">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

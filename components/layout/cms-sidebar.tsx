"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LucideIcon } from "@/components/ui/lucide-icon";
import { cn } from "@/lib/utils";
import { cmsNavGroups } from "@/lib/mocks/cms-content";

export function CmsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="cms-sidebar">
      <div className="border-b border-white/8 p-6">
        <div className="flex items-center gap-3 font-mono text-lg font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-black">SB</div>
          <span>
            Super<span className="text-primary">Blog</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {cmsNavGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-4 pb-2 font-mono text-xs tracking-[0.08em] text-muted uppercase">{group.label}</div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all",
                  pathname === item.href ? "bg-primary/10 text-primary" : `
                    text-muted
                    hover:bg-white/8 hover:text-foreground
                  `,
                )}
              >
                <LucideIcon className="size-4" name={item.icon as Parameters<typeof LucideIcon>[0]["name"]} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 p-4">
        <button className={`
          mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold
          text-black transition
          hover:bg-emerald-600
        `}>
          <LucideIcon className="size-4" name="plus" />
          New Article
        </button>
        <div className={`
          flex items-center gap-3 rounded-xl p-3
          hover:bg-white/6
        `}>
          <div className={`
            flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#10b981,#059669)] text-sm
            font-semibold text-black
          `}>SC</div>
          <div>
            <div className="text-sm font-semibold">Sarah Chen</div>
            <div className="text-xs text-muted">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

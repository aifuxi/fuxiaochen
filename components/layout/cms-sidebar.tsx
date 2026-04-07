"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "@/components/ui/lucide-icon";
import { cn } from "@/lib/utils";
import { cmsNavGroups } from "@/lib/mocks/cms-content";

export function CmsSidebar() {
  const pathname = usePathname();

  return (
    <aside className={`
      sticky top-6 hidden h-[calc(100vh-3rem)] w-[17rem] shrink-0 rounded-[2rem] border border-white/8 bg-black/28 p-5
      backdrop-blur-xl
      xl:flex xl:flex-col
    `}>
      <div className="mb-8 flex items-center gap-3">
        <div className={`
          flex size-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground
        `}>
          CS
        </div>
        <div>
          <div className="font-serif text-2xl tracking-[-0.05em]">Studio CMS</div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted uppercase">Editorial Desk</div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto pr-2">
        {cmsNavGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <div className="px-3 type-label">{group.label}</div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all",
                  pathname === item.href
                    ? "bg-primary/14 text-primary shadow-[inset_0_0_0_1px_rgba(16,185,129,0.18)]"
                    : `
                      text-muted
                      hover:bg-white/5 hover:text-foreground
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

      <div className="space-y-4 border-t border-white/8 pt-5">
        <Button className="w-full justify-center rounded-2xl" variant="primary">
          New Article
        </Button>
        <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
          <div className="text-sm font-medium">Fuxiaochen</div>
          <div className="mt-1 text-xs text-muted">Administrator</div>
        </div>
      </div>
    </aside>
  );
}

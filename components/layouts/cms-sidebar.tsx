import Link from "next/link";
import { BarChart3, FileText, Folder, LayoutDashboard, MessageSquare, Settings, Tags, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/cms/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cms/articles", label: "Articles", icon: FileText },
  { href: "/cms/categories", label: "Categories", icon: Folder },
  { href: "/cms/tags", label: "Tags", icon: Tags },
  { href: "/cms/comments", label: "Comments", icon: MessageSquare },
  { href: "/cms/users", label: "Users", icon: Users },
  { href: "/cms/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/cms/settings", label: "Settings", icon: Settings },
] as const;

export function CmsSidebar({ currentPath }: { currentPath: string }) {
  return (
    <aside className={`
      hidden w-[260px] flex-col border-r border-border bg-bg-elevated
      lg:flex
    `}>
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className={`
            flex size-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-fg
          `}>
            SB
          </div>
          <div>
            <div className="font-mono text-lg font-semibold">
              Super<span className="text-primary">Blog</span>
            </div>
            <div className="text-xs text-muted">content operations</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-6 px-4 py-5">
        <div>
          <div className="px-4 pb-2 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
            Main
          </div>
          <div className="space-y-1">
            {items.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : `
                        text-muted
                        hover:bg-surface hover:text-fg
                      `,
                  )}
                >
                  {active ? <span className={`
                    absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-sm bg-primary
                  `} /> : null}
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <div className="px-4 pb-2 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
            Management
          </div>
          <div className="space-y-1">
            {items.slice(5).map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : `
                        text-muted
                        hover:bg-surface hover:text-fg
                      `,
                  )}
                >
                  {active ? <span className={`
                    absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-sm bg-primary
                  `} /> : null}
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="border-t border-border px-4 py-5">
        <Button asChild className="mb-4 h-10 w-full justify-center rounded-md font-medium" size="sm">
          <Link href="/cms/articles/new">New Article</Link>
        </Button>
        <div className={`
          flex items-center gap-3 rounded-md px-3 py-3 transition-colors
          hover:bg-surface
        `}>
          <div className={`
            flex size-10 items-center justify-center rounded-full
            bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-h))] font-medium text-primary-fg
          `}>
            SC
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-fg">Sarah Chen</div>
            <div className="text-xs text-muted">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

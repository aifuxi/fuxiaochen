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
      hidden w-[280px] flex-col border-r border-border bg-bg-elevated
      lg:flex
    `}>
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className={`
            flex size-10 items-center justify-center rounded-xl bg-primary font-mono text-sm font-bold text-primary-fg
          `}>
            FC
          </div>
          <div>
            <div className="font-mono text-sm font-semibold">Chen CMS</div>
            <div className="text-xs text-muted">content operations</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-primary/12 text-primary"
                  : `
                    text-muted
                    hover:bg-surface hover:text-fg
                  `,
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-4 py-5">
        <Button asChild className="w-full justify-center" size="sm">
          <Link href="/cms/articles/new">New Article</Link>
        </Button>
      </div>
    </aside>
  );
}

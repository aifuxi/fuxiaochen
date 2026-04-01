import Link from "next/link";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function CmsHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className={`
        flex flex-col gap-5 px-6 py-5
        md:flex-row md:items-center md:justify-between
      `}>
        <div className="space-y-1">
          <div className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
            CMS Workspace
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-[-0.04em]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-muted">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className={`
            flex size-10 items-center justify-center rounded-md border border-border text-muted
            lg:hidden
          `}>
            <Menu className="size-4" />
          </button>
          <div className={`
            relative hidden min-w-72
            md:block
          `}>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input className="h-10 rounded-md border-border bg-surface pl-9" placeholder="Search..." />
          </div>
          <button type="button" className={`
            relative flex size-10 items-center justify-center rounded-md border border-border bg-surface text-muted
            transition-colors
            hover:border-border-h hover:text-fg
          `}>
            <Bell className="size-4" />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
          </button>
          <Link href="/" className={`
            hidden text-sm text-muted transition-colors
            hover:text-fg
            xl:inline-flex
          `}>
            View site
          </Link>
          <div className="flex items-center gap-3 rounded-full border border-border bg-surface/80 px-2.5 py-1.5">
            <Avatar className="size-9">
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div className={`
              hidden min-w-0
              xl:block
            `}>
              <div className="truncate text-sm font-medium text-fg">Sarah Chen</div>
              <div className="text-xs text-muted">Administrator</div>
            </div>
            <ChevronDown className="size-4 text-muted" />
          </div>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { Search } from "lucide-react";
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
          <h1 className="font-serif text-4xl font-semibold tracking-[-0.04em]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-7 text-muted">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className={`
            relative hidden min-w-72
            md:block
          `}>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input className="pl-9" placeholder="Search content, users, metrics..." />
          </div>
          <Link href="/" className={`
            text-sm text-muted transition-colors
            hover:text-fg
          `}>
            View site
          </Link>
          <Avatar>
            <AvatarFallback>FC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

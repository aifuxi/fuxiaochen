import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/changelog", label: "Changelog" },
  { href: "/friends", label: "Friends" },
  { href: "/design-system", label: "Design System" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/78 backdrop-blur-2xl">
      <div className="container-shell flex h-18 items-center justify-between gap-6">
        <Link
          href="/"
          className={`
            flex size-10 items-center justify-center rounded-xl bg-fg font-mono text-sm font-bold text-bg
            transition-transform duration-[var(--duration-slow)] ease-[var(--ease-smooth)]
            hover:rotate-[360deg]
          `}
        >
          FC
        </Link>
        <nav className={`
          hidden items-center gap-6
          lg:flex
        `}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                font-mono text-[11px] tracking-[0.22em] text-muted uppercase transition-colors
                hover:text-fg
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild className="rounded-full px-5" size="sm">
          <Link href="/cms/login">Open CMS</Link>
        </Button>
      </div>
    </header>
  );
}

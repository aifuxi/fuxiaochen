import Link from "next/link";

const footerLinks = [
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/friends", label: "Friends" },
  { href: "/design-system", label: "Design System" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80">
      <div className={`
        container-shell flex flex-col gap-6 py-12
        md:flex-row md:items-center md:justify-between
      `}>
        <div className="space-y-2">
          <div className="font-serif text-2xl font-semibold tracking-[-0.03em]">
            Chen Serif System
          </div>
          <p className="max-w-md text-sm leading-7 text-muted">
            Public site, design system and CMS scaffold aligned around one token
            language.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {footerLinks.map((item) => (
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
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

import { secondaryNavItems } from "@/lib/mocks/site-content";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/8 py-10">
      <div className={`
        shell-container flex flex-col gap-6
        md:flex-row md:items-end md:justify-between
      `}>
        <div className="space-y-2">
          <div className="type-label">Chen Serif</div>
          <p className="max-w-xl text-sm leading-6 text-muted">
            A content-first product system where public editorial pages and the management console speak the same visual
            language.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {secondaryNavItems.map((item) => (
            <Link key={item.href} className={`
              font-mono text-[11px] tracking-[0.28em] text-muted uppercase
              hover:text-foreground
            `} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

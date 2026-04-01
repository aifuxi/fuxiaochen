import Link from "next/link";
import { siteMoreNavItems, siteNavItems } from "@/lib/mock/design-content";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10">
      <div className={`
        container-shell grid gap-10 py-14
        md:grid-cols-[1.1fr_0.9fr]
      `}>
        <div className="space-y-4">
          <div className="font-serif text-[2rem] font-semibold tracking-[-0.04em]">
            Alex Chen
          </div>
          <p className="max-w-xl text-sm leading-8 text-muted">
            深色 editorial 站点、设计系统文档和内容运营后台共享一套 token
            语言，但保持各自的节奏、密度与氛围。
          </p>
        </div>
        <div className={`
          grid gap-8
          sm:grid-cols-2
        `}>
          <div className="space-y-4">
            <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
              Navigation
            </div>
            <div className="flex flex-col gap-3">
              {siteNavItems.map((item) => (
                <Link key={item.href} href={item.href} className={`
                  text-sm text-muted transition-colors
                  hover:text-fg
                `}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="font-mono text-[11px] tracking-[0.24em] text-muted uppercase">
              More
            </div>
            <div className="flex flex-col gap-3">
              {siteMoreNavItems.map((item) => (
                <Link key={item.href} href={item.href} className={`
                  text-sm text-muted transition-colors
                  hover:text-fg
                `}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={`
        container-shell flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-muted
        md:flex-row md:items-center md:justify-between
      `}>
        <span>© 2026 Alex Chen. Thoughts, tools and quiet systems.</span>
        <span className="font-mono tracking-[0.18em] uppercase">Built with Next.js 16</span>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { href: "/", label: "首页" },
  { href: "/articles", label: "文章" },
  { href: "/projects", label: "项目" },
  { href: "/about", label: "关于" },
];

const secondaryNavItems = [
  { href: "/changelog", label: "更新日志" },
  { href: "/friends", label: "友链" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <nav
      className={cn(
        "navbar fixed inset-x-0 top-0 z-50 border-b border-transparent",
        scrolled && "scrolled",
      )}
    >
      <div className="site-frame flex h-20 items-center justify-between gap-4">
        <Link className="flex items-baseline gap-3" href="/">
          <span className="font-serif text-2xl tracking-[-0.05em] text-foreground">Alex Chen</span>
          <span className="font-mono-tech text-[11px] tracking-[0.24em] text-muted uppercase">Journal</span>
        </Link>

        <div className={`
          hidden items-center gap-8
          md:flex
        `}>
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-link font-mono-tech text-xs tracking-widest uppercase transition-colors duration-300",
                pathname === item.href ? "active text-foreground" : `
                  text-muted
                  hover:text-foreground
                `,
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="relative">
            <button
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              className={cn(
                `
                  nav-link font-mono-tech flex items-center gap-1 text-xs tracking-widest uppercase transition-colors
                  duration-300
                `,
                moreOpen ? "text-foreground" : `
                  text-muted
                  hover:text-foreground
                `,
              )}
              type="button"
              onClick={() => setMoreOpen((current) => !current)}
            >
              更多
              <span className="text-[10px]">⌄</span>
            </button>
            <div
              className={cn(
                `
                  absolute top-full left-0 mt-3 w-48 rounded-[1.25rem] border border-white/10
                  bg-[color:var(--color-surface-2)]
                  py-2 transition-all duration-300
                `,
                moreOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0",
              )}
            >
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  className={cn(
                    `
                      font-mono-tech block px-4 py-2 text-xs transition-colors
                      hover:bg-white/5
                    `,
                    pathname === item.href ? "text-primary-accent" : `
                      text-muted
                      hover:text-foreground
                    `,
                  )}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            "font-mono-tech text-[11px] tracking-[0.18em] uppercase",
          )}
          href="/cms/dashboard"
        >
          开始使用
        </Link>

        <button
          aria-expanded={mobileOpen}
          className={cn(
            buttonVariants({ size: "sm", variant: "outline" }),
            `
              font-mono-tech text-[11px] tracking-[0.18em] uppercase
              md:hidden
            `,
          )}
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
        >
          导航
        </button>
      </div>

      <div
        className={cn(
          `
            border-t border-white/8
            bg-[color:var(--color-surface-2)]
            md:hidden
          `,
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="site-frame grid gap-2 py-4">
          {allNavItems.map((item) => (
            <Link
              key={item.href}
              className={cn(
                "rounded-2xl border border-transparent px-4 py-3 text-sm transition-colors",
                pathname === item.href ? "border-white/10 bg-white/6 text-foreground" : `
                  text-muted
                  hover:bg-white/4 hover:text-foreground
                `,
              )}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className={cn(
              buttonVariants({ size: "default", variant: "outline" }),
              "font-mono-tech mt-2 w-full text-[11px] tracking-[0.18em] uppercase",
            )}
            href="/cms/dashboard"
            onClick={() => setMobileOpen(false)}
          >
            开始使用
          </Link>
        </div>
      </div>
    </nav>
  );
}

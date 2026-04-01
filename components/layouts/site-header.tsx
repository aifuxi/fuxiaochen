"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { siteMoreNavItems, siteNavItems } from "@/lib/mock/design-content";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        `fixed top-0 right-0 left-0 z-50 transition-all duration-[400ms] ease-[var(--ease-smooth)]`,
        isScrolled
          ? "bg-black/80 py-2 backdrop-blur-xl"
          : "bg-[rgb(5_5_5_/_0.6)] py-4 backdrop-blur-lg",
      )}
    >
      <div className="container-shell flex items-center justify-between gap-6">
        <Link
          href="/"
          className={`
            flex size-10 items-center justify-center rounded-xl bg-white font-mono text-sm font-bold text-black
            transition-transform duration-[600ms] ease-[var(--ease-smooth)]
            hover:rotate-[360deg]
          `}
        >
          AC
        </Link>

        <nav className={`
          hidden items-center gap-8
          md:flex
        `}>
          {siteNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  `
                    relative font-mono text-xs tracking-[0.24em] uppercase transition-colors
                    after:absolute after:-bottom-1 after:left-1/2 after:h-px after:w-0 after:-translate-x-1/2
                    after:bg-primary after:transition-all after:duration-300
                  `,
                  active
                    ? `
                      text-fg
                      after:w-full
                    `
                    : `
                      text-muted
                      hover:text-fg hover:after:w-full
                    `,
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="group relative">
            <button
              type="button"
              className={`
                flex items-center gap-1 font-mono text-xs tracking-[0.24em] text-muted uppercase transition-colors
                hover:text-fg
              `}
            >
              More
              <ChevronDown className="size-3" />
            </button>
            <div
              className={`
                invisible absolute top-full left-0 mt-3 w-48 translate-y-2 rounded-xl border border-white/10 bg-black/90
                py-2 opacity-0 backdrop-blur-xl transition-all duration-300
                group-hover:visible group-hover:translate-y-0 group-hover:opacity-100
              `}
            >
              {siteMoreNavItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      `
                        block px-4 py-2 font-mono text-xs tracking-[0.16em] transition-colors
                        hover:bg-white/5 hover:text-fg
                      `,
                      active ? "text-primary" : "text-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <Button asChild className="rounded-full px-6 font-mono text-xs tracking-[0.16em] uppercase" size="sm">
          <Link href="/cms/login">Get Started</Link>
        </Button>
      </div>
    </header>
  );
}

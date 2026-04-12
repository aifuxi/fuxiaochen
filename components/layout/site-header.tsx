"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={cn("navbar fixed top-0 right-0 left-0 z-50 px-8 py-4", scrolled && "scrolled")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link className="logo flex h-10 w-10 items-center justify-center rounded-xl bg-white" href="/">
          <span className="font-mono-tech text-sm font-bold text-black">AC</span>
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
          <div className="group relative">
            <div className={`
              nav-link font-mono-tech flex items-center gap-1 text-xs tracking-widest text-muted uppercase
              transition-colors duration-300
              hover:text-foreground
            `}>
              更多
              <span className="text-[10px]">⌄</span>
            </div>
            <div className={`
              invisible absolute top-full left-0 mt-2 w-48 translate-y-2 rounded-xl border border-white/10 bg-black/90
              py-2 opacity-0 transition-all duration-300
              group-hover:visible group-hover:translate-y-0 group-hover:opacity-100
            `}>
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
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link className="btn-primary-glow font-mono-tech rounded-full px-6 py-2 text-xs tracking-wider uppercase" href="/cms/dashboard">
          开始使用
        </Link>
      </div>
    </nav>
  );
}

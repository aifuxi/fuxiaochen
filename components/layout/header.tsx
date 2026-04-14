"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "文章" },
  { href: "/about", label: "关于" },
];

const moreNavItems = [
  { href: "/changelog", label: "更新日志" },
  { href: "/ui-preview", label: "设计系统" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        `
          fixed inset-x-0 top-0 z-50 border-b border-transparent transition-all duration-[var(--duration-slow)]
          ease-[var(--ease-smooth)]
        `,
        isScrolled
          ? "border-white/10 bg-black/70 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav
        className={cn(
          `
            container-shell flex items-center justify-between transition-[height,padding]
            duration-[var(--duration-slow)] ease-[var(--ease-smooth)]
          `,
          isScrolled ? "h-16" : "h-[var(--header-height)]",
        )}
      >
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="返回首页"
        >
          <div className={`
            flex size-10 items-center justify-center rounded-[1rem] bg-foreground text-sm font-semibold text-background
            transition-transform duration-[var(--duration-slower)]
            group-hover:rotate-[360deg]
          `}>
            FC
          </div>
          <div className={`
            hidden
            sm:block
          `}>
            <div className="font-serif text-lg font-semibold text-foreground">
              付小晨
            </div>
            <div className="text-label text-[10px] text-muted-foreground">
              Chen Serif System
            </div>
          </div>
        </Link>

        <div className={`
          hidden items-center gap-8
          md:flex
        `}>
          {primaryNavItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  `
                    text-label relative py-2 text-muted-foreground transition-colors duration-[var(--duration-fast)]
                    hover:text-foreground
                  `,
                  isActive && "text-foreground",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    `
                      absolute inset-x-0 -bottom-1 h-px origin-center scale-x-0 bg-primary transition-transform
                      duration-[var(--duration-normal)]
                    `,
                    (isActive || pathname.startsWith(item.href)) &&
                      "scale-x-100",
                  )}
                />
              </Link>
            );
          })}

          <div className="group relative">
            <button
              type="button"
              className={cn(
                `
                  text-label flex items-center gap-1 py-2 text-muted-foreground transition-colors
                  duration-[var(--duration-fast)]
                  hover:text-foreground
                `,
                moreNavItems.some((item) => pathname === item.href) &&
                  "text-foreground",
              )}
            >
              更多
              <ChevronDown className="size-3" />
            </button>

            <div className={`
              pointer-events-none absolute top-full left-1/2 mt-3 w-44 -translate-x-1/2 rounded-md border
              border-white/10 bg-popover p-2 opacity-0 shadow-lg transition-all duration-[var(--duration-normal)]
              group-hover:pointer-events-auto group-hover:translate-y-1 group-hover:opacity-100
            `}>
              {moreNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    `
                      block rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors
                      duration-[var(--duration-fast)]
                      hover:bg-white/5 hover:text-foreground
                    `,
                    pathname === item.href && "bg-primary/10 text-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin" className={`
            hidden
            md:block
          `}>
            <span className={`
              inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 text-sm
              text-foreground transition-all duration-[var(--duration-normal)]
              hover:border-primary/40 hover:bg-primary/10 hover:text-primary
            `}>
              <LayoutDashboard className="size-4" />
              进入后台
            </span>
          </Link>

          <button
            type="button"
            aria-label="切换菜单"
            className={`
              inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/4
              text-foreground
              md:hidden
            `}
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          `
            overflow-hidden border-t border-white/10 bg-black/80 backdrop-blur-xl transition-all
            duration-[var(--duration-slow)]
            md:hidden
          `,
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="container-shell flex flex-col gap-2 py-4">
          {[...primaryNavItems, ...moreNavItems].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                `
                  rounded-md px-4 py-3 text-sm text-muted-foreground transition-colors duration-[var(--duration-fast)]
                  hover:bg-white/5 hover:text-foreground
                `,
                pathname === item.href && "bg-primary/10 text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={`
              mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium
              text-primary-foreground
            `}
          >
            <LayoutDashboard className="size-4" />
            进入后台
          </Link>
        </div>
      </div>
    </header>
  );
}

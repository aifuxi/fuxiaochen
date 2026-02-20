"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
  { href: "/changelog", label: "更新日志" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`
        bg-bg-color/80 sticky top-0 z-50 w-full border-b border-border/50 backdrop-blur-xl
        supports-[backdrop-filter]:bg-bg-color/60
      `}
    >
      {/* 装饰性顶部渐变线 */}
      <div
        className={`
          pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30
          to-transparent
        `}
      />

      <nav className={`
        mx-auto flex h-16 max-w-6xl items-center justify-between px-4
        md:px-6
      `}>
        {/* Logo */}
        <Link
          href="/"
          className={`
            group flex items-center gap-2 text-xl font-bold tracking-tight text-text transition-opacity duration-200
            hover:opacity-80
          `}
        >
          <div
            className={`
              flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-info text-sm
              text-white transition-transform duration-300
              group-hover:scale-105
            `}
          >
            付
          </div>
          <span className={`
            hidden
            sm:block
          `}>傅小晨</span>
        </Link>

        {/* 桌面端导航 */}
        <div className={`
          hidden items-center gap-1
          md:flex
        `}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  `relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200`,
                  isActive
                    ? "text-accent"
                    : `
                      text-text-secondary
                      hover:text-text
                    `
                )}
              >
                {item.label}
                {isActive && (
                  <span
                    className={`absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-accent`}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* 右侧：主题切换 + 移动端菜单 */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`
              flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors duration-200
              hover:bg-surface hover:text-text
              md:hidden
            `}
            aria-label="切换菜单"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* 移动端菜单 */}
      <div
        className={cn(
          `
            overflow-hidden border-t border-border/50 bg-surface/95 backdrop-blur-xl transition-all duration-300
            ease-apple
            md:hidden
          `,
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    `rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200`,
                    isActive
                      ? "bg-accent/10 text-accent"
                      : `
                        text-text-secondary
                        hover:bg-surface-hover hover:text-text
                      `
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

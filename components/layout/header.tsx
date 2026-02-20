"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
  { href: "/changelog", label: "更新日志" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[var(--bg-color)]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 左侧：Logo */}
        <Link
          href="/"
          className={`
            text-lg font-semibold text-text transition-colors
            hover:text-accent
          `}
        >
          傅小晨
        </Link>

        {/* 中间：导航链接 */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-surface text-text"
                    : `
                      text-text-secondary
                      hover:bg-surface-hover hover:text-text
                    `,
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* 右侧：主题切换 */}
        <ThemeToggle />
      </nav>
    </header>
  );
}

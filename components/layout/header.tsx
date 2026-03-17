"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
  { href: "/changelog", label: "更新日志" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 flex h-[60px] items-center transition-all duration-300"
      style={
        scrolled
          ? {
              background: "var(--nav-blur-bg)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--border-subtle)",
            }
          : {}
      }
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.9rem",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
            textDecoration: "none",
          }}
        >
          <span>付小晨</span>
          <span className="logo-dot" />
        </Link>

        {/* Desktop Nav */}
        <nav className={`
          hidden items-center gap-6
          md:flex
        `}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-[0.85rem] font-normal transition-colors"
                style={{
                  color: isActive
                    ? "var(--foreground)"
                    : "var(--foreground-muted)",
                }}
              >
                {item.label}
                {isActive && (
                  <div
                    className="absolute -bottom-[20px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                    style={{
                      background: "var(--primary)",
                      boxShadow: "0 0 8px var(--primary)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`
              hidden rounded-[0.5rem] px-4 py-1.5 text-[0.85rem] font-medium transition-all
              hover:border-[var(--border-hover)]
              sm:flex
            `}
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground-muted)",
            }}
          >
            登录
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

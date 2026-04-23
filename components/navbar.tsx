"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

import { routes } from "@/constants/routes";

const navLinks = [
  { href: routes.site.home, label: "Home" },
  { href: routes.site.about, label: "About" },
  { href: routes.site.blog, label: "Blog" },
  { href: routes.site.projects, label: "Projects" },
];

export function Navbar() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link
          href={routes.site.home}
          className="text-foreground hover:text-foreground/80 text-lg font-semibold tracking-tight transition-colors"
        >
          Fuxiaochen
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

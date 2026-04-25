"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

import { routes } from "@/constants/routes";
import { siteNavLinks } from "@/constants/site-copy";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link
          href={routes.site.home}
          className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80"
        >
          Fuxiaochen
        </Link>

        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {siteNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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

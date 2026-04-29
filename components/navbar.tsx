"use client";

import Link from "next/link";

import { MobileSiteNav } from "@/components/site/mobile-site-nav";
import { ThemeToggle } from "@/components/theme-toggle";

import type { SiteSettings } from "@/lib/settings/types";

import { routes } from "@/constants/routes";
import { siteNavLinks } from "@/constants/site-copy";

type NavbarProps = {
  settings: SiteSettings;
};

export function Navbar({ settings }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link
          href={routes.site.home}
          className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80"
        >
          {settings.general.siteName}
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
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
          <MobileSiteNav />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

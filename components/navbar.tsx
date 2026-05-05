"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileSiteNav } from "@/components/site/mobile-site-nav";
import { ThemeToggle } from "@/components/theme-toggle";

import type { SiteSettings } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

import { routes } from "@/constants/routes";
import { siteNavLinks } from "@/constants/site-copy";

type NavbarProps = {
  settings: SiteSettings;
};

export function Navbar({ settings }: NavbarProps) {
  const pathname = usePathname();
  const isBlogPostPage = pathname.startsWith(`${routes.site.blog}/`);

  return (
    <header
      className={cn(
        "top-0 z-50 w-full",
        isBlogPostPage
          ? "absolute bg-transparent"
          : "sticky border-b border-border bg-background/80 backdrop-blur-sm",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
        <Link
          href={routes.site.home}
          className={cn(
            "text-lg font-semibold tracking-tight transition-colors",
            isBlogPostPage
              ? "text-white drop-shadow-sm hover:text-white/85"
              : "text-foreground hover:text-foreground/80",
          )}
        >
          {settings.general.siteName}
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {siteNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm transition-colors",
                    isBlogPostPage
                      ? "text-white/80 drop-shadow-sm hover:text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <MobileSiteNav
            triggerClassName={
              isBlogPostPage
                ? "text-white hover:bg-white/10 hover:text-white"
                : undefined
            }
          />
          <ThemeToggle
            className={
              isBlogPostPage
                ? "border-white/25 bg-black/20 text-white hover:bg-black/30 hover:text-white"
                : undefined
            }
          />
        </div>
      </nav>
    </header>
  );
}

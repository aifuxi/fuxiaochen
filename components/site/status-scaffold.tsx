import Link from "next/link";

import { Github, Mail, Twitter } from "lucide-react";

import { MobileSiteNav } from "@/components/site/mobile-site-nav";
import { ThemeToggle } from "@/components/theme-toggle";

import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
} from "@/constants/info";
import { routes } from "@/constants/routes";
import { siteCopy, siteNavLinks } from "@/constants/site-copy";

type StatusScaffoldProps = {
  children: React.ReactNode;
};

const socialLinks = [
  { href: "https://github.com", label: "GitHub", icon: Github },
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "mailto:hello@example.com", label: "邮箱", icon: Mail },
];

export function StatusScaffold({ children }: StatusScaffoldProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link
            href={routes.site.home}
            className="text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-foreground/80"
          >
            Fuxiaochen
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

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Fuxiaochen</p>
            <p className="text-sm text-muted-foreground">
              {siteCopy.footer.description}
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <link.icon className="size-4" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Fuxiaochen</span>
              <Link
                href={BEI_AN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {BEI_AN_NUMBER}
              </Link>
              <Link
                href={GONG_AN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {GONG_AN_NUMBER}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

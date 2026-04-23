import Link from "next/link";

import { Github, Mail, Twitter } from "lucide-react";

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
    <div className="bg-background text-foreground flex min-h-screen flex-col">
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
              {siteNavLinks.map((link) => (
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

      <main className="flex-1">{children}</main>

      <footer className="border-border bg-background border-t">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">Fuxiaochen</p>
            <p className="text-muted-foreground text-sm">
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
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <link.icon className="size-4" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span>© {new Date().getFullYear()} Fuxiaochen</span>
              <Link
                href={BEI_AN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {BEI_AN_NUMBER}
              </Link>
              <Link
                href={GONG_AN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
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

import Link from "next/link";

import { Github, Twitter, Mail } from "lucide-react";

import {
  BEI_AN_LINK,
  BEI_AN_NUMBER,
  GONG_AN_LINK,
  GONG_AN_NUMBER,
} from "@/constants/info";
import { routes } from "@/constants/routes";
import { siteCopy, siteNavLinks } from "@/constants/site-copy";

const footerLinks = {
  main: siteNavLinks,
  social: [
    { href: "https://github.com", label: "GitHub", icon: Github },
    { href: "https://twitter.com", label: "Twitter", icon: Twitter },
    { href: "mailto:hello@example.com", label: "邮箱", icon: Mail },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Link
              href={routes.site.home}
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Fuxiaochen
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {siteCopy.footer.description}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-foreground">
              {siteCopy.footer.linksTitle}
            </span>
            <ul className="flex flex-col gap-2">
              {footerLinks.main.map((link) => (
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
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-foreground">
              {siteCopy.footer.connectTitle}
            </span>
            <div className="flex items-center gap-3">
              {footerLinks.social.map((link) => (
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
                  <link.icon className="size-5" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Fuxiaochen.{" "}
              {siteCopy.footer.copyright}
            </p>
            <p className="text-sm text-muted-foreground">
              {siteCopy.footer.builtWith}
            </p>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 text-center md:flex-row md:flex-wrap md:justify-center md:gap-x-4 md:gap-y-2">
            <Link
              href={BEI_AN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {BEI_AN_NUMBER}
            </Link>
            <Link
              href={GONG_AN_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {GONG_AN_NUMBER}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

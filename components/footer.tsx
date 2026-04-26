import Link from "next/link";

import { Github, Twitter, Mail } from "lucide-react";

import type { SiteSettings } from "@/lib/settings/types";

import { routes } from "@/constants/routes";
import { siteCopy, siteNavLinks } from "@/constants/site-copy";

type FooterProps = {
  settings: SiteSettings;
};

export function Footer({ settings }: FooterProps) {
  const socialLinks = [
    { href: settings.social.githubUrl, label: "GitHub", icon: Github },
    { href: settings.social.twitterUrl, label: "Twitter", icon: Twitter },
    { href: `mailto:${settings.general.email}`, label: "邮箱", icon: Mail },
  ].filter((link) => link.href.length > 0);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Link
              href={routes.site.home}
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              {settings.general.siteName}
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {settings.general.siteDescription}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-foreground">
              {siteCopy.footer.linksTitle}
            </span>
            <ul className="flex flex-col gap-2">
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
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium text-foreground">
              {siteCopy.footer.connectTitle}
            </span>
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
              © {new Date().getFullYear()} {settings.general.siteName}.{" "}
              {siteCopy.footer.copyright}
            </p>
            <p className="text-sm text-muted-foreground">
              {siteCopy.footer.builtWith}
            </p>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 text-center md:flex-row md:flex-wrap md:justify-center md:gap-x-4 md:gap-y-2">
            {settings.compliance.icpNumber && settings.compliance.icpLink && (
              <Link
                href={settings.compliance.icpLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {settings.compliance.icpNumber}
              </Link>
            )}
            {settings.compliance.policeNumber &&
              settings.compliance.policeLink && (
                <Link
                  href={settings.compliance.policeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {settings.compliance.policeNumber}
                </Link>
              )}
          </div>
        </div>
      </div>
    </footer>
  );
}

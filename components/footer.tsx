import Link from "next/link";

import { Github, Twitter, Mail } from "lucide-react";

const footerLinks = {
  main: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/projects", label: "Projects" },
  ],
  social: [
    { href: "https://github.com", label: "GitHub", icon: Github },
    { href: "https://twitter.com", label: "Twitter", icon: Twitter },
    { href: "mailto:hello@example.com", label: "Email", icon: Mail },
  ],
};

export function Footer() {
  return (
    <footer className="border-border bg-background border-t">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-foreground text-lg font-semibold tracking-tight"
            >
              Fuxiaochen
            </Link>
            <p className="text-muted-foreground max-w-xs text-sm">
              Building digital experiences with code and creativity.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-foreground text-sm font-medium">Links</span>
            <ul className="flex flex-col gap-2">
              {footerLinks.main.map((link) => (
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
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-foreground text-sm font-medium">Connect</span>
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
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <link.icon className="size-5" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            {new Date().getFullYear()} Fuxiaochen. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Built with Next.js and Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}

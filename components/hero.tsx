import Link from "next/link";

import { ArrowRight, Github, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { SiteSettings } from "@/lib/settings/types";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

type HeroProps = {
  settings: SiteSettings;
};

export function Hero({ settings }: HeroProps) {
  const socialLinks = [
    { href: settings.social.githubUrl, label: "GitHub", icon: Github },
    { href: settings.social.twitterUrl, label: "Twitter", icon: Twitter },
  ].filter((link) => link.href.length > 0);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl lg:text-6xl">
            {settings.profile.heroTitle}
          </h1>
          <p className="text-lg text-primary md:text-xl">
            {settings.profile.heroRole}
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {settings.profile.heroSummary}
          </p>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {settings.profile.heroDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button asChild>
              <Link href={routes.site.blog}>
                {siteCopy.hero.primaryCta}
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={routes.site.about}>{siteCopy.hero.secondaryCta}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 pt-2">
            {socialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <link.icon className="size-5" />
                <span className="sr-only">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

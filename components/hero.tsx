import Link from "next/link";

import { ArrowRight, Github, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-foreground text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Fuxiaochen
          </h1>
          <p className="text-primary text-lg md:text-xl">
            {siteCopy.hero.role}
          </p>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed md:text-lg">
            {siteCopy.hero.summary}
          </p>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            {siteCopy.hero.description}
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
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="size-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="size-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

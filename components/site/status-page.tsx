import type { ReactNode } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

import { SiteStatusIllustration } from "./status-illustration";

type SiteStatusPageProps = {
  code: "404" | "500";
  eyebrow: string;
  title: string;
  description: string;
  actions: ReactNode;
};

export function SiteStatusPage({
  code,
  eyebrow,
  title,
  description,
  actions,
}: SiteStatusPageProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="bg-muted/70 absolute top-8 right-[8%] h-40 w-40 rounded-full blur-3xl" />
        <div className="bg-muted absolute bottom-10 left-[6%] h-48 w-48 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:min-h-[calc(100dvh-9rem)] md:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] md:items-center md:py-20">
        <div className="order-2 flex flex-col gap-6 md:order-1">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 font-mono text-xs"
            >
              HTTP {code}
            </Badge>
            <span className="text-muted-foreground text-sm">{eyebrow}</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-[62ch] text-base leading-relaxed md:text-lg">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">{actions}</div>

          <div className="border-border bg-card/70 flex flex-wrap items-center gap-3 rounded-[1.5rem] border px-5 py-4 shadow-sm">
            <span className="text-foreground text-sm font-medium">
              {siteCopy.errors.linksLabel}
            </span>
            <div className="flex flex-wrap gap-2">
              <Link href={routes.site.home}>
                <Badge
                  variant="secondary"
                  className="hover:bg-accent cursor-pointer rounded-full transition-colors"
                >
                  首页
                </Badge>
              </Link>
              <Link href={routes.site.blog}>
                <Badge
                  variant="secondary"
                  className="hover:bg-accent cursor-pointer rounded-full transition-colors"
                >
                  博客
                </Badge>
              </Link>
              <Link href={routes.site.projects}>
                <Badge
                  variant="secondary"
                  className="hover:bg-accent cursor-pointer rounded-full transition-colors"
                >
                  项目
                </Badge>
              </Link>
              <Link href={routes.site.about}>
                <Badge
                  variant="secondary"
                  className="hover:bg-accent cursor-pointer rounded-full transition-colors"
                >
                  关于
                </Badge>
              </Link>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="border-border bg-card/80 rounded-[2rem] border p-4 shadow-xl shadow-black/5 dark:shadow-black/30">
            <SiteStatusIllustration code={code} title={title} />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";

import { ArrowRight, House, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

import { SiteStatusPage } from "./status-page";

type SiteErrorStatusProps = {
  reset: () => void;
};

export function SiteErrorStatus({ reset }: SiteErrorStatusProps) {
  return (
    <SiteStatusPage
      code="500"
      eyebrow={siteCopy.errors.internal.eyebrow}
      title={siteCopy.errors.internal.title}
      description={siteCopy.errors.internal.description}
      actions={
        <>
          <Button size="lg" onClick={() => reset()}>
            <RotateCcw />
            {siteCopy.errors.internal.primaryAction}
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href={routes.site.home}>
              <House />
              {siteCopy.errors.internal.secondaryAction}
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href={routes.site.blog}>
              <ArrowRight />
              {siteCopy.errors.internal.tertiaryAction}
            </Link>
          </Button>
        </>
      }
    />
  );
}

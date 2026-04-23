"use client";

import Link from "next/link";

import { ArrowRight, House, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SiteStatusPage } from "@/components/site/status-page";
import { StatusScaffold } from "@/components/site/status-scaffold";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <StatusScaffold>
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
    </StatusScaffold>
  );
}

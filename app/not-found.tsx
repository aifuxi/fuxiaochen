import Link from "next/link";

import { ArrowRight, House, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SiteStatusPage } from "@/components/site/status-page";
import { StatusScaffold } from "@/components/site/status-scaffold";

import { routes } from "@/constants/routes";
import { siteCopy } from "@/constants/site-copy";

export default function NotFound() {
  return (
    <StatusScaffold>
      <SiteStatusPage
        code="404"
        eyebrow={siteCopy.errors.notFound.eyebrow}
        title={siteCopy.errors.notFound.title}
        description={siteCopy.errors.notFound.description}
        actions={
          <>
            <Button asChild size="lg">
              <Link href={routes.site.home}>
                <House />
                {siteCopy.errors.notFound.primaryAction}
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={routes.site.blog}>
                <ArrowRight />
                {siteCopy.errors.notFound.secondaryAction}
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href={routes.site.projects}>
                <PanelsTopLeft />
                {siteCopy.errors.notFound.tertiaryAction}
              </Link>
            </Button>
          </>
        }
      />
    </StatusScaffold>
  );
}

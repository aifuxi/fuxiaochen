import { Suspense } from "react";

import { type Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";

import { getCachedPublicChangelogs } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { ChangelogPageClient } from "./changelog-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return settings.seo.pages.changelog;
}

export default function ChangelogPage() {
  return (
    <Suspense fallback={<ChangelogPageSkeleton />}>
      <ChangelogPageContent />
    </Suspense>
  );
}

async function ChangelogPageContent() {
  const { items } = await getCachedPublicChangelogs();

  return <ChangelogPageClient changelogs={items} />;
}

function ChangelogPageSkeleton() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-16 text-center">
        <Skeleton className="mx-auto h-10 w-40" />
        <Skeleton className="mx-auto mt-4 h-6 w-full max-w-xl" />
      </header>
      <div className="relative">
        <div className="absolute top-0 left-0 h-full w-px bg-border md:left-1/2 md:-translate-x-1/2" />
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`relative mb-12 md:mb-16 ${
              index % 2 === 0 ? "md:pr-[50%]" : "md:pl-[50%]"
            }`}
          >
            <div className="absolute top-0 left-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-background bg-muted md:left-1/2" />
            <div
              className={`ml-6 space-y-3 md:ml-0 ${
                index % 2 === 0 ? "md:mr-8" : "md:ml-8"
              }`}
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

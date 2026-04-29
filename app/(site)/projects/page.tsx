import { Suspense } from "react";

import { type Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";

import { getCachedPublicProjects } from "@/lib/server/public-content-cache";
import { getCachedSiteSettings } from "@/lib/server/settings/service";

import { ProjectsPageClient } from "./projects-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCachedSiteSettings();

  return settings.seo.pages.projects;
}

export default async function ProjectsPage() {
  const settingsPromise = getCachedSiteSettings();
  const projectsPromise = getCachedPublicProjects();
  const { settings } = await settingsPromise;

  return (
    <Suspense fallback={<ProjectsPageSkeleton />}>
      <ProjectsPageContent
        projectsPromise={projectsPromise}
        settings={settings}
      />
    </Suspense>
  );
}

async function ProjectsPageContent({
  projectsPromise,
  settings,
}: {
  projectsPromise: ReturnType<typeof getCachedPublicProjects>;
  settings: Awaited<ReturnType<typeof getCachedSiteSettings>>["settings"];
}) {
  const { items } = await projectsPromise;

  return <ProjectsPageClient projects={items} settings={settings} />;
}

function ProjectsPageSkeleton() {
  return (
    <main className="flex-1">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
        </div>
      </section>
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <Skeleton className="mb-8 h-7 w-28" />
          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="aspect-video rounded-none md:w-72" />
                  <div className="flex-1 space-y-4 p-6">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-4/5" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

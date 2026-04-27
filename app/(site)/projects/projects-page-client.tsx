"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight, ExternalLink, Github } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { fetchApiData } from "@/lib/api/fetcher";
import type { PublicProject } from "@/lib/server/projects/mappers";
import type { SiteSettings } from "@/lib/settings/types";

import { siteCopy } from "@/constants/site-copy";

type ProjectsPageClientProps = {
  settings: SiteSettings;
  initialProjects?: PublicProject[];
};

export function ProjectsPageClient({
  settings,
  initialProjects,
}: ProjectsPageClientProps) {
  const { data } = useSWR<{ items: PublicProject[] }>(
    "/api/public/projects?pageSize=100",
    fetchApiData,
    {
      fallbackData: {
        items: initialProjects ?? [],
      },
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
    },
  );

  const projects = data?.items ?? [];
  const githubUrl =
    settings.social.githubUrl ||
    settings.social.sourceCodeUrl ||
    settings.general.siteUrl;
  const featuredProjects = projects.filter((project) => project.featured);
  const projectsByYear = projects.reduce<Record<string, PublicProject[]>>(
    (grouped, project) => {
      const currentProjects = grouped[project.year] ?? [];
      currentProjects.push(project);
      grouped[project.year] = currentProjects;
      return grouped;
    },
    {},
  );
  const years = Object.keys(projectsByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <main className="flex-1">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {siteCopy.projects.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {siteCopy.projects.description}
          </p>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-xl font-semibold text-foreground">
            {siteCopy.projects.featuredTitle}
          </h2>
          {featuredProjects.length > 0 ? (
            <div className="flex flex-col gap-8">
              {featuredProjects.map((project) => (
                <article
                  key={project.id}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/20"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden md:aspect-auto md:w-72">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        loading="eager"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">
                            {project.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {project.year}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {project.githubUrl && (
                            <Link
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <Github className="size-4" />
                              <span className="sr-only">
                                {siteCopy.projects.githubLabel}
                              </span>
                            </Link>
                          )}
                          {project.liveUrl && (
                            <Link
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <ExternalLink className="size-4" />
                              <span className="sr-only">
                                {siteCopy.projects.demoLabel}
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        {project.longDescription}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                {siteCopy.projects.featuredEmpty}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-xl font-semibold text-foreground">
            {siteCopy.projects.allTitle}
          </h2>
          {projects.length > 0 ? (
            <div className="flex flex-col gap-12">
              {years.map((year) => (
                <div key={year}>
                  <h3 className="mb-6 text-lg font-medium text-muted-foreground">
                    {year}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(projectsByYear[year] ?? []).map((project) => (
                      <article
                        key={project.id}
                        className="group flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-foreground">
                            {project.title}
                          </h4>
                          <div className="flex shrink-0 items-center gap-1">
                            {project.githubUrl && (
                              <Link
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <Github className="size-4" />
                                <span className="sr-only">
                                  {siteCopy.projects.githubLabel}
                                </span>
                              </Link>
                            )}
                            {project.liveUrl && (
                              <Link
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                              >
                                <ArrowUpRight className="size-4" />
                                <span className="sr-only">
                                  {siteCopy.projects.demoLabel}
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {project.description}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-1.5">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <p className="text-lg font-medium text-foreground">
                {siteCopy.projects.emptyTitle}
              </p>
              <p className="mt-2 text-muted-foreground">
                {siteCopy.projects.emptyDescription}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col items-center gap-6 rounded-lg border border-border bg-muted/50 p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              {siteCopy.projects.ctaTitle}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {siteCopy.projects.ctaDescription}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild>
                <Link href={`mailto:${settings.general.email}`}>
                  {siteCopy.projects.ctaPrimary}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 size-4" />
                  {siteCopy.projects.ctaSecondary}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

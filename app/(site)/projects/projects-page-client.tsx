"use client";

import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight, ExternalLink, Github } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { fetchApiData } from "@/lib/api/fetcher";
import type { PublicProject } from "@/lib/server/projects/mappers";

import { siteCopy } from "@/constants/site-copy";

export function ProjectsPageClient() {
  const { data } = useSWR<{ items: PublicProject[] }>(
    "/api/public/projects?pageSize=100",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const projects = data?.items ?? [];
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
          <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            {siteCopy.projects.title}
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
            {siteCopy.projects.description}
          </p>
        </div>
      </section>

      <section className="border-border border-t py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-foreground mb-8 text-xl font-semibold">
            {siteCopy.projects.featuredTitle}
          </h2>
          {featuredProjects.length > 0 ? (
            <div className="flex flex-col gap-8">
              {featuredProjects.map((project) => (
                <article
                  key={project.id}
                  className="group border-border bg-card hover:border-foreground/20 overflow-hidden rounded-lg border transition-colors"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden md:aspect-auto md:w-72">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-foreground text-xl font-semibold">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {project.year}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {project.githubUrl && (
                            <Link
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-2 transition-colors"
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
                              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-2 transition-colors"
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
            <div className="border-border bg-card rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">
                {siteCopy.projects.featuredEmpty}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-border border-t py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-foreground mb-8 text-xl font-semibold">
            {siteCopy.projects.allTitle}
          </h2>
          {projects.length > 0 ? (
            <div className="flex flex-col gap-12">
              {years.map((year) => (
                <div key={year}>
                  <h3 className="text-muted-foreground mb-6 text-lg font-medium">
                    {year}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(projectsByYear[year] ?? []).map((project) => (
                      <article
                        key={project.id}
                        className="group border-border hover:border-foreground/20 hover:bg-muted/50 flex flex-col gap-3 rounded-lg border p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-foreground font-medium">
                            {project.title}
                          </h4>
                          <div className="flex shrink-0 items-center gap-1">
                            {project.githubUrl && (
                              <Link
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
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
                                className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                              >
                                <ArrowUpRight className="size-4" />
                                <span className="sr-only">
                                  {siteCopy.projects.demoLabel}
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {project.description}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-1.5">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
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
            <div className="border-border bg-card rounded-lg border p-10 text-center">
              <p className="text-foreground text-lg font-medium">
                {siteCopy.projects.emptyTitle}
              </p>
              <p className="text-muted-foreground mt-2">
                {siteCopy.projects.emptyDescription}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="border-border border-t py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="border-border bg-muted/50 flex flex-col items-center gap-6 rounded-lg border p-8 text-center">
            <h2 className="text-foreground text-2xl font-semibold">
              {siteCopy.projects.ctaTitle}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {siteCopy.projects.ctaDescription}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild>
                <Link href="mailto:hello@example.com">
                  {siteCopy.projects.ctaPrimary}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link
                  href="https://github.com"
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

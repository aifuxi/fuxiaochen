"use client";

import { AlertTriangle, Bug, Sparkles, Zap } from "lucide-react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";

import { fetchApiData } from "@/lib/api/fetcher";
import type { PublicChangelog } from "@/lib/server/changelogs/mappers";

import { siteCopy } from "@/constants/site-copy";

function getTypeIcon(type: PublicChangelog["type"]) {
  switch (type) {
    case "feature":
      return <Sparkles className="size-4" />;
    case "improvement":
      return <Zap className="size-4" />;
    case "bugfix":
      return <Bug className="size-4" />;
    case "breaking":
      return <AlertTriangle className="size-4" />;
  }
}

function getTypeBadge(type: PublicChangelog["type"]) {
  const styles = {
    feature: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
    improvement: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
    bugfix: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
    breaking: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
  };

  const labels = {
    feature: siteCopy.changelog.types.feature,
    improvement: siteCopy.changelog.types.improvement,
    bugfix: siteCopy.changelog.types.bugfix,
    breaking: siteCopy.changelog.types.breaking,
  };

  return (
    <Badge variant="secondary" className={styles[type]}>
      {getTypeIcon(type)}
      <span className="ml-1">{labels[type]}</span>
    </Badge>
  );
}

export function ChangelogPageClient() {
  const { data } = useSWR<{ items: PublicChangelog[] }>(
    "/api/public/changelogs?pageSize=100",
    fetchApiData,
    {
      revalidateOnFocus: false,
    },
  );

  const changelogs = data?.items ?? [];

  return (
    <>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-16 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight">
            {siteCopy.changelog.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {siteCopy.changelog.description}
          </p>
        </header>

        {changelogs.length > 0 ? (
          <div className="relative">
            <div className="bg-border absolute top-0 left-0 h-full w-px md:left-1/2 md:-translate-x-1/2" />

            {changelogs.map((entry, index) => (
              <div
                key={entry.id}
                className={`relative mb-12 md:mb-16 ${
                  index % 2 === 0 ? "md:pr-[50%] md:text-right" : "md:pl-[50%]"
                }`}
              >
                <div
                  className={`border-background bg-primary absolute top-0 left-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 md:left-1/2`}
                />

                <div
                  className={`ml-6 md:ml-0 ${
                    index % 2 === 0 ? "md:mr-8" : "md:ml-8 md:text-left"
                  }`}
                >
                  <div
                    className={`mb-2 flex items-center gap-3 ${
                      index % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    <span className="text-muted-foreground font-mono text-sm">
                      v{entry.version}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {entry.date}
                    </span>
                  </div>

                  <div
                    className={`mb-3 flex items-center gap-3 ${
                      index % 2 === 0 ? "md:justify-end" : ""
                    }`}
                  >
                    {getTypeBadge(entry.type)}
                  </div>

                  <h2 className="text-foreground mb-2 text-xl font-semibold">
                    {entry.title}
                  </h2>

                  <p className="text-muted-foreground mb-4">
                    {entry.description}
                  </p>

                  <ul
                    className={`space-y-1.5 ${
                      index % 2 === 0 ? "md:ml-auto md:text-right" : ""
                    }`}
                  >
                    {entry.changes.map((change, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="text-muted-foreground text-sm"
                      >
                        {index % 2 === 0 ? (
                          <>
                            <span className="hidden md:inline">{change} •</span>
                            <span className="md:hidden">• {change}</span>
                          </>
                        ) : (
                          <>• {change}</>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-border bg-card rounded-lg border p-10 text-center">
            <p className="text-foreground text-lg font-medium">
              {siteCopy.changelog.emptyTitle}
            </p>
            <p className="text-muted-foreground mt-2">
              {siteCopy.changelog.emptyDescription}
            </p>
          </div>
        )}
      </main>
    </>
  );
}

import { type Metadata } from "next";

import { Sparkles, Zap, Bug, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import { getAllChangelogs, type ChangelogEntry } from "@/lib/changelog-data";

export const metadata: Metadata = {
  title: "Changelog | Fuxiaochen",
  description: "See what is new and improved in my blog and projects.",
};

function getTypeIcon(type: ChangelogEntry["type"]) {
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

function getTypeBadge(type: ChangelogEntry["type"]) {
  const styles = {
    feature: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
    improvement: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
    bugfix: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
    breaking: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
  };

  const labels = {
    feature: "New Feature",
    improvement: "Improvement",
    bugfix: "Bug Fix",
    breaking: "Breaking Change",
  };

  return (
    <Badge variant="secondary" className={styles[type]}>
      {getTypeIcon(type)}
      <span className="ml-1">{labels[type]}</span>
    </Badge>
  );
}

export default function ChangelogPage() {
  const changelogs = getAllChangelogs();

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold tracking-tight">
            Changelog
          </h1>
          <p className="text-muted-foreground text-lg">
            All the latest updates, improvements, and fixes to my blog and
            projects.
          </p>
        </header>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="bg-border absolute top-0 left-0 h-full w-px md:left-1/2 md:-translate-x-1/2" />

          {changelogs.map((entry, index) => (
            <div
              key={entry.id}
              className={`relative mb-12 md:mb-16 ${
                index % 2 === 0 ? "md:pr-[50%] md:text-right" : "md:pl-[50%]"
              }`}
            >
              {/* Dot on timeline */}
              <div
                className={`border-background bg-primary absolute top-0 left-0 h-3 w-3 -translate-x-1/2 rounded-full border-2 md:left-1/2`}
              />

              {/* Content */}
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
                  {entry.changes.map((change, i) => (
                    <li key={i} className="text-muted-foreground text-sm">
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
      </main>

      <Footer />
    </div>
  );
}

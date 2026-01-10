import { GithubIcon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { SOURCE_CODE_GITHUB_PAGE } from "@/constants";

export default function ChangelogPage() {
  const changelogEntries = [
    {
      version: "v2.1.0",
      date: "2024-01-15",
      title: "Performance Optimization Release",
      changes: [
        "Improved blog loading time by 40% with image optimization",
        "Added lazy loading for blog posts and featured articles",
        "Optimized CSS-in-JS bundle size",
        "Fixed dark mode color consistency issue",
      ],
      type: "feature",
    },
    {
      version: "v2.0.0",
      date: "2024-01-10",
      title: "Major Design Overhaul",
      changes: [
        "Complete redesign with hacker green theme",
        "Added light mode support with theme toggle",
        "Implemented responsive design for all devices",
        "Created new blog organization system with tags and categories",
        "Added blog archives timeline view",
      ],
      type: "major",
    },
    {
      version: "v1.5.0",
      date: "2024-01-05",
      title: "Blog Features Expansion",
      changes: [
        "Added blog detail pages with related posts",
        "Implemented comments system for blog posts",
        "Created tags and categories pages",
        "Added featured posts section on homepage",
      ],
      type: "feature",
    },
    {
      version: "v1.0.0",
      date: "2024-01-01",
      title: "Initial Release",
      changes: [
        "Launched personal tech portfolio website",
        "Created Go and React fullstack developer profile",
        "Implemented blog listing with categories",
        "Set up navigation and basic pages",
      ],
      type: "release",
    },
  ];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "major":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "feature":
        return "bg-primary/10 text-primary border-primary/30";
      case "release":
        return "bg-accent/10 text-accent border-accent/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "major":
        return "Major";
      case "feature":
        return "Feature";
      case "release":
        return "Release";
      default:
        return "Update";
    }
  };

  return (
    <div>
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1
            className={`
              mb-4 text-4xl font-bold text-balance
              md:text-5xl
            `}
          >
            更新日志
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            追踪本网站发布的所有更新、改进内容及新功能。
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-linear-to-b from-primary to-primary/20" />

          {/* Changelog entries */}
          <div className="space-y-8">
            {changelogEntries.map((entry, index) => (
              <div key={index} className="relative pl-44">
                {/* Timeline dot and date */}
                <div className="absolute top-1 left-0 flex h-16 w-16 items-center justify-center">
                  <div className="relative z-10 h-4 w-4 rounded-full border-4 border-background bg-primary" />
                  <div
                    className={`
                      absolute top-1/2 left-20 -translate-y-1/2 text-xs font-medium whitespace-nowrap
                      text-muted-foreground
                    `}
                  >
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Entry card */}
                <div
                  className={`
                    rounded-lg border border-border bg-card p-6 transition-colors
                    hover:border-primary/50
                  `}
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h2 className="mb-2 text-2xl font-bold">
                        {entry.version}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {entry.title}
                      </p>
                    </div>
                    <div
                      className={`
                        rounded border px-3 py-1 text-xs font-medium
                        ${getTypeStyles(entry.type)}
                      `}
                    >
                      {getTypeLabel(entry.type)}
                    </div>
                  </div>

                  {/* Changes list */}
                  <ul className="space-y-2">
                    {entry.changes.map((change, changeIndex) => (
                      <li
                        key={changeIndex}
                        className="flex items-start gap-3 text-foreground/90"
                      >
                        <span className="mt-1 flex-shrink-0 font-bold text-primary">
                          •
                        </span>
                        <span className="text-sm">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 border-t border-border pt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            想要提出功能建议或者报告问题吗？
          </p>
          <a
            href={`${SOURCE_CODE_GITHUB_PAGE}/issues`}
            target="_blank"
            className={`
              inline-flex items-center gap-2 font-medium text-primary transition-colors
              hover:text-primary/80
            `}
          >
            <HugeiconsIcon icon={GithubIcon} className="h-5 w-5" />去 GitHub
            反馈 <HugeiconsIcon icon={LinkSquare02Icon} className="h-5 w-5" />
          </a>
        </div>
      </main>
    </div>
  );
}

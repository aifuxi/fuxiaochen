export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  date: string;
  type: "feature" | "improvement" | "bugfix" | "breaking";
  description: string;
  changes: string[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    id: "1",
    version: "2.0.0",
    title: "Major Redesign",
    date: "2024-01-15",
    type: "feature",
    description:
      "Complete overhaul of the blog with a fresh new design, improved performance, and new features.",
    changes: [
      "New modern design with dark mode support",
      "Improved page load performance by 40%",
      "Added table of contents for blog posts",
      "New admin dashboard with analytics",
      "Added comments system with moderation",
    ],
  },
  {
    id: "2",
    version: "1.5.0",
    title: "Search and Filtering",
    date: "2024-01-08",
    type: "feature",
    description:
      "Added powerful search and filtering capabilities to help readers find content faster.",
    changes: [
      "Full-text search across all blog posts",
      "Filter by category and tags",
      "Search highlighting in results",
      "Improved mobile search experience",
    ],
  },
  {
    id: "3",
    version: "1.4.2",
    title: "Performance Fixes",
    date: "2024-01-02",
    type: "bugfix",
    description: "Fixed several performance issues and bugs reported by users.",
    changes: [
      "Fixed image lazy loading on Safari",
      "Resolved memory leak in comment component",
      "Fixed pagination on mobile devices",
      "Improved code syntax highlighting performance",
    ],
  },
  {
    id: "4",
    version: "1.4.0",
    title: "SEO Improvements",
    date: "2023-12-20",
    type: "improvement",
    description: "Enhanced SEO features for better search engine visibility.",
    changes: [
      "Added structured data for blog posts",
      "Improved meta tags generation",
      "Added sitemap generation",
      "Open Graph image generation",
    ],
  },
  {
    id: "5",
    version: "1.3.0",
    title: "API Changes",
    date: "2023-12-10",
    type: "breaking",
    description:
      "Breaking changes to the API structure for better consistency.",
    changes: [
      "Renamed /api/posts to /api/articles",
      "Changed date format to ISO 8601",
      "Removed deprecated endpoints",
      "Updated authentication headers",
    ],
  },
  {
    id: "6",
    version: "1.2.0",
    title: "Projects Page",
    date: "2023-12-01",
    type: "feature",
    description:
      "Added a dedicated page to showcase personal projects and work.",
    changes: [
      "New projects gallery page",
      "Project detail pages with images",
      "GitHub integration for project stats",
      "Filter projects by technology",
    ],
  },
];

export function getAllChangelogs(): ChangelogEntry[] {
  return changelogEntries;
}

export function getChangelogByVersion(
  version: string,
): ChangelogEntry | undefined {
  return changelogEntries.find((c) => c.version === version);
}

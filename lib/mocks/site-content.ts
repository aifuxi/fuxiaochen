export type NavItem = {
  href: string;
  label: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  description: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  featured?: boolean;
  markdown: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  status: string;
};

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  changes: string[];
};

export type FriendLink = {
  name: string;
  description: string;
  href: string;
  note: string;
};

export const primaryNavItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export const secondaryNavItems: NavItem[] = [
  { href: "/changelog", label: "Changelog" },
  { href: "/friends", label: "Friends" },
  { href: "/design-spec", label: "Design Spec" },
];

export const articles: Article[] = [
  {
    slug: "scalable-design-system-with-css-custom-properties",
    title: "Building a Scalable Design System with CSS Custom Properties",
    excerpt:
      "How Chen Serif organizes tokens, component contracts, and editorial layouts so the interface stays coherent as the product grows.",
    category: "Design Systems",
    description:
      "A deep dive into token architecture, composable component APIs, and documentation patterns for a dark editorial product system.",
    date: "2026-03-18",
    readTime: "9 min read",
    image: "/public/images/placeholder.avif".replace("/public", ""),
    tags: ["Tokens", "Tailwind v4", "System"],
    featured: true,
    markdown: `## Introduction

Design systems only scale when the visual language is encoded in stable primitives instead of scattered page-specific styles. Chen Serif starts from that premise.

We treat tokens as contracts: color, spacing, motion, type, and radius are the first layer. Components are the second layer. Page compositions are the third. Breaking that ordering almost always causes drift.

> A durable system does not chase components first. It names decisions first.

## Foundation: Token Architecture

The first decision is semantic naming. Instead of directly referencing an emerald hex in every component, we map that hue to a purpose: \`primary\`, \`accent\`, \`ring\`, or \`success\`. That keeps color usage stable even when the palette evolves.

### Color Layering

Chen Serif uses deep charcoal surfaces with soft translucency rather than flat black. This allows cards, navigation, and editor surfaces to feel stacked rather than merely separated by borders.

\`\`\`css
--color-background: #050505;
--color-card: rgba(255, 255, 255, 0.03);
--color-primary: #10b981;
--color-border: rgba(255, 255, 255, 0.1);
\`\`\`

### Typography Layering

The system pairs a literary serif with a restrained sans and a technical mono. Headlines are expressive, body copy stays neutral, and meta information gains a mechanical rhythm.

## Component Contracts

Every high-traffic component exposes a small variant surface: \`variant\`, \`size\`, and when needed \`tone\`. The goal is to make the API obvious enough that page authors do not invent local alternatives.

### Buttons

Buttons define hierarchy by fill, border, and glow rather than by adding one-off text colors. Primary buttons carry the emerald pulse. Ghost buttons disappear until hovered. Outline buttons keep structure without stealing focus.

### Fields

Fields are built on Base UI \`Field\` and \`Form\`, which means labels, descriptions, and validation remain structurally aligned even when the visual wrapper changes.

## Documentation as Product Surface

The design spec route is not a developer-only appendix. It is the interface where the team agrees on component vocabulary.

By documenting tokens, motion, component examples, and CMS-specific patterns together, we reduce design drift between the editorial product and the management console.

## Conclusion

The system works because the contracts are narrow, the primitives are composable, and the pages remain assembled from those primitives instead of bypassing them.`,
  },
  {
    slug: "editorial-motion-for-content-heavy-websites",
    title: "Editorial Motion for Content-Heavy Websites",
    excerpt:
      "Adding atmosphere without drowning long-form reading in generic microinteraction noise.",
    category: "Motion",
    description:
      "A practical guide to slow motion, shimmer borders, and spatial layering that respects reading flow.",
    date: "2026-02-02",
    readTime: "7 min read",
    image: "/public/images/cyberpunk-cover-1768641392857.avif".replace("/public", ""),
    tags: ["Motion", "Editorial", "UX"],
    markdown: `## Why Motion Needs Restraint

Long-form interfaces already contain a lot of cognitive load. Motion should orient, not decorate every inch of the screen.

## High-Impact Moments

The homepage hero, section reveals, and CTA surfaces deserve richer animation. Reading surfaces deserve almost none beyond subtle state feedback.

## Practical Rules

### Keep movement slow

Editorial motion feels premium when it drifts instead of snapping.

### Reserve glow for hierarchy

If everything glows, nothing matters.

### Make hover states directional

Cards should feel like they are responding to the pointer, not simply changing opacity.

## Result

The interface feels alive, but the text remains primary.`,
  },
  {
    slug: "content-modeling-before-prisma",
    title: "Model the Content Layer Before the Database",
    excerpt:
      "Why mock contracts are the fastest path to a cleaner eventual Prisma schema.",
    category: "Architecture",
    description:
      "Using typed mocks to stabilize routes, empty states, and editorial workflows before real persistence arrives.",
    date: "2026-01-14",
    readTime: "6 min read",
    image: "/public/images/placeholder.avif".replace("/public", ""),
    tags: ["Prisma", "Types", "Planning"],
    markdown: `## Start with behavior

A schema is only good if it supports the screens and workflows the product actually needs.

## Mock Types as Contracts

Typed mocks force the team to decide shape early: article summaries, detailed article content, dashboard metrics, moderation queues.

## Safer Iteration

When routes and components stabilize against mock contracts, the later persistence layer becomes a translation exercise instead of a discovery process.

## Outcome

You avoid schema churn caused by building tables before product language exists.`,
  },
];

export const projects: Project[] = [
  {
    slug: "chen-serif",
    title: "Chen Serif",
    description: "A dark editorial design system spanning public content, CMS tooling, and internal documentation.",
    tags: ["Next.js", "Tailwind v4", "Base UI"],
    href: "/design-spec",
    status: "Active",
  },
  {
    slug: "scribe-os",
    title: "Scribe OS",
    description: "A publishing workflow kit for solo creators who need structured drafting, review, and release flows.",
    tags: ["CMS", "Workflow", "Markdown"],
    href: "/cms/dashboard",
    status: "Prototype",
  },
  {
    slug: "atlas-grid",
    title: "Atlas Grid",
    description: "A metrics layer that turns publishing activity into small, legible operational dashboards.",
    tags: ["Analytics", "Tables", "Data Viz"],
    href: "/cms/analytics",
    status: "Research",
  },
];

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v0.3.0",
    date: "2026-04-08",
    title: "Base UI migration foundation",
    changes: [
      "Replaced ad-hoc interaction planning with Base UI primitive wrappers.",
      "Established Tailwind v4 tokens and editorial motion utilities.",
      "Added design spec route as the canonical component reference surface.",
    ],
  },
  {
    version: "v0.2.0",
    date: "2026-03-27",
    title: "CMS information architecture",
    changes: [
      "Defined dashboard, article, taxonomy, analytics, and settings route groups.",
      "Stabilized mock contracts for moderation queues and author workflows.",
    ],
  },
];

export const friendLinks: FriendLink[] = [
  {
    name: "Lin Studio",
    description: "Minimal interaction experiments for text-first products.",
    href: "https://example.com/lin-studio",
    note: "Quiet interfaces with strong typography.",
  },
  {
    name: "Wen Writes Code",
    description: "A builder who makes developer-facing products feel editorial instead of utilitarian.",
    href: "https://example.com/wen-writes-code",
    note: "Excellent long-form design references.",
  },
  {
    name: "Moss Grid",
    description: "A collective documenting systems thinking, tools, and product craft.",
    href: "https://example.com/moss-grid",
    note: "Consistent publishing mechanics.",
  },
];

export const siteStats = [
  { label: "Articles", value: "38" },
  { label: "Projects", value: "12" },
  { label: "Subscribers", value: "1.4k" },
];

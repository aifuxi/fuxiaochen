import {
  EMAIL,
  GITHUB_PAGE,
  JUEJIN_PAGE,
  NICKNAME,
  SOURCE_CODE_GITHUB_PAGE,
} from "@/constants/info";

export const editorialSite = {
  title: "The Curator",
  author: NICKNAME,
  email: EMAIL,
  socials: [
    { label: "GitHub", href: GITHUB_PAGE },
    { label: "Juejin", href: JUEJIN_PAGE },
    { label: "Source", href: SOURCE_CODE_GITHUB_PAGE },
  ],
} as const;

export type EditorialPost = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  category: string;
  summary: string;
  excerpt: string;
  tags: string[];
  listLabels: string[];
  hero: "topography" | "beam";
  quote?: string;
  sections: Array<{
    heading?: string;
    paragraphs: string[];
  }>;
  codeSample?: string;
  compare?: {
    oldWay: string;
    newWay: string;
  };
};

export const editorialPosts: EditorialPost[] = [
  {
    slug: "the-ethereal-editorial-a-design-system-study",
    title: "The Ethereal Editorial: A Design System Study",
    date: "2024-10-24",
    dateLabel: "Oct 24, 2024",
    category: "Design Systems",
    summary:
      "A study in tonal hierarchy, dense whitespace, and interface patterns that stay present without becoming loud.",
    excerpt:
      "Exploring how tonal depth and intentional whitespace can replace traditional borders to create more immersive reading experiences.",
    tags: ["Design Systems", "Typography", "UI"],
    listLabels: ["Case Study", "Featured"],
    hero: "beam",
    quote: "Depth is achieved not by drawing boxes, but by layering light.",
    sections: [
      {
        paragraphs: [
          "In modern interface design, there is a persistent tendency to draw lines. We wrap content in boxes, separate sections with rules, and define hierarchy through explicit physical edges. The result is functional, but often dense and visually noisy.",
          "Quiet Authority challenges that habit. Instead of using hard separators, it relies on tonal contrast, spacing, and ambient depth to guide the eye. The interface still feels structured, but the structure is implied rather than enforced.",
        ],
      },
      {
        heading: "Implementing Tonal Layering",
        paragraphs: [
          "The page background acts as a void. Content surfaces rise from that void in small tonal increments, moving from near-black to softened charcoal. Cards, blocks, and side notes become visible through contrast, not outline.",
          "When a boundary is still necessary for accessibility, the border should be ghosted. A 1px line at very low opacity is enough to clarify a hit area without turning the screen into a grid of boxes.",
        ],
      },
      {
        heading: "Typography as Structure",
        paragraphs: [
          "The other half of the system is typographic discipline. Headlines use compressed spacing and sharp contrast. Metadata shifts into monospaced, uppercase labels. Body copy relaxes into a generous rhythm. Together, the text itself becomes a structural device.",
        ],
      },
    ],
    codeSample: `/* Level 0 - the void */
.bg-base {
  background-color: #020202;
}

/* Level 1 - grouped content */
.surface-low {
  background-color: #080808;
}

/* Level 2 - lifted component */
.surface-card {
  background-color: #111111;
  box-shadow: 0 20px 40px -12px rgba(255, 255, 255, 0.04);
}`,
    compare: {
      oldWay:
        "Rely on visible 1px borders everywhere, so every group explains itself through hard separation.",
      newWay:
        "Use subtle background steps, diffuse shadow, and spacing so hierarchy reads naturally before the border is even noticed.",
    },
  },
  {
    slug: "typography-in-the-void-inter-vs-dm-mono",
    title: "Typography in the Void: Inter vs DM Mono",
    date: "2024-09-15",
    dateLabel: "Sep 15, 2024",
    category: "Typography",
    summary:
      "A pairing study on how a neutral grotesk and a restrained mono font can divide narrative copy from system metadata.",
    excerpt:
      "The fastest way to calm an interface is to decide which text should speak and which text should simply annotate.",
    tags: ["Typography", "Readability"],
    listLabels: ["Typography"],
    hero: "topography",
    sections: [
      {
        paragraphs: [
          "Editorial interfaces usually fail at the small sizes. Metadata competes with body copy, and labels are styled as if they deserve the same attention as the headline.",
          "A dual-font system solves that quickly. Inter handles narrative reading without friction, while DM Mono keeps dates, tags, and secondary labels in a colder, more archival register.",
        ],
      },
      {
        heading: "Separation Without Decoration",
        paragraphs: [
          "The goal is not to make metadata decorative. The goal is to remove it from the reading voice. Monospace, uppercase tracking, and lower contrast together create a quieter layer of information.",
        ],
      },
    ],
  },
  {
    slug: "quiet-authority-reframing-the-app-like-interface",
    title: "Quiet Authority: Reframing the App-Like Interface",
    date: "2024-08-02",
    dateLabel: "Aug 02, 2024",
    category: "UX Theory",
    summary:
      "A framework for reducing interface noise while keeping actions obvious and pages structurally legible.",
    excerpt:
      "An interface can be highly operational without adopting the visual density of a control panel.",
    tags: ["UX Theory", "Interface Systems"],
    listLabels: ["Essay"],
    hero: "topography",
    sections: [
      {
        paragraphs: [
          "The modern app aesthetic tends to over-explain. It covers every action in visible chrome and every grouping in explicit borders.",
          "Quiet Authority keeps the interaction model intact while lowering the visual volume. What remains is a system that still feels sharp, but no longer feels impatient.",
        ],
      },
      {
        heading: "Where Restraint Helps",
        paragraphs: [
          "Navigation, metadata, and repeated list patterns benefit most from restraint. Each can become more legible by using fewer high-contrast edges and more consistent rhythm.",
        ],
      },
    ],
  },
  {
    slug: "building-the-no-line-ui",
    title: "Building the No-Line UI",
    date: "2024-07-18",
    dateLabel: "Jul 18, 2024",
    category: "UI Patterns",
    summary:
      "Practical surface recipes for replacing rigid rules with tonal layering in cards, sidebars, and long-form reading layouts.",
    excerpt:
      "A no-line UI is not borderless chaos. It is a system where separation is delegated to depth, rhythm, and local contrast.",
    tags: ["UI Patterns", "CSS"],
    listLabels: ["Component", "Lab"],
    hero: "topography",
    sections: [
      {
        paragraphs: [
          "The trick is to decide where contrast should do the work. Cards can separate from the page with a one-step surface shift, while inline tags can float on pills with almost invisible edges.",
        ],
      },
      {
        heading: "Failure Modes",
        paragraphs: [
          "If everything shares the same background and same text contrast, the interface collapses into a single plane. A no-line system still needs hierarchy. It simply distributes hierarchy differently.",
        ],
      },
    ],
  },
  {
    slug: "lithographic-buttons-and-subtle-gradients",
    title: "Lithographic Buttons and Subtle Gradients",
    date: "2024-06-05",
    dateLabel: "Jun 05, 2024",
    category: "Visual Design",
    summary:
      "A look at tactile CTA styling built from quiet gradients, softened shadows, and active states with physical feedback.",
    excerpt:
      "Buttons feel expensive when they react like objects, not like illuminated stickers.",
    tags: ["Visual Design"],
    listLabels: ["Visual Design"],
    hero: "topography",
    sections: [
      {
        paragraphs: [
          "The most effective buttons in dark interfaces rarely glow. They rely on edge definition, shallow relief, and a restrained accent color.",
          "Even static pages benefit from tactile feedback. A 1px shift and tighter contrast on press is enough to create physicality without animation overload.",
        ],
      },
    ],
  },
];

export const changelogEntries = [
  {
    version: "v2.4.0",
    dateLabel: "October 24, 2024",
    title: "The Typography Refinement",
    summary:
      "A comprehensive overhaul of the site's typographic hierarchy to improve readability and establish a stronger editorial voice.",
    items: [
      "Introduced DM Mono for metadata and system-level information to clearly separate reading voice from annotation.",
      "Adjusted paragraph line-height to 1.6+ for long-form reading comfort in dark environments.",
      "Refined headline tracking for tighter, masthead-style rendering.",
    ],
  },
  {
    version: "v2.3.5",
    dateLabel: "September 12, 2024",
    title: "Depth & Layering System",
    summary:
      "Replaced traditional border delineations with a tonal hierarchy system to achieve a softer, more architectural depth.",
    items: [
      "Introduced dedicated surface tokens for grouped content, lifted panels, and chrome.",
      "Added ambient shadow recipes for floating content and hero panels.",
      "Removed most hard 1px borders from reading surfaces and navigation regions.",
    ],
  },
  {
    version: "v2.2.0",
    dateLabel: "August 05, 2024",
    title: "The Asymmetric Layout Engine",
    summary:
      "Shifted from rigid symmetry to intentional offset layouts that allow marginalia, large whitespace, and off-center imagery.",
    items: [
      "Added off-axis hero support for article pages and feature landing sections.",
      "Expanded component spacing rules for denser copy blocks and calmer scan paths.",
    ],
  },
] as const;

export const aboutFocusAreas = [
  {
    title: "Frontend Systems",
    description:
      "Designing reusable surfaces, typography rules, and interaction patterns that stay consistent as the product grows.",
  },
  {
    title: "Editorial UI",
    description:
      "Borrowing rhythm, pacing, and framing from publishing so long-form interfaces feel deliberate rather than overloaded.",
  },
  {
    title: "Calm Technology",
    description:
      "Building pages that inform clearly, keep operational clarity, and avoid the constant visual urgency of dashboard-heavy products.",
  },
] as const;

export function getEditorialPost(slug: string) {
  return editorialPosts.find((post) => post.slug === slug);
}

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
  heroImage?: string;
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
  image: string;
  label: string;
  metric: string;
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
  avatar: string;
  role: string;
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

const baseMarkdown = `## Introduction

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

The system works because the contracts are narrow, the primitives are composable, and the pages remain assembled from those primitives instead of bypassing them.`;

const articleSeeds = [
  ["scalable-design-system-with-css-custom-properties", "Building a Scalable Design System with CSS Custom Properties", "Exploring how to create maintainable design tokens that bridge design and development workflows for enterprise applications.", "Design Systems", "Dec 15, 2024", "8 min read", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"],
  ["advanced-react-patterns-for-modern-applications", "Advanced React Patterns for Modern Applications", "Deep dive into compound components, render props, and hooks for building flexible and reusable UIs.", "React", "Dec 12, 2024", "12 min read", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"],
  ["the-art-of-typography-in-digital-design", "The Art of Typography in Digital Design", "How classical typography principles can elevate modern web interfaces and improve readability.", "Typography", "Dec 10, 2024", "6 min read", "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop"],
  ["understanding-event-loop-in-javascript", "Understanding Event Loop in JavaScript", "A deep exploration of how JavaScript handles asynchronous operations under the hood.", "JavaScript", "Dec 8, 2024", "5 min read", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"],
  ["css-grid-vs-flexbox-when-to-use-which", "CSS Grid vs Flexbox: When to Use Which", "Practical guide to choosing the right layout tool for your next web project with real examples.", "CSS", "Dec 5, 2024", "7 min read", "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop"],
  ["modern-dark-mode-implementation-strategies", "Modern Dark Mode Implementation Strategies", "Best practices for implementing accessible and visually appealing dark themes that users love.", "Performance", "Dec 3, 2024", "9 min read", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop"],
  ["typescript-best-practices-for-large-scale-applications", "TypeScript Best Practices for Large Scale Applications", "Essential patterns and practices for maintainable TypeScript codebases in production environments.", "TypeScript", "Nov 30, 2024", "10 min read", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"],
  ["optimizing-react-application-performance", "Optimizing React Application Performance", "Practical techniques to improve rendering performance and reduce load times in React applications.", "React", "Nov 28, 2024", "11 min read", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"],
  ["the-complete-guide-to-css-custom-properties", "The Complete Guide to CSS Custom Properties", "Mastering CSS variables for creating scalable, maintainable, and themeable stylesheets.", "CSS", "Nov 25, 2024", "8 min read", "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop"],
  ["building-accessible-web-applications", "Building Accessible Web Applications", "A comprehensive guide to WCAG compliance, screen readers, and inclusive design patterns.", "Design Systems", "Nov 22, 2024", "12 min read", "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop"],
  ["javascript-memory-management-explained", "JavaScript Memory Management Explained", "Understanding how JavaScript handles memory allocation and avoiding common memory leaks.", "JavaScript", "Nov 20, 2024", "7 min read", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"],
  ["web-vitals-the-complete-guide", "Web Vitals: The Complete Guide", "Measuring and optimizing Core Web Vitals for better SEO and user experience scores.", "Performance", "Nov 18, 2024", "9 min read", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop"],
  ["micro-interactions-small-details-big-impact", "Micro-Interactions: Small Details, Big Impact", "How thoughtful micro-interactions can elevate your UX and delight your users.", "Design Systems", "Nov 15, 2024", "6 min read", "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop"],
  ["state-management-in-react-redux-vs-context-vs-zustand", "State Management in React: Redux vs Context vs Zustand", "Comparing different state management solutions and when to use each one in your React app.", "React", "Nov 12, 2024", "10 min read", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"],
  ["modern-css-reset-building-a-clean-foundation", "Modern CSS Reset: Building a Clean Foundation", "Creating a custom CSS reset that addresses modern browser quirks and accessibility concerns.", "CSS", "Nov 10, 2024", "5 min read", "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop"],
  ["design-tokens-the-bridge-between-design-and-code", "Design Tokens: The Bridge Between Design and Code", "How to implement design tokens that work seamlessly across platforms and frameworks.", "Design Systems", "Nov 8, 2024", "8 min read", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"],
  ["async-await-writing-cleaner-asynchronous-code", "Async/Await: Writing Cleaner Asynchronous Code", "Best practices for writing readable asynchronous JavaScript using async/await syntax.", "JavaScript", "Nov 5, 2024", "6 min read", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"],
  ["image-optimization-for-web-performance", "Image Optimization for Web Performance", "Techniques for optimizing images including lazy loading, modern formats, and CDN strategies.", "Performance", "Nov 2, 2024", "7 min read", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop"],
  ["building-custom-react-hooks-for-reusable-logic", "Building Custom React Hooks for Reusable Logic", "Creating powerful custom hooks that encapsulate complex logic and improve code organization.", "React", "Oct 30, 2024", "9 min read", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"],
  ["variable-fonts-the-future-of-web-typography", "Variable Fonts: The Future of Web Typography", "Exploring variable fonts and how they enable dynamic, responsive typography on the web.", "Typography", "Oct 28, 2024", "6 min read", "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop"],
  ["typescript-generics-advanced-patterns-and-use-cases", "TypeScript Generics: Advanced Patterns and Use Cases", "Mastering TypeScript generics for building flexible, type-safe component libraries.", "TypeScript", "Oct 25, 2024", "11 min read", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"],
  ["container-queries-the-next-evolution-in-responsive-design", "Container Queries: The Next Evolution in Responsive Design", "How container queries change the way we think about component-based responsive design.", "CSS", "Oct 22, 2024", "7 min read", "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop"],
  ["code-splitting-and-lazy-loading-strategies", "Code Splitting and Lazy Loading Strategies", "Implementing effective code splitting and lazy loading for faster initial page loads.", "Performance", "Oct 18, 2024", "8 min read", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"],
  ["react-server-components-a-complete-introduction", "React Server Components: A Complete Introduction", "Understanding React Server Components and how they change the rendering architecture.", "React", "Oct 15, 2024", "12 min read", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"],
  ["building-a-design-system-documentation-site", "Building a Design System Documentation Site", "Best practices for documenting your design system components, tokens, and guidelines.", "Design Systems", "Oct 12, 2024", "9 min read", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"],
  ["javascript-closures-understanding-scope-and-memory", "JavaScript Closures: Understanding Scope and Memory", "Deep dive into closures, scope chain, and how they affect memory in JavaScript applications.", "JavaScript", "Oct 10, 2024", "8 min read", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"],
  ["css-animation-performance-optimization", "CSS Animation Performance Optimization", "Techniques for creating smooth, GPU-accelerated CSS animations without jank.", "CSS", "Oct 8, 2024", "6 min read", "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop"],
  ["typography-scale-systems-for-web-design", "Typography Scale Systems for Web Design", "Creating harmonious typography scales that work across devices and screen sizes.", "Typography", "Oct 5, 2024", "7 min read", "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop"],
  ["typescript-utility-types-you-should-know", "TypeScript Utility Types You Should Know", "Essential TypeScript utility types that will simplify your type definitions.", "TypeScript", "Oct 2, 2024", "6 min read", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"],
  ["caching-strategies-for-modern-web-applications", "Caching Strategies for Modern Web Applications", "Implementing effective caching strategies using Service Workers, CDN, and HTTP cache headers.", "Performance", "Sep 28, 2024", "10 min read", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop"],
  ["testing-react-components-a-practical-guide", "Testing React Components: A Practical Guide", "Effective strategies for unit testing React components with React Testing Library.", "React", "Sep 25, 2024", "11 min read", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"],
  ["design-system-governance-and-contribution-models", "Design System Governance and Contribution Models", "How to build sustainable processes for maintaining and evolving your design system.", "Design Systems", "Sep 22, 2024", "8 min read", "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"],
] as const;

export const articles: Article[] = articleSeeds.map(([slug, title, excerpt, category, date, readTime, image], index) => ({
  slug,
  title,
  excerpt,
  category,
  description: excerpt,
  date,
  readTime,
  image,
  heroImage: index === 0 ? "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&h=500&fit=crop" : undefined,
  tags: [category, category === "Design Systems" ? "Tokens" : category === "React" ? "Hooks" : category === "CSS" ? "Layout" : category === "JavaScript" ? "Async" : category === "Performance" ? "Optimization" : category === "Typography" ? "Type" : "Types"],
  featured: index < 3,
  markdown: baseMarkdown,
}));

export const projects: Project[] = [
  {
    slug: "chen-serif",
    title: "Chen Serif",
    description: "A dark editorial design system spanning public content, CMS tooling, and internal documentation.",
    tags: ["Next.js", "Tailwind v4", "Base UI"],
    href: "/design-spec",
    status: "Active",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=500&fit=crop",
    label: "Open Source",
    metric: "1.2k stars · 234 forks",
  },
  {
    slug: "scribe-os",
    title: "Scribe OS",
    description: "A publishing workflow kit for solo creators who need structured drafting, review, and release flows.",
    tags: ["CMS", "Workflow", "Markdown"],
    href: "/cms/dashboard",
    status: "Prototype",
    image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&h=500&fit=crop",
    label: "SaaS",
    metric: "500+ teams",
  },
  {
    slug: "atlas-grid",
    title: "Atlas Grid",
    description: "A metrics layer that turns publishing activity into small, legible operational dashboards.",
    tags: ["Analytics", "Tables", "Data Viz"],
    href: "/cms/analytics",
    status: "Research",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=500&fit=crop",
    label: "Mobile",
    metric: "10k+ downloads",
  },
  {
    slug: "artisan-marketplace",
    title: "Artisan Marketplace",
    description: "A curated marketplace for handcrafted goods featuring integrated payments, seller dashboards, and reviews.",
    tags: ["Vue.js", "Node.js", "Stripe"],
    href: "/projects",
    status: "Live",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
    label: "E-commerce",
    metric: "$50k/mo",
  },
  {
    slug: "figma-ui-kit",
    title: "Figma UI Kit",
    description: "A professional Figma UI kit with 200+ components, auto-layout variants, and design tokens for rapid prototyping.",
    tags: ["Figma", "FigJam"],
    href: "/projects",
    status: "Open Source",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
    label: "Open Source",
    metric: "890 stars · 5k downloads",
  },
  {
    slug: "devflow-cli",
    title: "DevFlow CLI",
    description: "A powerful CLI tool for developers to manage workflows, automate tasks, and integrate with popular dev tools.",
    tags: ["Rust", "CLI", "Tauri"],
    href: "/projects",
    status: "Open Source",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    label: "Open Source",
    metric: "2.1k stars · 156 forks",
  },
  {
    slug: "medimind",
    title: "MediMind",
    description: "A HIPAA-compliant healthcare app for appointment scheduling, telemedicine, and health record management.",
    tags: ["Flutter", "AWS"],
    href: "/projects",
    status: "Healthcare",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
    label: "Healthcare",
    metric: "50+ clinics",
  },
  {
    slug: "codesync",
    title: "CodeSync",
    description: "Real-time collaborative code editor with syntax highlighting, multi-language support, and video chat.",
    tags: ["WebRTC", "Monaco", "Socket.io"],
    href: "/projects",
    status: "Open Source",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    label: "Open Source",
    metric: "3.4k stars · 412 forks",
  },
  {
    slug: "streamline",
    title: "StreamLine",
    description: "A project management tool with kanban boards, time tracking, team collaboration, and automation features.",
    tags: ["Svelte", "Supabase"],
    href: "/projects",
    status: "Productivity",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    label: "Productivity",
    metric: "1.2k teams",
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
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    role: "全栈开发者",
  },
  {
    name: "Wen Writes Code",
    description: "A builder who makes developer-facing products feel editorial instead of utilitarian.",
    href: "https://example.com/wen-writes-code",
    note: "Excellent long-form design references.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    role: "设计师 & 插画师",
  },
  {
    name: "Moss Grid",
    description: "A collective documenting systems thinking, tools, and product craft.",
    href: "https://example.com/moss-grid",
    note: "Consistent publishing mechanics.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    role: "AI 研究者",
  },
  {
    name: "Emma Zhang",
    description: "分享产品思考与方法论，关注用户增长和商业模式创新。",
    href: "https://example.com/emma-zhang",
    note: "Product strategy and growth essays.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    role: "产品经理",
  },
  {
    name: "David Lin",
    description: "一个人做 App，正在打造让生活更美好的工具类产品。",
    href: "https://example.com/david-lin",
    note: "Indie app building in public.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    role: "独立开发者",
  },
  {
    name: "Lisa Wang",
    description: "用通俗易懂的语言解读科技趋势，让技术走进大众视野。",
    href: "https://example.com/lisa-wang",
    note: "Tech writing with broad accessibility.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    role: "科技博主",
  },
];

export const siteStats = [
  { label: "Articles", value: "38" },
  { label: "Projects", value: "12" },
  { label: "Subscribers", value: "1.4k" },
];

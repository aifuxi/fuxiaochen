export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "design-system",
    title: "Building a Design System from Scratch",
    description:
      "A comprehensive guide to creating scalable design systems that grow with your product.",
    content: `
## Introduction

Design systems are the foundation of consistent, scalable user interfaces. In this guide, we'll explore how to build one from the ground up.

## Why Design Systems Matter

A well-structured design system provides several benefits:

- **Consistency**: Every component looks and behaves the same way across your product
- **Efficiency**: Teams can build faster by reusing existing components
- **Scalability**: New features can be added without reinventing the wheel

## Core Components

### Typography

Typography is the backbone of your design system. Start by defining:

- Font families for headings and body text
- A type scale with consistent sizes
- Line heights and letter spacing

### Colors

Create a color palette that includes:

- Primary brand colors
- Neutral grays for text and backgrounds
- Semantic colors for success, warning, and error states

### Spacing

Use a consistent spacing scale based on a base unit (typically 4px or 8px). This creates visual rhythm and makes your layouts feel cohesive.

## Building Components

Start with atomic components like buttons, inputs, and badges. Then compose them into larger molecules and organisms.

### Button Component

Your button should support multiple variants:

- Primary for main actions
- Secondary for less prominent actions
- Ghost for subtle interactions

## Documentation

Document everything. Good documentation is what separates a design system from a component library.

## Conclusion

Building a design system takes time, but the investment pays off in consistency and developer experience.
    `,
    date: "Mar 15, 2026",
    category: "Design",
    tags: ["design-systems", "ui", "components", "scalability"],
    coverImage:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop",
    readTime: "8 min read",
    featured: true,
  },
  {
    slug: "react-server-components",
    title: "React Server Components Explained",
    description:
      "Understanding the fundamentals of RSC and how they change the way we build React apps.",
    content: `
## What Are Server Components?

React Server Components (RSC) represent a paradigm shift in how we think about React applications. They allow components to run exclusively on the server.

## The Problem RSC Solves

Traditional React apps send JavaScript to the client for every component. This leads to:

- Large bundle sizes
- Slow initial page loads
- Wasted computation on the client

## How Server Components Work

Server Components render on the server and send HTML to the client. They can:

- Access backend resources directly
- Keep sensitive logic on the server
- Reduce client-side JavaScript

### Server vs Client Components

Understanding when to use each is crucial:

**Server Components (default)**
- Fetch data
- Access backend resources
- Keep large dependencies on the server

**Client Components ('use client')**
- Add interactivity
- Use browser APIs
- Manage state with hooks

## Data Fetching

One of the biggest advantages is simplified data fetching:

\`\`\`tsx
async function BlogPost({ id }) {
  const post = await db.posts.find(id);
  return <article>{post.content}</article>;
}
\`\`\`

No useEffect, no loading states for the initial render.

## Performance Benefits

RSC dramatically reduces the JavaScript sent to clients. Components that don't need interactivity stay on the server entirely.

## Conclusion

Server Components are the future of React. Understanding them now will prepare you for the next generation of web applications.
    `,
    date: "Feb 28, 2026",
    category: "React",
    tags: ["react", "server-components", "nextjs", "performance"],
    coverImage:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop",
    readTime: "10 min read",
    featured: true,
  },
  {
    slug: "clean-code",
    title: "The Art of Writing Clean Code",
    description:
      "Practical tips and patterns for writing maintainable and readable code.",
    content: `
## What Is Clean Code?

Clean code is code that is easy to read, understand, and modify. It's not about clever tricks—it's about clarity.

## Naming Things

The hardest problem in programming, but also the most important.

### Variables

Use descriptive names that reveal intent:

\`\`\`js
// Bad
const d = new Date();

// Good
const currentDate = new Date();
\`\`\`

### Functions

Name functions after what they do, not how they do it:

\`\`\`js
// Bad
function processData(data) {}

// Good
function calculateTotalPrice(items) {}
\`\`\`

## Keep Functions Small

A function should do one thing and do it well. If you can't describe what a function does without using "and," it's doing too much.

## Avoid Deep Nesting

Deep nesting makes code hard to follow. Use early returns and guard clauses:

\`\`\`js
// Bad
function processUser(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // do something
      }
    }
  }
}

// Good
function processUser(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;
  
  // do something
}
\`\`\`

## Comments

The best code is self-documenting. Use comments sparingly, and only to explain *why*, not *what*.

## Conclusion

Writing clean code is a skill that develops over time. Focus on clarity, and your future self will thank you.
    `,
    date: "Feb 10, 2026",
    category: "Programming",
    tags: ["clean-code", "best-practices", "javascript", "patterns"],
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop",
    readTime: "6 min read",
    featured: true,
  },
  {
    slug: "nextjs-performance",
    title: "Optimizing Next.js Applications for Performance",
    description:
      "Learn how to make your Next.js apps lightning fast with these optimization techniques.",
    content: `
## Why Performance Matters

Performance directly impacts user experience and business metrics. A 1-second delay can reduce conversions by 7%.

## Image Optimization

Next.js provides the Image component for automatic optimization:

- Automatic WebP/AVIF conversion
- Lazy loading by default
- Responsive sizes

## Code Splitting

Next.js automatically splits code by route. You can further optimize with dynamic imports:

\`\`\`tsx
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
\`\`\`

## Caching Strategies

Use appropriate caching headers and leverage ISR (Incremental Static Regeneration) for frequently updated content.

## Bundle Analysis

Use the bundle analyzer to identify large dependencies and optimize them.

## Conclusion

Performance optimization is an ongoing process. Monitor your Core Web Vitals and iterate.
    `,
    date: "Apr 12, 2026",
    category: "Performance",
    tags: ["nextjs", "performance", "optimization", "web-vitals"],
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    readTime: "7 min read",
  },
  {
    slug: "typescript-generics",
    title: "A Deep Dive into TypeScript Generics",
    description:
      "Master TypeScript generics with practical examples and real-world use cases.",
    content: `
## What Are Generics?

Generics allow you to write reusable code that works with multiple types while maintaining type safety.

## Basic Generic Functions

The simplest generic function:

\`\`\`ts
function identity<T>(value: T): T {
  return value;
}
\`\`\`

## Generic Constraints

Constrain generics to ensure they have certain properties:

\`\`\`ts
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
\`\`\`

## Generic Interfaces

Create flexible interfaces:

\`\`\`ts
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
\`\`\`

## Practical Examples

Real-world uses include:

- API response wrappers
- State management
- Form handling
- Data fetching hooks

## Conclusion

Generics are essential for writing flexible, type-safe TypeScript code.
    `,
    date: "Apr 5, 2026",
    category: "TypeScript",
    tags: ["typescript", "generics", "type-safety", "javascript"],
    coverImage:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=630&fit=crop",
    readTime: "9 min read",
  },
  {
    slug: "accessible-forms",
    title: "Building Accessible Forms with React",
    description:
      "Create forms that everyone can use with proper accessibility patterns.",
    content: `
## Why Accessibility Matters

Around 15% of the world's population has some form of disability. Accessible forms ensure everyone can use your application.

## Labels Are Non-Negotiable

Every input needs a label:

\`\`\`tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
\`\`\`

## Error Messages

Announce errors to screen readers:

\`\`\`tsx
<input aria-describedby="email-error" aria-invalid={hasError} />
<span id="email-error" role="alert">{error}</span>
\`\`\`

## Keyboard Navigation

Ensure all form elements are keyboard accessible. Use proper focus management.

## ARIA Attributes

Use ARIA sparingly and correctly. Native HTML elements are often sufficient.

## Testing

Test with screen readers and keyboard-only navigation.

## Conclusion

Accessibility is not optional. Build forms that work for everyone.
    `,
    date: "Mar 28, 2026",
    category: "Accessibility",
    tags: ["accessibility", "a11y", "forms", "react"],
    coverImage:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&h=630&fit=crop",
    readTime: "5 min read",
  },
  {
    slug: "state-management",
    title: "State Management in 2026: What to Use",
    description:
      "A comprehensive comparison of state management solutions for modern React apps.",
    content: `
## The State of State Management

The landscape has evolved significantly. Let's explore your options.

## Built-in React State

For most apps, useState and useContext are enough:

- Local component state: useState
- Shared state across components: useContext + useReducer

## Server State vs Client State

Distinguish between:

- **Server state**: Data from APIs (use TanStack Query or SWR)
- **Client state**: UI state, form state (use React state)

## When to Use External Libraries

Consider Zustand or Jotai when:

- You need complex global state
- Performance is critical
- You want simpler APIs than Redux

## URL State

Don't forget the URL! Use query parameters for filterable, shareable state.

## Conclusion

Start simple. Add complexity only when needed. Most apps don't need Redux.
    `,
    date: "Mar 20, 2026",
    category: "React",
    tags: ["state-management", "react", "zustand", "redux"],
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop",
    readTime: "8 min read",
  },
  {
    slug: "container-queries",
    title: "CSS Container Queries are a Game Changer",
    description:
      "Learn how container queries revolutionize responsive component design.",
    content: `
## Beyond Media Queries

Media queries respond to viewport size. Container queries respond to parent size.

## Why This Matters

Components can now be truly reusable. A card component can adapt whether it's in a sidebar or main content area.

## Basic Syntax

Define a container:

\`\`\`css
.card-container {
  container-type: inline-size;
}
\`\`\`

Query the container:

\`\`\`css
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
\`\`\`

## Browser Support

Container queries are now supported in all major browsers.

## Practical Use Cases

- Card components
- Navigation menus
- Data tables
- Form layouts

## Conclusion

Container queries enable truly modular, responsive components. Start using them today.
    `,
    date: "Mar 12, 2026",
    category: "CSS",
    tags: ["css", "container-queries", "responsive", "layout"],
    coverImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=630&fit=crop",
    readTime: "4 min read",
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getSimilarPosts(currentSlug: string, limit = 3): BlogPost[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  return blogPosts
    .filter((post) => post.slug !== currentSlug)
    .filter(
      (post) =>
        post.category === currentPost.category ||
        post.tags.some((tag) => currentPost.tags.includes(tag)),
    )
    .slice(0, limit);
}

export function getAllCategories(): string[] {
  return [...new Set(blogPosts.map((post) => post.category))];
}

export function getAllTags(): string[] {
  return [...new Set(blogPosts.flatMap((post) => post.tags))];
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}

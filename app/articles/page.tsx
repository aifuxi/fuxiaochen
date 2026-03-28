"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, InputWrapper, InputIcon } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { NICKNAME, GITHUB_PAGE, EMAIL } from "@/constants/info";
import {
  SearchIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

// Article data type
interface Article {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  topic: string;
  topicLabel: string;
  date: string;
  readTime: string;
}

// Article data
const articles: Article[] = [
  {
    id: 1,
    title: "Building a Scalable Design System with CSS Custom Properties",
    excerpt:
      "Exploring how to create maintainable design tokens that bridge design and development workflows for enterprise applications.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    topic: "design-systems",
    topicLabel: "Design Systems",
    date: "Dec 15, 2024",
    readTime: "8 min",
  },
  {
    id: 2,
    title: "Advanced React Patterns for Modern Applications",
    excerpt:
      "Deep dive into compound components, render props, and hooks for building flexible and reusable UIs.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    topic: "react",
    topicLabel: "React",
    date: "Dec 12, 2024",
    readTime: "12 min",
  },
  {
    id: 3,
    title: "The Art of Typography in Digital Design",
    excerpt:
      "How classical typography principles can elevate modern web interfaces and improve readability.",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
    topic: "typography",
    topicLabel: "Typography",
    date: "Dec 10, 2024",
    readTime: "6 min",
  },
  {
    id: 4,
    title: "Understanding Event Loop in JavaScript",
    excerpt:
      "A deep exploration of how JavaScript handles asynchronous operations under the hood.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    topic: "javascript",
    topicLabel: "JavaScript",
    date: "Dec 8, 2024",
    readTime: "5 min",
  },
  {
    id: 5,
    title: "CSS Grid vs Flexbox: When to Use Which",
    excerpt:
      "Practical guide to choosing the right layout tool for your next web project with real examples.",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop",
    topic: "css",
    topicLabel: "CSS",
    date: "Dec 5, 2024",
    readTime: "7 min",
  },
  {
    id: 6,
    title: "Modern Dark Mode Implementation Strategies",
    excerpt:
      "Best practices for implementing accessible and visually appealing dark themes that users love.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
    topic: "performance",
    topicLabel: "Performance",
    date: "Dec 3, 2024",
    readTime: "9 min",
  },
  {
    id: 7,
    title: "TypeScript Best Practices for Large Scale Applications",
    excerpt:
      "Essential patterns and practices for maintainable TypeScript codebases in production environments.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    topic: "typescript",
    topicLabel: "TypeScript",
    date: "Nov 30, 2024",
    readTime: "10 min",
  },
  {
    id: 8,
    title: "Optimizing React Application Performance",
    excerpt:
      "Practical techniques to improve rendering performance and reduce load times in React applications.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    topic: "react",
    topicLabel: "React",
    date: "Nov 28, 2024",
    readTime: "11 min",
  },
  {
    id: 9,
    title: "The Complete Guide to CSS Custom Properties",
    excerpt:
      "Mastering CSS variables for creating scalable, maintainable, and themeable stylesheets.",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop",
    topic: "css",
    topicLabel: "CSS",
    date: "Nov 25, 2024",
    readTime: "8 min",
  },
  {
    id: 10,
    title: "Building Accessible Web Applications",
    excerpt:
      "A comprehensive guide to WCAG compliance, screen readers, and inclusive design patterns.",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
    topic: "design-systems",
    topicLabel: "Design Systems",
    date: "Nov 22, 2024",
    readTime: "12 min",
  },
  {
    id: 11,
    title: "JavaScript Memory Management Explained",
    excerpt:
      "Understanding how JavaScript handles memory allocation and avoiding common memory leaks.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    topic: "javascript",
    topicLabel: "JavaScript",
    date: "Nov 20, 2024",
    readTime: "7 min",
  },
  {
    id: 12,
    title: "Web Vitals: The Complete Guide",
    excerpt:
      "Measuring and optimizing Core Web Vitals for better SEO and user experience scores.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
    topic: "performance",
    topicLabel: "Performance",
    date: "Nov 18, 2024",
    readTime: "9 min",
  },
  {
    id: 13,
    title: "Micro-Interactions: Small Details, Big Impact",
    excerpt:
      "How thoughtful micro-interactions can elevate your UX and delight your users.",
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop",
    topic: "design-systems",
    topicLabel: "Design Systems",
    date: "Nov 15, 2024",
    readTime: "6 min",
  },
  {
    id: 14,
    title: "State Management in React: Redux vs Context vs Zustand",
    excerpt:
      "Comparing different state management solutions and when to use each one in your React app.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    topic: "react",
    topicLabel: "React",
    date: "Nov 12, 2024",
    readTime: "10 min",
  },
  {
    id: 15,
    title: "Modern CSS Reset: Building a Clean Foundation",
    excerpt:
      "Creating a custom CSS reset that addresses modern browser quirks and accessibility concerns.",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop",
    topic: "css",
    topicLabel: "CSS",
    date: "Nov 10, 2024",
    readTime: "5 min",
  },
  {
    id: 16,
    title: "Design Tokens: The Bridge Between Design and Code",
    excerpt:
      "How to implement design tokens that work seamlessly across platforms and frameworks.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    topic: "design-systems",
    topicLabel: "Design Systems",
    date: "Nov 8, 2024",
    readTime: "8 min",
  },
  {
    id: 17,
    title: "Async/Await: Writing Cleaner Asynchronous Code",
    excerpt:
      "Best practices for writing readable asynchronous JavaScript using async/await syntax.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    topic: "javascript",
    topicLabel: "JavaScript",
    date: "Nov 5, 2024",
    readTime: "6 min",
  },
  {
    id: 18,
    title: "Image Optimization for Web Performance",
    excerpt:
      "Techniques for optimizing images including lazy loading, modern formats, and CDN strategies.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
    topic: "performance",
    topicLabel: "Performance",
    date: "Nov 2, 2024",
    readTime: "7 min",
  },
  {
    id: 19,
    title: "Building Custom React Hooks for Reusable Logic",
    excerpt:
      "Creating powerful custom hooks that encapsulate complex logic and improve code organization.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    topic: "react",
    topicLabel: "React",
    date: "Oct 30, 2024",
    readTime: "9 min",
  },
  {
    id: 20,
    title: "Variable Fonts: The Future of Web Typography",
    excerpt:
      "Exploring variable fonts and how they enable dynamic, responsive typography on the web.",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
    topic: "typography",
    topicLabel: "Typography",
    date: "Oct 28, 2024",
    readTime: "6 min",
  },
  {
    id: 21,
    title: "TypeScript Generics: Advanced Patterns and Use Cases",
    excerpt:
      "Mastering TypeScript generics for building flexible, type-safe component libraries.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    topic: "typescript",
    topicLabel: "TypeScript",
    date: "Oct 25, 2024",
    readTime: "11 min",
  },
  {
    id: 22,
    title: "Container Queries: The Next Evolution in Responsive Design",
    excerpt:
      "How container queries change the way we think about component-based responsive design.",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop",
    topic: "css",
    topicLabel: "CSS",
    date: "Oct 22, 2024",
    readTime: "7 min",
  },
  {
    id: 23,
    title: "Code Splitting and Lazy Loading Strategies",
    excerpt:
      "Implementing effective code splitting and lazy loading for faster initial page loads.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    topic: "performance",
    topicLabel: "Performance",
    date: "Oct 18, 2024",
    readTime: "8 min",
  },
  {
    id: 24,
    title: "React Server Components: A Complete Introduction",
    excerpt:
      "Understanding React Server Components and how they change the rendering architecture.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    topic: "react",
    topicLabel: "React",
    date: "Oct 15, 2024",
    readTime: "12 min",
  },
  {
    id: 25,
    title: "Building a Design System Documentation Site",
    excerpt:
      "Best practices for documenting your design system components, tokens, and guidelines.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    topic: "design-systems",
    topicLabel: "Design Systems",
    date: "Oct 12, 2024",
    readTime: "9 min",
  },
  {
    id: 26,
    title: "JavaScript Closures: Understanding Scope and Memory",
    excerpt:
      "Deep dive into closures, scope chain, and how they affect memory in JavaScript applications.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop",
    topic: "javascript",
    topicLabel: "JavaScript",
    date: "Oct 10, 2024",
    readTime: "8 min",
  },
  {
    id: 27,
    title: "CSS Animation Performance Optimization",
    excerpt:
      "Techniques for creating smooth, GPU-accelerated CSS animations without jank.",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop",
    topic: "css",
    topicLabel: "CSS",
    date: "Oct 8, 2024",
    readTime: "6 min",
  },
  {
    id: 28,
    title: "Typography Scale Systems for Web Design",
    excerpt:
      "Creating harmonious typography scales that work across devices and screen sizes.",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
    topic: "typography",
    topicLabel: "Typography",
    date: "Oct 5, 2024",
    readTime: "7 min",
  },
  {
    id: 29,
    title: "TypeScript Utility Types You Should Know",
    excerpt:
      "Essential TypeScript utility types that will simplify your type definitions.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    topic: "typescript",
    topicLabel: "TypeScript",
    date: "Oct 2, 2024",
    readTime: "6 min",
  },
  {
    id: 30,
    title: "Caching Strategies for Modern Web Applications",
    excerpt:
      "Implementing effective caching strategies using Service Workers, CDN, and HTTP cache headers.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop",
    topic: "performance",
    topicLabel: "Performance",
    date: "Sep 28, 2024",
    readTime: "10 min",
  },
  {
    id: 31,
    title: "Testing React Components: A Practical Guide",
    excerpt:
      "Effective strategies for unit testing React components with React Testing Library.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    topic: "react",
    topicLabel: "React",
    date: "Sep 25, 2024",
    readTime: "11 min",
  },
  {
    id: 32,
    title: "Design System Governance and Contribution Models",
    excerpt:
      "How to build sustainable processes for maintaining and evolving your design system.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    topic: "design-systems",
    topicLabel: "Design Systems",
    date: "Sep 22, 2024",
    readTime: "8 min",
  },
];

// Topics for filter
const topics = [
  { value: "", label: "All Topics" },
  { value: "design-systems", label: "Design Systems" },
  { value: "react", label: "React" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "performance", label: "Performance" },
  { value: "typography", label: "Typography" },
];

// Tags for filter pills
const tags = [
  { value: "", label: "All" },
  { value: "design-systems", label: "Design Systems" },
  { value: "react", label: "React" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "performance", label: "Performance" },
];

// Navbar Component
function Navbar() {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navbarRef}
      className={`
        navbar fixed top-0 right-0 left-0 z-50 px-8 py-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
      `}
      style={{
        height: "96px",
        background: "rgba(5, 5, 5, 0.6)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={`
            logo flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white transition-all
            duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]
            hover:rotate-360
          `}
        >
          <span className="font-mono text-sm font-bold text-black">FC</span>
        </Link>

        {/* Navigation Links */}
        <div className={`
          hidden items-center gap-8
          md:flex
        `}>
          <Link
            href="/"
            className={`
              nav-link relative pb-1 font-mono text-xs tracking-widest text-muted uppercase transition-colors
              duration-300
              hover:text-foreground
            `}
          >
            Home
          </Link>
          <Link
            href="/articles"
            className={`
              nav-link active relative pb-1 font-mono text-xs tracking-widest text-foreground uppercase
              transition-colors duration-300
            `}
          >
            Articles
          </Link>
          <Link
            href="/projects"
            className={`
              nav-link relative pb-1 font-mono text-xs tracking-widest text-muted uppercase transition-colors
              duration-300
              hover:text-foreground
            `}
          >
            Projects
          </Link>
          <Link
            href="/about"
            className={`
              nav-link relative pb-1 font-mono text-xs tracking-widest text-muted uppercase transition-colors
              duration-300
              hover:text-foreground
            `}
          >
            About
          </Link>
          {/* Dropdown Menu */}
          <div className="group relative">
            <Link
              href="#"
              className={`
                nav-link flex items-center gap-1 font-mono text-xs tracking-widest text-muted uppercase
                transition-colors duration-300
                hover:text-foreground
              `}
            >
              More
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </Link>
            <div
              className={`
                invisible absolute top-full left-0 mt-2 w-48 translate-y-2 transform rounded-xl border border-white/10
                bg-black/90 py-2 opacity-0 backdrop-blur-xl transition-all duration-300
                group-hover:visible group-hover:translate-y-0 group-hover:opacity-100
              `}
            >
              <Link
                href="/changelog"
                className={`
                  block px-4 py-2 font-mono text-xs text-muted transition-colors
                  hover:bg-white/5 hover:text-foreground
                `}
              >
                Changelog
              </Link>
              <Link
                href="/friends"
                className={`
                  block px-4 py-2 font-mono text-xs text-muted transition-colors
                  hover:bg-white/5 hover:text-foreground
                `}
              >
                Friends
              </Link>
              <Link
                href="/design-system"
                className={`
                  block px-4 py-2 font-mono text-xs text-primary transition-colors
                  hover:bg-white/5
                `}
              >
                Design Spec
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button variant="primary-glow" size="sm" className="rounded-full">
          Get Started
        </Button>
      </div>
    </nav>
  );
}

// Spotlight Card Component
function SpotlightCard({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    };

    card.addEventListener("mousemove", handleMouseMove);
    return () => card.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={cardRef} className={cn("spotlight-card", className)} style={style}>
      {children}
    </div>
  );
}

// Article Card Component
function ArticleCard({
  image,
  topicLabel,
  title,
  excerpt,
  date,
  readTime,
  href = "#",
}: {
  image: string;
  topicLabel: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  href?: string;
}) {
  return (
    <Link href={href}>
      <article
        className={`
          article-card group glass-card shimmer-border overflow-hidden transition-all duration-300
          ease-[cubic-bezier(0.16,1,0.3,1)]
        `}
      >
        <div className="overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={600}
            height={400}
            className={`
              card-image h-48 w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:scale-105
            `}
          />
        </div>
        <div className="relative z-10 p-6">
          <Badge variant="primary" className="mb-3">
            {topicLabel}
          </Badge>
          <h3
            className={`
              mt-2 mb-3 font-serif text-xl transition-colors duration-300
              group-hover:text-primary
            `}
          >
            {title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed font-light text-muted">
            {excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>{date}</span>
              <span>•</span>
              <span>{readTime} read</span>
            </div>
            <div className="arrow-btn">
              <ArrowRightIcon className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t border-white/5 px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className={`
          flex flex-col items-center justify-between gap-6
          md:flex-row
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="font-mono text-xs font-bold text-black">FC</span>
            </div>
            <span className="font-mono text-xs text-muted">{NICKNAME}</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href={GITHUB_PAGE}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="/rss.xml"
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
              </svg>
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className={`
                text-muted transition-colors duration-300
                hover:text-foreground
              `}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <span className="font-mono text-xs text-muted/60">
            © 2024 {NICKNAME}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

// Tag Pill Component
function TagPill({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `
          tag-pill rounded-full border px-4 py-2 font-mono text-xs tracking-wider uppercase transition-all duration-200
          ease-[cubic-bezier(0.16,1,0.3,1)]
        `,
        isActive
          ? "border-primary bg-primary/10 text-primary"
          : `
            hover:border-border-hover hover:bg-white/10
            border-border bg-white/5 text-muted
          `
      )}
    >
      {label}
    </button>
  );
}

// Main Page Component
export default function ArticlesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTag, setActiveTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8;

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = activeTag === "" || article.topic === activeTag;

    return matchesSearch && matchesTag;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredArticles.length);
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  // Handle tag change
  const handleTagChange = (tag: string) => {
    setActiveTag(tag);
    setCurrentPage(1);
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(1);
      if (startPage > 2) {
        items.push("ellipsis");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push("ellipsis");
      }
      items.push(totalPages);
    }

    return items;
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Background Blobs */}
      <div className="morph-blob morph-blob-1" />
      <div className="morph-blob morph-blob-2" />
      <div className="morph-blob morph-blob-3" />

      {/* Page Header */}
      <section className="relative px-8 pt-40 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="hero-label-dot h-2 w-2"
              style={{
                background: "var(--primary)",
                borderRadius: "50%",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            <span className="font-mono text-xs tracking-widest text-muted uppercase">
              Archive
            </span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className={`
              font-serif text-5xl
              lg:text-6xl
            `}>All Writings</h1>
            <span className="font-mono text-sm text-muted" id="articleCount">
              {filteredArticles.length} articles
            </span>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="relative px-8 pb-12">
        <div className="mx-auto max-w-7xl">
          <SpotlightCard
            className="glass-card shimmer-border p-6"
            style={{ "--x": "50%", "--y": "50%" } as React.CSSProperties}
          >
            <div className={`
              mb-6 flex flex-col gap-4
              lg:flex-row
            `}>
              {/* Search Input */}
              <InputWrapper className="flex-1">
                <InputIcon>
                  <SearchIcon className="h-5 w-5 text-muted" />
                </InputIcon>
                <Input
                  variant="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12"
                />
              </InputWrapper>

              {/* Topic Select */}
              <Select
                value={activeTag}
                onValueChange={(value) => handleTagChange(value || "")}
              >
                <SelectTrigger className={`
                  w-full
                  lg:w-48
                `}>
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.value} value={topic.value}>
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <TagPill
                  key={tag.value}
                  label={tag.label}
                  isActive={activeTag === tag.value}
                  onClick={() => handleTagChange(tag.value)}
                />
              ))}
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Article Grid */}
      <section className="relative px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          {currentArticles.length > 0 ? (
            <div className={`
              grid gap-8
              md:grid-cols-2
            `}>
              {currentArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  image={article.image}
                  topicLabel={article.topicLabel}
                  title={article.title}
                  excerpt={article.excerpt}
                  date={article.date}
                  readTime={article.readTime}
                  href={`/article/${article.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <svg
                className="mx-auto mb-6 h-16 w-16 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="mb-2 font-serif text-2xl">No articles found</h3>
              <p className="text-muted">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {filteredArticles.length > 0 && (
        <section className="relative px-8 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center gap-6">
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-30"
                          : ""
                      }
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span className={`
                        hidden
                        sm:block
                      `}>Prev</span>
                    </PaginationPrevious>
                  </PaginationItem>

                  {/* Page Numbers */}
                  {getPaginationItems().map((item, index) =>
                    item === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          isActive={currentPage === item}
                          onClick={() => handlePageChange(item)}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  {/* Next Button */}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-30"
                          : ""
                      }
                    >
                      <span className={`
                        hidden
                        sm:block
                      `}>Next</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </PaginationNext>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <span className="font-mono text-sm text-muted">
                Showing {startIndex + 1}-{endIndex} of {filteredArticles.length}{" "}
                articles
              </span>
            </div>
          </div>
        </section>
      )}

      <Footer />

      <style jsx>{`
        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }
        .arrow-btn {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .arrow-btn:hover {
          transform: translateX(4px);
        }
        .article-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .article-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </main>
  );
}

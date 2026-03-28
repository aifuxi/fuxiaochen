"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { NICKNAME, GITHUB_PAGE, EMAIL } from "@/constants/info";
import Navbar from "@/components/navbar";
import {
  EyeIcon,
  HeartIcon,
  ClockIcon,
  ArrowRightIcon,
} from "lucide-react";

// Article data type
interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  topic: string;
  topicLabel: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  views: number;
  likes: number;
}

// Mock article data
const article: Article = {
  id: "1",
  title: "Building a Scalable Design System with CSS Custom Properties",
  excerpt:
    "Design systems have become an essential part of modern web development. They provide a consistent set of patterns and components that help teams build products faster and with greater coherence.",
  content: `
    <p class="text-lg leading-relaxed text-muted mb-8">
      Design systems have become an essential part of modern web development. They provide a consistent set of patterns and components that help teams build products faster and with greater coherence. In this article, we'll explore how to build a scalable design system using CSS custom properties.
    </p>

    <h2 id="introduction">Introduction</h2>
    <p>
      In the ever-evolving landscape of web development, consistency is key. Users expect interfaces to behave in predictable ways, and developers need efficient workflows to meet those expectations. A well-architected design system addresses both of these concerns by providing a single source of truth for design decisions.
    </p>
    <p>
      CSS custom properties, also known as CSS variables, are a powerful feature that allows us to define reusable values in one place and reference them throughout our stylesheets. Unlike preprocessor variables, custom properties are live and can be modified at runtime, enabling dynamic theming and more flexible code.
    </p>

    <blockquote>
      "The best design systems are not just collections of components—they're expressions of a shared design language that grows and evolves with your product."
    </blockquote>

    <h2 id="foundation">Foundation: Design Tokens</h2>
    <p>
      At the core of any design system are design tokens—the fundamental values that define your visual language. These include colors, typography scales, spacing units, and shadow values. By centralizing these in CSS custom properties, we create a single source of truth that can be easily updated.
    </p>

    <h3 id="color-system">Color System</h3>
    <p>
      A robust color system goes beyond just defining primary and secondary colors. It includes semantic colors for different states (success, warning, error), neutral colors for text and backgrounds, and support for both light and dark modes.
    </p>
    <p>
      Our color palette uses the oklch color space, which provides perceptually uniform colors. This means that when we adjust lightness or chroma, the changes appear natural to human eyes. Here's how we structure our color tokens:
    </p>

    <h3 id="typography">Typography Scale</h3>
    <p>
      Typography is more than just choosing fonts—it's about creating a hierarchy that guides users through content. We use a modular scale based on the golden ratio, which provides harmonious relationships between different type sizes.
    </p>

    <pre><code>// Typography Scale
--text-xs: 0.75rem;    // 12px
--text-sm: 0.875rem;   // 14px
--text-base: 1rem;     // 16px
--text-lg: 1.125rem;   // 18px
--text-xl: 1.25rem;    // 20px
--text-2xl: 1.5rem;    // 24px
--text-3xl: 1.875rem;  // 30px
--text-4xl: 2.25rem;   // 36px</code></pre>

    <h2 id="components">Component Architecture</h2>
    <p>
      Once we have our tokens in place, we can start building components. The key principle here is composition—small, focused components that can be combined to create more complex patterns. This approach improves reusability and makes testing easier.
    </p>

    <h3 id="button-patterns">Button Patterns</h3>
    <p>
      Buttons are among the most frequently used components in any interface. Our button system supports multiple variants (primary, secondary, ghost), sizes, and states. Each variant is defined through CSS custom properties, making it easy to create new themes.
    </p>

    <h2 id="theming">Dynamic Theming</h2>
    <p>
      One of the most powerful features of CSS custom properties is the ability to change them at runtime. This enables dynamic theming without JavaScript-based style manipulation. Users can switch between light and dark modes, and the entire interface updates instantly.
    </p>
    <p>
      To implement theming, we define our custom properties on the :root element and then override them within a .dark class. This approach is performant, accessible, and works without JavaScript.
    </p>

    <h2 id="best-practices">Best Practices</h2>
    <p>
      Building a scalable design system requires discipline and thoughtful architecture. Here are some principles that guide our approach:
    </p>
    <p>
      First, start with tokens, not components. By establishing your design language first, you ensure consistency across all components. Second, prefer composition over configuration. Instead of building components with many props, create small pieces that can be combined.
    </p>
    <p>
      Third, document everything. A design system is only useful if others can understand and use it. Invest in clear documentation, examples, and accessibility guidelines. Finally, evolve gradually. Design systems are never finished—they grow alongside your product.
    </p>

    <h2 id="conclusion">Conclusion</h2>
    <p>
      CSS custom properties have transformed how we build and maintain design systems. By leveraging them effectively, we can create scalable, maintainable, and themeable interfaces. The key is to start with a solid foundation of tokens and build up through careful component architecture.
    </p>
    <p>
      Whether you're starting a new project or refactoring an existing one, consider how CSS custom properties can improve your workflow. The initial investment in setting up a proper token system pays dividends in consistency and maintainability.
    </p>
  `,
  image:
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&h=500&fit=crop",
  topic: "design-systems",
  topicLabel: "Design Systems",
  author: {
    name: "Alex Chen",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face",
  },
  date: "Dec 15, 2024",
  readTime: "8 min read",
  views: 2847,
  likes: 328,
};

// Table of Contents
const tocItems = [
  { id: "introduction", title: "Introduction", level: 2 },
  { id: "foundation", title: "Foundation: Design Tokens", level: 2 },
  { id: "color-system", title: "Color System", level: 3 },
  { id: "typography", title: "Typography", level: 3 },
  { id: "components", title: "Component Architecture", level: 2 },
  { id: "button-patterns", title: "Button Patterns", level: 3 },
  { id: "theming", title: "Dynamic Theming", level: 2 },
  { id: "best-practices", title: "Best Practices", level: 2 },
  { id: "conclusion", title: "Conclusion", level: 2 },
];

// Related articles
const relatedArticles = [
  {
    id: "2",
    title: "The Art of Typography in Digital Design",
    excerpt: "How classical typography principles can elevate modern web interfaces.",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
    topic: "Typography",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    href: "/article/2",
  },
  {
    id: "3",
    title: "Advanced React Patterns for Modern Applications",
    excerpt: "Deep dive into compound components, render props, and hooks.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    topic: "React",
    date: "Dec 12, 2024",
    readTime: "12 min read",
    href: "/article/3",
  },
  {
    id: "4",
    title: "Design Tokens: The Bridge Between Design and Code",
    excerpt: "How to implement design tokens that work seamlessly across platforms.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    topic: "Design Systems",
    date: "Nov 8, 2024",
    readTime: "8 min read",
    href: "/article/4",
  },
];

// Table of Contents Component
function TableOfContents({
  items,
  activeId,
  onItemClick,
}: {
  items: { id: string; title: string; level: number }[];
  activeId: string;
  onItemClick: (id: string) => void;
}) {
  return (
    <div className="toc-container sticky top-32">
      <h4 className="mb-4 font-mono text-xs tracking-widest text-muted uppercase">
        On This Page
      </h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onItemClick(item.id)}
              className={cn(
                `
                  toc-link block text-left font-mono text-sm transition-all duration-200
                  ease-[cubic-bezier(0.16,1,0.3,1)]
                `,
                item.level === 3 ? "pl-4" : "",
                activeId === item.id
                  ? "text-primary"
                  : `
                    text-muted
                    hover:text-foreground
                  `
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Article Content Component
function ArticleContent({ content }: { content: string }) {
  return (
    <div
      className="article-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// Like Button Component
function LikeButton({
  initialLikes,
  initialLiked,
}: {
  initialLikes: number;
  initialLiked: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <button
      onClick={handleLike}
      className={cn(
        `like-btn flex items-center gap-3 rounded-full border px-8 py-4 font-mono text-sm transition-all duration-300`,
        liked
          ? "border-primary bg-primary/10 text-primary"
          : `
            border-white/10 text-muted
            hover:border-primary/50
          `
      )}
    >
      <HeartIcon
        className={cn("h-6 w-6 transition-all duration-300", liked && "fill-primary")}
      />
      <span>Like this article</span>
      <span className="text-muted">{likes}</span>
    </button>
  );
}

// Related Article Card
function RelatedArticleCard({
  image,
  topic,
  title,
  date,
  readTime,
  href,
}: {
  image: string;
  topic: string;
  title: string;
  date: string;
  readTime: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <article className={`
        related-card group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all
        duration-300
        hover:-translate-y-2 hover:border-white/20 hover:bg-white/8 hover:shadow-xl hover:shadow-black/20
      `}>
        <div className="overflow-hidden">
          <Image
            src={image}
            alt={title}
            width={600}
            height={400}
            className={`
              h-48 w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:scale-105
            `}
          />
        </div>
        <div className="p-6">
          <span className="mb-3 inline-block font-mono text-xs font-medium tracking-widest text-primary uppercase">
            {topic}
          </span>
          <h3 className={`
            mb-3 line-clamp-2 font-serif text-xl text-foreground transition-colors duration-300
            group-hover:text-primary
          `}>
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>{date}</span>
              <span>•</span>
              <span>{readTime}</span>
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

// Main Page Component
export default function ArticlePage() {
  const [activeSection, setActiveSection] = useState("introduction");

  // Active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 200;

      for (const item of tocItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;

          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 120;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Image */}
      <section className="hero-image-container relative overflow-hidden" style={{ height: 500, marginTop: 96 }}>
        <Image
          src={article.image}
          alt="Article cover"
          width={1400}
          height={500}
          className="h-full w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/50 to-black" />
      </section>

      {/* Article Header */}
      <section className="px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-6 flex items-center gap-3">
            <motion.div
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              {article.topicLabel}
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className={`
              article-title mb-8 font-serif text-4xl text-foreground
              md:text-5xl
              lg:text-6xl
            `}>
              {article.title}
            </h1>
          </Reveal>

          {/* Author Meta */}
          <Reveal delay={0.2} className="author-meta flex flex-wrap items-center gap-6">
            <Avatar size="lg" className="ring-2 ring-white/10">
              <AvatarImage
                src={article.author.avatar}
                alt={article.author.name}
                className="rounded-full"
              />
              <AvatarFallback className="rounded-full">AC</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-foreground">
                {article.author.name}
              </span>
              <span className="text-muted">•</span>
              <span className="text-sm text-muted">{article.date}</span>
              <span className="text-muted">•</span>
              <span className="text-sm text-muted">{article.readTime}</span>
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted">
                <EyeIcon className="h-5 w-5" />
                <span className="font-mono text-sm">{article.views.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <HeartIcon className="h-5 w-5" />
                <span className="font-mono text-sm">{article.likes.toLocaleString()}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-12">
            {/* Article Content */}
            <div className="article-content flex-1">
              <ArticleContent content={article.content} />
            </div>

            {/* Table of Contents */}
            <aside className={`
              ml-auto hidden w-72 flex-shrink-0
              lg:block
            `}>
              <TableOfContents
                items={tocItems}
                activeId={activeSection}
                onItemClick={scrollToSection}
              />
            </aside>
          </div>
        </div>
      </section>

      {/* Like & Stats Section */}
      <section className="px-8 pb-16">
        <div className="mx-auto max-w-7xl">
          <Reveal className={`
            flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl
          `}>
            <LikeButton initialLikes={article.likes} initialLiked={false} />

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted">
                <EyeIcon className="h-5 w-5" />
                <span className="font-mono text-sm">
                  {article.views.toLocaleString()} views
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <ClockIcon className="h-5 w-5" />
                <span className="font-mono text-sm">{article.readTime}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related Articles */}
      <section className="px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-8 font-serif text-3xl">Related Articles</Reveal>
          <div className={`
            grid gap-8
            md:grid-cols-3
          `}>
            {relatedArticles.map((related, index) => (
              <Reveal key={related.id} delay={index * 0.1}>
                <RelatedArticleCard {...related} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

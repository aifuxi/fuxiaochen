"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { NICKNAME } from "@/constants/info";

// Hero Section
function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-8 pt-24">
      {/* Background Blobs */}
      <div className="morph-blob morph-blob-1" />
      <div className="morph-blob morph-blob-2" />
      <div className="morph-blob morph-blob-3" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div
          className={`
            grid items-center gap-16
            lg:grid-cols-2
          `}
        >
          {/* Left Content */}
          <div className="space-y-8">
            <Reveal>
              <div className="flex items-center gap-3">
                <motion.div
                  className="h-2 w-2 rounded-full"
                  style={{ background: "var(--primary)" }}
                  animate={{
                    scale: [1, 0.8, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <span className="font-mono text-xs tracking-widest text-muted uppercase">
                  Design & Development
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1
                className={`
                  font-serif text-6xl leading-none tracking-tighter
                  lg:text-7xl
                `}
                style={{ lineHeight: 0.95 }}
              >
                Thoughts
                <br />
                <span className="text-primary italic">&</span>
                <br />
                Code
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="max-w-md text-lg leading-relaxed font-light text-muted">
                A personal space where I share ideas about design systems, web
                development, and the intersection of technology and creativity.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex items-center gap-6">
                <motion.a
                  href="#articles"
                  className={`
                    flex items-center gap-2 text-foreground transition-colors duration-300
                    hover:text-primary
                  `}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="font-mono text-sm tracking-wider uppercase">
                    Latest Article
                  </span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </motion.a>
              </div>
            </Reveal>
          </div>

          {/* Right Content - Avatar */}
          <div
            className={`
              flex justify-center
              lg:justify-end
            `}
          >
            <Reveal delay={0.2} direction="right">
              <div className="relative">
                {/* Rotating Ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary), transparent, var(--primary))",
                    padding: "4px",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <div
                  className={`
                    relative h-72 w-72 overflow-hidden rounded-full bg-secondary
                    lg:h-80 lg:w-80
                  `}
                >
                  <Avatar size="xl" className="h-full w-full rounded-full">
                    <AvatarImage
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                      alt={NICKNAME}
                      className="h-full w-full"
                    />
                    <AvatarFallback>FC</AvatarFallback>
                  </Avatar>
                </div>
                {/* Floating Badge */}
                <motion.div
                  className="glass-card shimmer-border absolute -right-4 -bottom-4 px-4 py-2"
                  style={{ borderRadius: "1rem" }}
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--primary)" }}
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="font-mono text-xs text-muted">
                      Available for work
                    </span>
                  </div>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// Article Card Component
function ArticleCard({
  image,
  category,
  title,
  description,
  date,
  readTime,
  href = "#",
}: {
  image: string;
  category: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  href?: string;
}) {
  return (
    <Link href={href}>
      <motion.article
        className="group glass-card shimmer-border overflow-hidden"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="overflow-hidden">
          <motion.div
            className="card-image h-48 w-full overflow-hidden"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={image}
              alt={title}
              width={600}
              height={400}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
        <div className="relative z-10 p-6">
          <Badge variant="primary" className="mb-3">
            {category}
          </Badge>
          <h3
            className={`
              mt-2 mb-3 font-serif text-xl transition-colors duration-300
              group-hover:text-primary
            `}
          >
            {title}
          </h3>
          <p className="mb-4 text-sm leading-relaxed font-light text-muted">
            {description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{date}</span>
            <span>{readTime}</span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

// Featured Articles Section
function FeaturedArticlesSection() {
  return (
    <section id="articles" className="relative px-8 py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              Featured
            </span>
            <h2 className="mt-2 font-serif text-4xl">Featured Articles</h2>
          </div>
          <motion.a
            href="#"
            className={`
              flex items-center gap-2 text-muted transition-colors duration-300
              hover:text-foreground
            `}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-sm tracking-wider uppercase">
              View All
            </span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.a>
        </Reveal>

        <div
          className={`
            grid gap-8
            md:grid-cols-2
            lg:grid-cols-3
          `}
        >
          <Reveal delay={0.1}>
            <ArticleCard
              image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"
              category="Design Systems"
              title="Building a Scalable Design System with CSS Custom Properties"
              description="Exploring how to create maintainable design tokens that bridge design and development workflows."
              date="Dec 15, 2024"
              readTime="8 min read"
            />
          </Reveal>
          <Reveal delay={0.2}>
            <ArticleCard
              image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop"
              category="React"
              title="Advanced React Patterns for Modern Applications"
              description="Deep dive into compound components, render props, and hooks for building flexible UIs."
              date="Dec 8, 2024"
              readTime="12 min read"
            />
          </Reveal>
          <Reveal delay={0.3}>
            <ArticleCard
              image="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop"
              category="Typography"
              title="The Art of Typography in Digital Design"
              description="How classical typography principles can elevate modern web interfaces."
              date="Nov 28, 2024"
              readTime="6 min read"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// Latest Writings Section
function LatestWritingsSection() {
  const articles = [
    {
      image:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=150&fit=crop",
      title: "Understanding Event Loop in JavaScript",
      description:
        "A deep exploration of how JavaScript handles asynchronous operations under the hood.",
      date: "Dec 20, 2024",
      readTime: "5 min read",
    },
    {
      image:
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&h=150&fit=crop",
      title: "CSS Grid vs Flexbox: When to Use Which",
      description:
        "Practical guide to choosing the right layout tool for your next web project.",
      date: "Dec 12, 2024",
      readTime: "7 min read",
    },
    {
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=150&fit=crop",
      title: "Modern Dark Mode Implementation Strategies",
      description:
        "Best practices for implementing accessible and visually appealing dark themes.",
      date: "Dec 5, 2024",
      readTime: "9 min read",
    },
  ];

  return (
    <section className="relative px-8 py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-12">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            Writing
          </span>
          <h2 className="mt-2 font-serif text-4xl">Latest Writings</h2>
        </Reveal>

        <div className="space-y-0">
          {articles.map((article, index) => (
            <motion.a
              key={index}
              href="#"
              className={`
                group -mx-6 block rounded-xl border-b border-white/5 px-6 py-8 transition-colors duration-300
                hover:bg-white/5
              `}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start gap-6">
                <Image
                  src={article.image}
                  alt={article.title}
                  width={200}
                  height={150}
                  className="h-18 w-24 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3
                    className={`
                      mb-2 font-serif text-xl transition-colors duration-300
                      group-hover:text-primary
                    `}
                  >
                    {article.title}
                  </h3>
                  <p className="mb-3 text-sm leading-relaxed font-light text-muted">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <svg
                    className={`
                      h-5 w-5 text-muted transition-colors duration-300
                      group-hover:text-primary
                    `}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Section
function AboutSection() {
  return (
    <section className="relative px-8 py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SpotlightCard
            className={`
              glass-card shimmer-border p-10
              lg:p-12
            `}
          >
            <div
              className={`
                flex flex-col items-center gap-8
                md:flex-row
                lg:gap-12
              `}
            >
              <div
                className={`
                  h-32 w-32 flex-shrink-0
                  lg:h-40 lg:w-40
                `}
              >
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  alt={NICKNAME}
                  width={400}
                  height={400}
                  className="h-full w-full rounded-2xl object-cover"
                />
              </div>
              <div
                className={`
                  text-center
                  md:text-left
                `}
              >
                <h2
                  className={`
                    mb-4 font-serif text-3xl
                    lg:text-4xl
                  `}
                >
                  <span className="text-primary italic">&quot;</span>
                  Design is not just what it looks like, it&apos;s how it works.
                  <span className="text-primary italic">&quot;</span>
                </h2>
                <p className="mb-6 max-w-xl leading-relaxed font-light text-muted">
                  I&apos;m {NICKNAME}, a designer and developer based in San
                  Francisco. I create digital experiences that blend aesthetics
                  with functionality, focusing on design systems, web
                  performance, and user-centered design.
                </p>
                <motion.a
                  href="#"
                  className={`
                    inline-flex items-center gap-2 text-primary transition-all duration-300
                    hover:gap-3
                  `}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="font-mono text-sm tracking-wider uppercase">
                    Read More
                  </span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </motion.a>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

// Project Card Component
function ProjectCard({
  image,
  tags,
  title,
  description,
  href = "#",
}: {
  image: string;
  tags: {
    label: string;
    type: "open-source" | "saas" | "mobile" | "ecommerce";
  }[];
  title: string;
  description: string;
  href?: string;
}) {
  return (
    <SpotlightCard className="glass-card shimmer-border group overflow-hidden">
      <div className="relative">
        <motion.div
          className="h-64 w-full overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={image}
            alt={title}
            width={800}
            height={500}
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {tags.map((tag, i) => (
              <Badge
                key={i}
                variant={tag.type === "open-source" ? "primary" : "secondary"}
                className="text-xs"
              >
                {tag.label}
              </Badge>
            ))}
          </div>
          <h3 className="mb-2 font-serif text-2xl text-white">{title}</h3>
          <p className="mb-4 text-sm leading-relaxed font-light text-white/70">
            {description}
          </p>
          <div className="flex items-center gap-4">
            <motion.a
              href={href}
              className={`
                flex items-center gap-2 text-primary transition-all duration-300
                hover:gap-3
              `}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-mono text-xs tracking-wider uppercase">
                View Project
              </span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </motion.a>
            <motion.a
              href="#"
              className={`
                text-white/40 transition-colors duration-300
                hover:text-white
              `}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

// Projects Section
function ProjectsSection() {
  const projects = [
    {
      image:
        "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=500&fit=crop",
      tags: [
        { label: "Open Source", type: "open-source" as const },
        { label: "React, TypeScript", type: "saas" as const },
      ],
      title: "Supernova Design System",
      description:
        "A comprehensive design system with 50+ components, tokens, and documentation for building consistent web applications.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&h=500&fit=crop",
      tags: [
        { label: "SaaS", type: "saas" as const },
        { label: "Next.js, Python", type: "saas" as const },
      ],
      title: "Neuralytics Dashboard",
      description:
        "Real-time analytics platform with AI-powered insights, featuring interactive data visualization and custom reporting.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=500&fit=crop",
      tags: [
        { label: "Mobile", type: "mobile" as const },
        { label: "React Native, Firebase", type: "saas" as const },
      ],
      title: "HabitFlow App",
      description:
        "A habit tracking application with gamification elements, streaks, and personalized coaching powered by ML.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
      tags: [
        { label: "E-commerce", type: "ecommerce" as const },
        { label: "Vue.js, Node.js", type: "saas" as const },
      ],
      title: "Artisan Marketplace",
      description:
        "A curated marketplace for handcrafted goods featuring integrated payments, seller dashboards, and reviews.",
    },
  ];

  return (
    <section id="projects" className="relative px-8 py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-12 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              Portfolio
            </span>
            <h2 className="mt-2 font-serif text-4xl">Featured Projects</h2>
          </div>
          <motion.a
            href="#"
            className={`
              flex items-center gap-2 text-muted transition-colors duration-300
              hover:text-foreground
            `}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-sm tracking-wider uppercase">
              View All
            </span>
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </motion.a>
        </Reveal>

        <div
          className={`
            grid gap-8
            md:grid-cols-2
          `}
        >
          {projects.map((project, index) => (
            <Reveal key={index} delay={index * 0.1}>
              <ProjectCard {...project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Newsletter CTA Section
function NewsletterSection() {
  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    alert(`Thanks for subscribing with ${email}!`);
    form.reset();
  };

  return (
    <section className="relative px-8 py-32">
      <div className="relative mx-auto max-w-3xl text-center">
        {/* CTA Glow */}
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 300,
            height: 300,
            background: "var(--primary)",
            filter: "blur(120px)",
          }}
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <Reveal className="relative z-10">
          <h2
            className={`
              gradient-text mb-4 font-serif text-5xl
              lg:text-6xl
            `}
          >
            Stay Updated
          </h2>
          <p className="mx-auto mb-10 max-w-md text-lg font-light text-muted">
            Subscribe to my newsletter for the latest articles, tutorials, and
            insights on design and development.
          </p>

          <form
            className={`
              mx-auto flex max-w-lg flex-col gap-4
              sm:flex-row
            `}
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className={`
                newsletter-input flex-1 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-white
                transition-all duration-300
                placeholder:text-muted
                focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
              `}
            />
            <Button
              type="submit"
              variant="primary-glow"
              className="rounded-full px-8 py-4 whitespace-nowrap"
            >
              Subscribe
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted">
            No spam, unsubscribe anytime.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// Main Page Component
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedArticlesSection />
      <LatestWritingsSection />
      <AboutSection />
      <ProjectsSection />
      <NewsletterSection />
    </>
  );
}

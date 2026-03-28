"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NICKNAME, GITHUB_PAGE, EMAIL } from "@/constants/info";

// Change Tag Component
function ChangeTag({
  type,
}: {
  type: "added" | "improved" | "bugfix" | "changed" | "removed";
}) {
  const styles = {
    added: "bg-green-500/15 text-green-500",
    improved: "bg-blue-500/15 text-blue-500",
    bugfix: "bg-red-500/15 text-red-500",
    changed: "bg-yellow-500/15 text-yellow-500",
    removed: "bg-gray-500/15 text-gray-400",
  };

  const labels = {
    added: "Added",
    improved: "Improved",
    bugfix: "Fixed",
    changed: "Changed",
    removed: "Removed",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-xs font-medium tracking-wider uppercase",
        styles[type]
      )}
    >
      {labels[type]}
    </span>
  );
}

// Version Badge Component
function VersionBadge({ version, major = false }: { version: string; major?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 font-mono text-xs font-bold",
        major
          ? "border border-primary bg-primary/20 text-primary"
          : "border border-primary/30 bg-primary/10 text-primary"
      )}
    >
      {version}
    </span>
  );
}

// Changelog Item Component
function ChangelogItem({
  version,
  date,
  title,
  description,
  changes,
  major = false,
  delay = 0,
}: {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: Array<{
    type: "added" | "improved" | "bugfix" | "changed" | "removed";
    title: string;
    details: string;
  }>;
  major?: boolean;
  delay?: number;
}) {
  return (
    <div
      className="changelog-item reveal"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="glass-card rounded-2xl border border-white/10 p-8"
        style={{ position: "relative" }}
      >
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <VersionBadge version={version} major={major} />
          <span className="font-mono text-sm text-muted">{date}</span>
          <span className="font-medium">{title}</span>
        </div>

        {/* Description */}
        <p className="mb-6 text-base leading-relaxed font-light text-muted">
          {description}
        </p>

        {/* Changes List */}
        <div className="space-y-3">
          {changes.map((change, index) => (
            <div key={index} className="flex items-start gap-3">
              <ChangeTag type={change.type} />
              <div>
                <span className="font-medium">{change.title}</span>
                <p className="mt-1 text-sm text-muted">{change.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
      className={cn(
        "navbar fixed top-0 right-0 left-0 z-50 px-8 py-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      )}
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
          className={cn(
            "logo flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white transition-all",
            "duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "hover:rotate-360"
          )}
        >
          <span className="font-mono text-sm font-bold text-black">FC</span>
        </Link>

        {/* Navigation Links */}
        <div className={`
          hidden items-center gap-8
          md:flex
        `}
        >
          <Link
            href="/"
            className={cn(
              "nav-link relative pb-1 font-mono text-xs tracking-widest text-muted uppercase transition-colors",
              "duration-300",
              "hover:text-foreground"
            )}
          >
            Home
          </Link>
          <Link
            href="/articles"
            className={cn(
              "nav-link relative pb-1 font-mono text-xs tracking-widest text-muted uppercase transition-colors",
              "duration-300",
              "hover:text-foreground"
            )}
          >
            Articles
          </Link>
          <Link
            href="/projects"
            className={cn(
              "nav-link relative pb-1 font-mono text-xs tracking-widest text-muted uppercase transition-colors",
              "duration-300",
              "hover:text-foreground"
            )}
          >
            Projects
          </Link>
          <Link
            href="/about"
            className={cn(
              "nav-link relative pb-1 font-mono text-xs tracking-widest text-muted uppercase transition-colors",
              "duration-300",
              "hover:text-foreground"
            )}
          >
            About
          </Link>
          {/* Dropdown Menu */}
          <div className="group relative">
            <Link
              href="#"
              className={cn(
                "nav-link flex items-center gap-1 font-mono text-xs tracking-widest text-muted uppercase",
                "transition-colors duration-300",
                "hover:text-foreground"
              )}
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
              className={cn(
                "invisible absolute top-full left-0 mt-2 w-48 translate-y-2 transform rounded-xl border border-white/10",
                "bg-black/90 py-2 opacity-0 backdrop-blur-xl transition-all duration-300",
                "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
              )}
            >
              <Link
                href="/changelog"
                className={cn(
                  "block px-4 py-2 font-mono text-xs text-primary transition-colors",
                  "hover:bg-white/5"
                )}
              >
                Changelog
              </Link>
              <Link
                href="/friends"
                className={cn(
                  "block px-4 py-2 font-mono text-xs text-muted transition-colors",
                  "hover:bg-white/5 hover:text-foreground"
                )}
              >
                Friends
              </Link>
              <Link
                href="/design-system"
                className={cn(
                  "block px-4 py-2 font-mono text-xs text-muted transition-colors",
                  "hover:bg-white/5 hover:text-foreground"
                )}
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

// Hero Section
function HeroSection() {
  return (
    <section className="relative px-8 pt-32 pb-16">
      <div className="mx-auto max-w-4xl">
        <div className="reveal">
          <span className="mb-4 block font-mono text-xs tracking-widest text-primary uppercase">
            Updates
          </span>
          <h1
            className={`
              mb-6 font-serif text-5xl
              lg:text-6xl
            `}
            style={{ lineHeight: 0.95 }}
          >
            Changelog
          </h1>
          <p className="max-w-xl text-lg leading-relaxed font-light text-muted">
            A record of all major updates, improvements, and fixes. Stay up to
            date with the latest changes.
          </p>
        </div>

        {/* Legend */}
        <div className="reveal mt-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <ChangeTag type="added" />
            <span className="text-sm text-muted">New features</span>
          </div>
          <div className="flex items-center gap-2">
            <ChangeTag type="improved" />
            <span className="text-sm text-muted">Enhancements</span>
          </div>
          <div className="flex items-center gap-2">
            <ChangeTag type="bugfix" />
            <span className="text-sm text-muted">Bug fixes</span>
          </div>
          <div className="flex items-center gap-2">
            <ChangeTag type="changed" />
            <span className="text-sm text-muted">Breaking changes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Changelog Data
const changelogData = [
  {
    version: "v2.0.0",
    date: "March 15, 2026",
    title: "Major Design System Overhaul",
    description:
      "Complete redesign of the component library with a new visual language, improved accessibility, and better performance across all platforms.",
    changes: [
      {
        type: "added" as const,
        title: "New Design Tokens",
        details: "Introduced semantic color tokens and spacing scale for better consistency.",
      },
      {
        type: "added" as const,
        title: "Dark Mode Support",
        details: "Full dark mode implementation with system preference detection.",
      },
      {
        type: "improved" as const,
        title: "Performance",
        details: "Reduced bundle size by 40% through tree-shaking and lazy loading.",
      },
      {
        type: "changed" as const,
        title: "API Redesign",
        details: "Simplified component API with better TypeScript support.",
      },
    ],
    major: true,
  },
  {
    version: "v1.5.2",
    date: "February 28, 2026",
    title: "Bug Fixes & Performance",
    description:
      "Monthly maintenance release focusing on bug fixes and performance improvements.",
    changes: [
      {
        type: "bugfix" as const,
        title: "Memory Leak in Charts",
        details: "Fixed memory leak that occurred when resizing chart components.",
      },
      {
        type: "bugfix" as const,
        title: "Modal Focus Trap",
        details: "Modal now properly traps focus and restores it on close.",
      },
      {
        type: "improved" as const,
        title: "Animation Performance",
        details: "Optimized CSS animations for 60fps on mobile devices.",
      },
    ],
  },
  {
    version: "v1.5.0",
    date: "February 14, 2026",
    title: "Valentine's Day Update",
    description:
      "New components and improvements to celebrate the season of love.",
    changes: [
      {
        type: "added" as const,
        title: "Date Range Picker",
        details: "New component for selecting date ranges with presets.",
      },
      {
        type: "added" as const,
        title: "Toast Notifications",
        details: "New toast system with auto-dismiss and action support.",
      },
      {
        type: "improved" as const,
        title: "Form Validation",
        details: "Better error messages and validation feedback.",
      },
    ],
  },
  {
    version: "v1.4.0",
    date: "January 30, 2026",
    title: "Accessibility Update",
    description:
      "Major accessibility improvements to ensure the design system works for everyone.",
    changes: [
      {
        type: "improved" as const,
        title: "WCAG 2.1 AA Compliance",
        details: "All components now meet WCAG 2.1 AA standards.",
      },
      {
        type: "added" as const,
        title: "Screen Reader Support",
        details: "Full ARIA labels and roles for all interactive components.",
      },
      {
        type: "added" as const,
        title: "Keyboard Navigation",
        details: "Complete keyboard navigation for all components.",
      },
      {
        type: "bugfix" as const,
        title: "Focus Indicators",
        details: "Visible focus indicators now appear on all interactive elements.",
      },
    ],
  },
  {
    version: "v1.3.1",
    date: "January 15, 2026",
    title: "Hotfix Release",
    description:
      "Critical bug fixes from the previous release.",
    changes: [
      {
        type: "bugfix" as const,
        title: "Build Error",
        details: "Fixed TypeScript errors that caused build failures in Next.js projects.",
      },
      {
        type: "bugfix" as const,
        title: "CSS Conflict",
        details: "Resolved CSS specificity issues with Tailwind utilities.",
      },
    ],
  },
  {
    version: "v1.3.0",
    date: "January 1, 2026",
    title: "Happy New Year!",
    description:
      "Starting 2026 with new components and exciting features.",
    changes: [
      {
        type: "added" as const,
        title: "Command Palette",
        details: "New command palette component for quick actions and navigation.",
      },
      {
        type: "added" as const,
        title: "Data Table",
        details: "Feature-rich data table with sorting, filtering, and pagination.",
      },
      {
        type: "removed" as const,
        title: "Deprecated Components",
        details: "Removed legacy components marked as deprecated in v1.0.",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "December 15, 2025",
    title: "Holiday Update",
    description:
      "Pre-holiday release with celebration-themed components and improvements.",
    changes: [
      {
        type: "added" as const,
        title: "Avatar Stack",
        details: "New component for displaying overlapping avatars.",
      },
      {
        type: "added" as const,
        title: "Badge Variants",
        details: "New notification and status badge variants.",
      },
      {
        type: "improved" as const,
        title: "Button Group",
        details: "Enhanced button group with more configuration options.",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "November 30, 2025",
    title: "Form Components Update",
    description:
      "Major improvements to form components and validation.",
    changes: [
      {
        type: "added" as const,
        title: "Combobox",
        details: "New searchable select component with custom options.",
      },
      {
        type: "added" as const,
        title: "Form Layout",
        details: "Grid-based form layout component for better structure.",
      },
      {
        type: "improved" as const,
        title: "Input States",
        details: "Better error, success, and warning states for inputs.",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "November 1, 2025",
    title: "Initial Release",
    description:
      "The first stable release of the Supernova Design System. Includes 50+ components, comprehensive documentation, and Figma integration.",
    changes: [
      {
        type: "added" as const,
        title: "Core Components",
        details: "50+ production-ready components including Button, Input, Modal, Card, and more.",
      },
      {
        type: "added" as const,
        title: "Design Tokens",
        details: "Complete token system for colors, typography, and spacing.",
      },
      {
        type: "added" as const,
        title: "Figma Kit",
        details: "Full Figma design kit with auto-layout and variants.",
      },
      {
        type: "added" as const,
        title: "Documentation",
        details: "Comprehensive docs with examples, API reference, and best practices.",
      },
    ],
    major: true,
  },
];

// Changelog Section
function ChangelogSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = sectionRef.current?.querySelectorAll(".reveal");
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative px-8 pb-32">
      <div className="mx-auto max-w-4xl">
        <div className="space-y-12">
          {changelogData.map((item, index) => (
            <ChangelogItem
              key={item.version}
              {...item}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="reveal mt-16 text-center">
          <button
            className={cn(
              "mx-auto flex items-center gap-2 rounded-full border border-white/10 px-8 py-4",
              "font-mono text-sm tracking-wider uppercase transition-all duration-300",
              "hover:border-primary hover:text-primary"
            )}
          >
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Load More
          </button>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="border-t border-white/5 px-8 py-12">
      <div className="mx-auto max-w-4xl">
        <div className={`
          flex flex-col items-center justify-between gap-6
          md:flex-row
        `}
        >
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
export default function ChangelogPage() {
  useEffect(() => {
    // Initialize reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Background Blobs */}
      <div className="morph-blob morph-blob-1 pointer-events-none fixed" />
      <div className="morph-blob morph-blob-2 pointer-events-none fixed" />
      <div className="morph-blob morph-blob-3 pointer-events-none fixed" />

      <Navbar />
      <HeroSection />
      <ChangelogSection />
      <Footer />
    </main>
  );
}

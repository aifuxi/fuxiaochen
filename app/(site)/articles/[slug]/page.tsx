import { Heart, Eye } from "lucide-react";

export default function ArticleDetailPage() {
  return (
    <div className={`
      container-shell space-y-10 py-8
      md:py-12
    `}>
      <section className="overflow-hidden rounded-[2rem]">
        <img
          alt="Article cover"
          className={`
            h-[360px] w-full object-cover
            md:h-[500px]
          `}
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&h=500&fit=crop"
        />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="hero-label-dot" />
          <span className="font-mono text-xs tracking-[0.24em] text-primary uppercase">
            Design Systems
          </span>
        </div>
        <h1 className="font-serif leading-[0.94] font-medium tracking-[-0.05em] text-[var(--text-h1)]">
          Building a Scalable Design System
          <br />
          with CSS Custom Properties
        </h1>
        <div className="flex flex-wrap items-center gap-6 border-b border-white/10 pb-8">
          <img
            alt="Author avatar"
            className="size-14 rounded-full object-cover"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
          />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium text-fg">Alex Chen</span>
            <span className="text-muted">•</span>
            <span className="text-muted">Dec 15, 2024</span>
            <span className="text-muted">•</span>
            <span className="text-muted">8 min read</span>
          </div>
          <div className="ml-auto flex items-center gap-5 text-muted">
            <div className="inline-flex items-center gap-2">
              <Eye className="size-4" />
              <span className="font-mono text-sm">2,847</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Heart className="size-4" />
              <span className="font-mono text-sm">328</span>
            </div>
          </div>
        </div>
      </section>

      <section className={`
        grid gap-12
        xl:grid-cols-[minmax(0,1fr)_280px]
      `}>
        <article className="editorial-prose max-w-3xl">
          <p className="text-lg leading-relaxed text-muted">
            Design systems have become an essential part of modern web development.
            They provide a consistent set of patterns and components that help teams
            build products faster and with greater coherence. In this article, we
            explore how to build a scalable design system using CSS custom
            properties.
          </p>

          <h2 id="introduction">Introduction</h2>
          <p>
            In the ever-evolving landscape of web development, consistency is key.
            Users expect interfaces to behave in predictable ways, and developers
            need efficient workflows to meet those expectations.
          </p>
          <p>
            CSS custom properties are especially useful because they remain live at
            runtime. That gives us theming flexibility without sacrificing the
            clarity of a single source of truth.
          </p>

          <blockquote>
            “The best design systems are not just collections of components.
            They&apos;re expressions of a shared design language.”
          </blockquote>

          <h2 id="foundation">Foundation: Design Tokens</h2>
          <p>
            At the core are tokens for color, typography, spacing, radius and
            elevation. These values become the substrate for semantic components.
          </p>

          <h3 id="color-system">Color System</h3>
          <p>
            A strong dark palette is more than a black background. It needs
            layered surfaces, clear border contrast, restrained accents and muted
            text that still reads comfortably.
          </p>

          <h3 id="typography">Typography Scale</h3>
          <p>
            Typography defines pace. Hero text sets mood, headings guide scanning,
            and body copy maintains rhythm through long-form reading.
          </p>

          <pre>
            <code>{`--text-xs: 0.75rem;\n--text-sm: 0.875rem;\n--text-base: 1rem;\n--text-lg: 1.125rem;\n--text-2xl: 1.5rem;\n--text-4xl: 2.25rem;`}</code>
          </pre>

          <h2 id="components">Component Architecture</h2>
          <p>
            Once tokens are stable, components can expose variant-driven APIs
            rather than stacking boolean props and page-local styling fragments.
          </p>

          <img
            alt="Design system components"
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop"
          />

          <h2 id="best-practices">Best Practices</h2>
          <p>
            Keep tokens semantic, let layout primitives stay dumb, and separate
            business data from visual composition. That boundary is what makes a
            system scale.
          </p>
        </article>

        <aside className={`
          h-fit rounded-[1.5rem] border border-white/10 bg-card p-6 backdrop-blur-xl
          xl:sticky xl:top-28
        `}>
          <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
            Table of Contents
          </div>
          <nav className="space-y-3 text-sm">
            <a href="#introduction" className={`
              block text-muted transition-colors
              hover:text-fg
            `}>
              Introduction
            </a>
            <a href="#foundation" className={`
              block text-muted transition-colors
              hover:text-fg
            `}>
              Foundation: Design Tokens
            </a>
            <a href="#color-system" className={`
              block pl-4 text-muted transition-colors
              hover:text-fg
            `}>
              Color System
            </a>
            <a href="#typography" className={`
              block pl-4 text-muted transition-colors
              hover:text-fg
            `}>
              Typography Scale
            </a>
            <a href="#components" className={`
              block text-muted transition-colors
              hover:text-fg
            `}>
              Component Architecture
            </a>
            <a href="#best-practices" className={`
              block text-muted transition-colors
              hover:text-fg
            `}>
              Best Practices
            </a>
          </nav>
        </aside>
      </section>
    </div>
  );
}

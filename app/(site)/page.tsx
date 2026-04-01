import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AboutSpotlight } from "@/components/site/about-spotlight";
import { ArticleCard } from "@/components/site/article-card";
import { ArticleListItem } from "@/components/site/article-list-item";
import { NewsletterPanel } from "@/components/site/newsletter-panel";
import { ProjectCard } from "@/components/site/project-card";
import { featuredArticles, latestWritings, projects } from "@/lib/mock/design-content";

export default function HomePage() {
  return (
    <div className={`
      container-shell space-y-24 py-8
      md:space-y-28 md:py-12
    `}>
      <section className={`
        site-section grid gap-12 py-10
        lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:py-16
      `}>
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="hero-label-dot" />
            <span className="font-mono text-xs tracking-[0.26em] text-primary uppercase">
              Notes on systems, content and code
            </span>
          </div>
          <h1 className="font-serif leading-[0.9] font-medium tracking-[-0.06em] text-[var(--text-display)]">
            Thoughts
            <br />
            & Code
          </h1>
          <p className="max-w-2xl text-lg leading-9 text-muted">
            我写设计系统、内容产品和前端架构，也记录软件如何在复杂度里维持秩序。
            这是一套偏 editorial 的深色站点，与 CMS 后台共享同一套视觉语言。
          </p>
          <Link
            href="/articles"
            className={`
              inline-flex items-center gap-3 text-sm text-fg transition-colors
              hover:text-primary
            `}
          >
            Explore writings
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className={`
          spotlight-card shimmer-border overflow-hidden rounded-[2rem] border border-white/10 bg-card p-6
          backdrop-blur-xl
        `}>
          <div className={`
            grid gap-6
            sm:grid-cols-[112px_1fr] sm:items-center
          `}>
            <div className={`
              relative mx-auto size-28
              sm:mx-0
            `}>
              <div className={`
                absolute inset-[-4px] animate-[spin_8s_linear_infinite] rounded-full
                bg-[conic-gradient(from_180deg_at_50%_50%,rgb(16_185_129_/_0.7),transparent,rgb(16_185_129_/_0.55))]
                opacity-70 blur-sm
              `} />
              <img
                alt="Alex Chen"
                className="relative size-28 rounded-full border border-white/10 object-cover"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=320&h=320&fit=crop&crop=face"
              />
            </div>
            <div className="space-y-4">
              <div className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                Available for consulting
              </div>
              <p className="font-serif text-[2rem] leading-[1.08] font-medium tracking-[-0.04em] text-fg">
                Building calm interfaces for teams that ship content-heavy products.
              </p>
              <p className="text-sm leading-7 text-muted">
                Design systems, editorial surfaces, CMS tooling and frontend architecture.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-section space-y-8">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
              Featured Articles
            </div>
            <h2 className="font-serif leading-[0.96] font-medium tracking-[-0.05em] text-[var(--text-h2)]">
              Writing about systems that need to age well.
            </h2>
          </div>
          <Link href="/articles" className={`
            hidden font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors
            hover:text-fg
            md:block
          `}>
            View all
          </Link>
        </div>
        <div className={`
          grid gap-6
          xl:grid-cols-3
        `}>
          {featuredArticles.map((article) => (
            <ArticleCard key={article.href} {...article} />
          ))}
        </div>
      </section>

      <section className="site-section space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
            Latest Writings
          </div>
          <h2 className="font-serif leading-[0.96] font-medium tracking-[-0.05em] text-[var(--text-h2)]">
            Smaller notes, sharper edges, faster iterations.
          </h2>
        </div>
        <div className="space-y-4">
          {latestWritings.map((article) => (
            <ArticleListItem key={article.href} {...article} />
          ))}
        </div>
      </section>

      <section className="site-section">
        <AboutSpotlight />
      </section>

      <section className="site-section space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
            Selected Projects
          </div>
          <h2 className="font-serif leading-[0.96] font-medium tracking-[-0.05em] text-[var(--text-h2)]">
            Systems translated into working products.
          </h2>
        </div>
        <div className={`
          grid gap-6
          md:grid-cols-2
          xl:grid-cols-4
        `}>
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </section>

      <NewsletterPanel />
    </div>
  );
}

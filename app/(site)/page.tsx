import Link from "next/link";

import { ArticleCard } from "@/components/blocks/article-card";
import { ArticleRow } from "@/components/blocks/article-row";
import { HeroSection } from "@/components/blocks/hero-section";
import { NewsletterCard } from "@/components/blocks/newsletter-card";
import { ProjectCard } from "@/components/blocks/project-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { articles, projects } from "@/lib/mocks/site-content";

export default function HomePage() {
  const featuredArticles = articles.slice(0, 2);
  const latestArticles = articles.slice(0, 3);

  return (
    <div className="space-y-20">
      <HeroSection />

      <section className="shell-container space-y-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="mb-2 type-label">Featured Writings</div>
            <h2 className="font-serif text-5xl tracking-[-0.05em]">Articles carrying the core design language.</h2>
          </div>
          <Link className={cn(buttonVariants({ variant: "outline" }))} href="/articles">
            Browse archive
          </Link>
        </div>
        <div className={`
          grid gap-5
          lg:grid-cols-2
        `}>
          {featuredArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      <section className="shell-container space-y-6">
        <div>
          <div className="mb-2 type-label">Latest Notes</div>
          <h2 className="font-serif text-5xl tracking-[-0.05em]">Shorter entries, still built from the same primitives.</h2>
        </div>
        <div className="space-y-4">
          {latestArticles.map((article) => (
            <ArticleRow key={article.slug} article={article} />
          ))}
        </div>
      </section>

      <section className="shell-container space-y-6">
        <div>
          <div className="mb-2 type-label">Projects</div>
          <h2 className="font-serif text-5xl tracking-[-0.05em]">Related product surfaces and internal tools.</h2>
        </div>
        <div className={`
          grid gap-5
          lg:grid-cols-3
        `}>
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <NewsletterCard />
    </div>
  );
}

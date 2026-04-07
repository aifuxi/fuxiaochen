import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/blocks/article-card";
import { ArticleRow } from "@/components/blocks/article-row";
import { NewsletterCard } from "@/components/blocks/newsletter-card";
import { ProjectCard } from "@/components/blocks/project-card";
import { articles, projects } from "@/lib/mocks/site-content";

export default function HomePage() {
  return (
    <div>
      <section className="relative flex min-h-screen items-center px-8 pt-24">
        <div className={`
          mx-auto grid w-full max-w-7xl items-center gap-16
          lg:grid-cols-2
        `}>
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="hero-label-dot" />
              <span className="font-mono-tech text-xs tracking-widest text-muted uppercase">Design & Development</span>
            </div>

            <h1 className={`
              font-serif text-6xl leading-none tracking-tighter
              lg:text-7xl
            `} style={{ lineHeight: 0.95 }}>
              Thoughts
              <br />
              <span className="text-primary-accent italic">&amp;</span>
              <br />
              Code
            </h1>

            <p className="max-w-md text-lg leading-relaxed font-light text-muted">
              A personal space where I share ideas about design systems, web development, and the intersection of technology and creativity.
            </p>

            <Link className={`
              arrow-btn flex items-center gap-2 text-foreground transition-colors duration-300
              hover:text-primary-accent
            `} href="#articles">
              <span className="font-mono-tech text-sm tracking-wider uppercase">Latest Article</span>
              <span>→</span>
            </Link>
          </div>

          <div className={`
            flex justify-center
            lg:justify-end
          `}>
            <div className="relative">
              <div className={`
                h-72 w-72 overflow-hidden rounded-full border border-white/8
                lg:h-80 lg:w-80
              `}>
                <Image
                  alt="Alex Chen"
                  className="h-full w-full object-cover"
                  height={400}
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  width={400}
                />
              </div>
              <div className="glass-card shimmer-border absolute right-[-16px] bottom-[-16px] px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="hero-label-dot h-1.5 w-1.5" />
                  <span className="font-mono-tech text-xs text-muted">Available for work</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="articles" className="relative px-8 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">Featured</span>
              <h2 className="mt-2 font-serif text-4xl">Featured Articles</h2>
            </div>
            <Link className={`
              arrow-btn flex items-center gap-2 text-muted transition-colors duration-300
              hover:text-foreground
            `} href="/articles">
              <span className="font-mono-tech text-sm tracking-wider uppercase">View All</span>
              <span>→</span>
            </Link>
          </div>
          <div className={`
            grid gap-8
            md:grid-cols-2
            lg:grid-cols-3
          `}>
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">Writing</span>
            <h2 className="mt-2 font-serif text-4xl">Latest Writings</h2>
          </div>
          <div className="space-y-0">
            {articles.slice(0, 3).map((article) => (
              <ArticleRow key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-32">
        <div className="mx-auto max-w-5xl">
          <div className={`
            spotlight-card glass-card shimmer-border p-10
            lg:p-12
          `}>
            <div className={`
              flex flex-col items-center gap-8 text-center
              md:flex-row md:text-left
              lg:gap-12
            `}>
              <div className={`
                h-32 w-32 flex-shrink-0 rounded-2xl
                bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.35),rgba(255,255,255,0.04),rgba(0,0,0,0.7))]
                lg:h-40 lg:w-40
              `} />
              <div>
                <h2 className={`
                  mb-4 font-serif text-3xl
                  lg:text-4xl
                `}>
                  <span className="text-primary-accent italic">&ldquo;</span>
                  Design is not just what it looks like, it&apos;s how it works.
                  <span className="text-primary-accent italic">&rdquo;</span>
                </h2>
                <p className="mb-6 max-w-xl leading-relaxed font-light text-muted">
                  I&apos;m Alex Chen, a designer and developer based in San Francisco. I create digital experiences that blend aesthetics with functionality, focusing on design systems, web performance, and user-centered design.
                </p>
                <Link className={`
                  arrow-btn text-primary-accent inline-flex items-center gap-2 transition-all duration-300
                  hover:gap-3
                `} href="/about">
                  <span className="font-mono-tech text-sm tracking-wider uppercase">Read More</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="relative px-8 py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">Portfolio</span>
              <h2 className="mt-2 font-serif text-4xl">Featured Projects</h2>
            </div>
            <Link className={`
              arrow-btn flex items-center gap-2 text-muted transition-colors duration-300
              hover:text-foreground
            `} href="/projects">
              <span className="font-mono-tech text-sm tracking-wider uppercase">View All</span>
              <span>→</span>
            </Link>
          </div>
          <div className={`
            grid gap-8
            md:grid-cols-2
          `}>
            {projects.slice(0, 4).map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <NewsletterCard />
    </div>
  );
}

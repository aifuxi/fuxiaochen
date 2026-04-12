import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/blocks/article-card";
import { ArticleRow } from "@/components/blocks/article-row";
import { NewsletterCard } from "@/components/blocks/newsletter-card";
import { ProjectCard } from "@/components/blocks/project-card";
import { listPublicArticles, listPublicProjects } from "@/lib/public/public-content-client";

export default async function HomePage() {
  const [featuredArticles, latestArticles, featuredProjects] = await Promise.all([
    listPublicArticles({ featured: true, page: 1, pageSize: 3 }),
    listPublicArticles({ page: 1, pageSize: 3 }),
    listPublicProjects({ featured: true, page: 1, pageSize: 4 }),
  ]);

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
              <span className="font-mono-tech text-xs tracking-widest text-muted uppercase">设计与开发</span>
            </div>

            <h1 className={`
              font-serif text-6xl leading-none tracking-tighter
              lg:text-7xl
            `} style={{ lineHeight: 0.95 }}>
              思考
              <br />
              <span className="text-primary-accent italic">&amp;</span>
              <br />
              代码
            </h1>

            <p className="max-w-md text-lg leading-relaxed text-muted">
              在这里分享关于设计系统、Web 开发以及技术与创意交汇点的思考。
            </p>

            <Link className={`
              arrow-btn flex items-center gap-2 text-foreground transition-colors duration-300
              hover:text-primary-accent
            `} href="#articles">
              <span className="font-mono-tech text-sm tracking-wider uppercase">最新文章</span>
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
                  <span className="font-mono-tech text-xs text-muted">可提供服务</span>
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
              <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">精选</span>
              <h2 className="mt-2 font-serif text-4xl">精选文章</h2>
            </div>
            <Link className={`
              arrow-btn flex items-center gap-2 text-muted transition-colors duration-300
              hover:text-foreground
            `} href="/articles">
              <span className="font-mono-tech text-sm tracking-wider uppercase">查看全部</span>
              <span>→</span>
            </Link>
          </div>
          <div className={`
            grid gap-8
            md:grid-cols-2
            lg:grid-cols-3
          `}>
            {featuredArticles.items.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-8 py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">写作</span>
            <h2 className="mt-2 font-serif text-4xl">最新文章</h2>
          </div>
          <div className="space-y-0">
            {latestArticles.items.map((article) => (
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
                h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl
                lg:h-40 lg:w-40
              `}>
                <Image
                  alt="Alex Chen"
                  className="h-full w-full object-cover"
                  height={400}
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  width={400}
                />
              </div>
              <div>
                <h2 className={`
                  mb-4 font-serif text-3xl
                  lg:text-4xl
                `}>
                  <span className="text-primary-accent italic">&ldquo;</span>
                  Design is not just what it looks like, it&apos;s how it works.
                  <span className="text-primary-accent italic">&rdquo;</span>
                </h2>
                <p className="mb-6 max-w-xl leading-relaxed text-muted">
                  I&apos;m Alex Chen, a designer and developer based in San Francisco. I create digital experiences that blend aesthetics with functionality, focusing on design systems, web performance, and user-centered design.
                </p>
                <Link className={`
                  arrow-btn text-primary-accent inline-flex items-center gap-2 transition-all duration-300
                  hover:gap-3
                `} href="/about">
                  <span className="font-mono-tech text-sm tracking-wider uppercase">阅读更多</span>
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
              <span className="font-mono-tech text-primary-accent text-xs tracking-widest uppercase">作品集</span>
              <h2 className="mt-2 font-serif text-4xl">精选项目</h2>
            </div>
            <Link className={`
              arrow-btn flex items-center gap-2 text-muted transition-colors duration-300
              hover:text-foreground
            `} href="/projects">
              <span className="font-mono-tech text-sm tracking-wider uppercase">查看全部</span>
              <span>→</span>
            </Link>
          </div>
          <div className={`
            grid gap-8
            md:grid-cols-2
          `}>
            {featuredProjects.items.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      <NewsletterCard />
    </div>
  );
}

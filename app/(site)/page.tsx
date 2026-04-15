import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/blocks/article-card";
import { ArticleRow } from "@/components/blocks/article-row";
import { NewsletterCard } from "@/components/blocks/newsletter-card";
import { ProjectCard } from "@/components/blocks/project-card";
import { SiteSectionHeading } from "@/components/blocks/site-section-heading";
import { listPublicArticles, listPublicProjects } from "@/lib/public/public-content-client";

export default async function HomePage() {
  const [featuredArticles, latestArticles, featuredProjects] = await Promise.all([
    listPublicArticles({ featured: true, page: 1, pageSize: 3 }),
    listPublicArticles({ page: 1, pageSize: 3 }),
    listPublicProjects({ featured: true, page: 1, pageSize: 4 }),
  ]);
  const featuredArticleSlugs = new Set(featuredArticles.items.map((article) => article.slug));
  const latestDistinctArticles = latestArticles.items.filter((article) => !featuredArticleSlugs.has(article.slug));

  return (
    <div className="space-y-24 pb-24">
      <section className="px-8 pt-24">
        <div className={`
          mx-auto grid max-w-7xl items-center gap-14
          lg:grid-cols-[1.05fr_0.95fr]
        `}>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="font-mono-tech text-[11px] tracking-[0.28em] text-primary uppercase">设计与开发</div>
              <h1 className={`
                font-serif text-5xl tracking-[-0.06em] text-foreground
                lg:text-7xl
              `} style={{ lineHeight: 0.95 }}>
                思考
                <br />
                <span className="text-primary-accent italic">&amp;</span>
                <br />
                代码
              </h1>
              <p className="max-w-lg text-lg leading-8 text-muted">
                在这里记录设计系统、Web 开发和创意实践交汇处的观察。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
              <span>Alex Chen</span>
              <span>·</span>
              <span>San Francisco</span>
              <span>·</span>
              <span>Design engineer</span>
            </div>
            <Link
              className={`
                hover:text-primary-accent
                inline-flex items-center gap-2 border-b border-primary/40 pb-1 text-sm text-foreground transition-colors
              `}
              href="#articles"
            >
              <span className="font-mono-tech tracking-[0.22em] uppercase">浏览最新文章</span>
              <span>→</span>
            </Link>
          </div>

          <div className={`
            flex justify-center
            lg:justify-end
          `}>
            <div className="relative">
              <div className={`
                h-72 w-72 overflow-hidden rounded-[2rem] border border-white/10
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
              <div className={`
                glass-card absolute right-[-12px] bottom-[-12px] rounded-2xl border border-white/10 px-4 py-3
              `}>
                <div className="space-y-1">
                  <div className="font-mono-tech text-[11px] tracking-[0.22em] text-muted uppercase">当前关注</div>
                  <div className="text-sm text-foreground">编辑系统 / 前端架构 / 产品写作</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="articles" className="px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <SiteSectionHeading
            description="先看近期写作，再进入完整归档。这里保留的是更值得回看的内容。"
            eyebrow="Archive / 文章"
            meta={`${featuredArticles.total} 篇精选`}
            title="精选文章"
          />
          <div className={`
            grid gap-8
            md:grid-cols-2
            lg:grid-cols-3
          `}>
            {featuredArticles.items.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          <div className="flex justify-end">
            <Link className={`
              inline-flex items-center gap-2 text-sm text-muted transition-colors
              hover:text-foreground
            `} href="/articles">
              <span className="font-mono-tech tracking-[0.22em] uppercase">查看完整归档</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-5xl space-y-10">
          <SiteSectionHeading
            description="按时间排列的近期更新，适合快速浏览我最近在想什么。"
            eyebrow="Writing / 近期"
            meta={`${latestDistinctArticles.length} 条`}
            title="最新文章"
          />
          <div className="space-y-0">
            {latestDistinctArticles.map((article) => (
              <ArticleRow key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-5xl">
          <div className={`
            glass-card rounded-[2rem] border border-white/10 p-8
            lg:p-10
          `}>
            <div className={`
              flex flex-col items-center gap-8
              md:flex-row md:items-start
            `}>
              <div className={`
                h-32 w-32 flex-shrink-0 overflow-hidden rounded-[1.5rem]
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
              <div className="space-y-5">
                <div className="font-mono-tech text-[11px] tracking-[0.28em] text-primary uppercase">作者简介</div>
                <h2 className={`
                  font-serif text-3xl tracking-[-0.04em] text-foreground
                  lg:text-4xl
                `}>
                  设计不止于外观，更关乎秩序、结构与使用时的节奏。
                </h2>
                <p className="max-w-xl text-base leading-8 text-muted">
                  我是 Alex Chen，一名专注于设计系统、前端架构和产品表达的设计师与开发者。这里记录的是我持续打磨数字体验的过程，而不是一套固定风格。
                </p>
                <Link className={`
                  text-primary-accent inline-flex items-center gap-2 text-sm transition-colors
                  hover:text-foreground
                `} href="/about">
                  <span className="font-mono-tech tracking-[0.22em] uppercase">阅读更多</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <SiteSectionHeading
            description="精选的是更具代表性的项目片段，完整项目集在项目归档中。"
            eyebrow="Archive / 项目"
            meta={`${featuredProjects.items.length} 个精选`}
            title="精选项目"
          />
          <div className={`
            grid gap-8
            md:grid-cols-2
          `}>
            {featuredProjects.items.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
          <div className="flex justify-end">
            <Link className={`
              inline-flex items-center gap-2 text-sm text-muted transition-colors
              hover:text-foreground
            `} href="/projects">
              <span className="font-mono-tech tracking-[0.22em] uppercase">查看完整项目</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <NewsletterCard />
    </div>
  );
}

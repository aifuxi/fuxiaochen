import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blocks/article-card";
import { ArticleStatsPanel } from "@/components/blocks/article-stats-panel";
import { MarkdownViewer } from "@/components/editor/markdown-viewer";
import { extractToc } from "@/lib/markdown";
import { articles } from "@/lib/mocks/site-content";

type ArticleDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  const toc = extractToc(article.markdown);
  const relatedArticles = articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <div>
      <section className="hero-image-container mt-24 overflow-hidden">
        <img alt={article.title} className="hero-image h-[500px] w-full object-cover" src={article.heroImage ?? article.image} />
        <div className="hero-image-overlay" />
      </section>

      <ArticleStatsPanel
        authorAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
        authorName="Alex Chen"
        category={article.category}
        date={article.date}
        readTime={article.readTime}
        title={article.title}
      />

      <section className="px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-12">
            <div className="article-content flex-1">
              <div className="prose-chen">
                <MarkdownViewer value={article.markdown} />
              </div>
            </div>

            <aside className={`
              hidden w-72 flex-shrink-0
              lg:block
            `}>
              <div className="toc-container rounded-2xl border border-white/8 bg-white/3 p-5">
                <h4 className="font-mono-tech mb-4 text-xs tracking-widest text-muted uppercase">On This Page</h4>
                <ul className="toc-list space-y-1.5">
                  {toc.map((item) => (
                    <li key={item.id} className="toc-item">
                      <a className={item.depth === 3 ? `
                        toc-link sub block rounded-xl px-3 py-2 text-xs text-muted
                        hover:bg-white/6 hover:text-foreground
                      ` : `
                        toc-link block rounded-xl px-3 py-2 text-sm text-muted
                        hover:bg-white/6 hover:text-foreground
                      `} href={`#${item.id}`}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 font-serif text-3xl">Related Articles</h2>
          <div className={`
            grid gap-8
            md:grid-cols-3
          `}>
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard key={relatedArticle.slug} article={relatedArticle} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

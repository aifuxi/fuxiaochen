import { ArticleArchive } from "@/components/blocks/article-archive";
import { getPublicSite, listPublicArticles } from "@/lib/public/public-content-client";

export default async function ArticlesPage() {
  const [articles, site] = await Promise.all([
    listPublicArticles({ page: 1, pageSize: 8 }),
    getPublicSite(),
  ]);

  return (
    <div>
      <section className="px-8 pt-40 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="hero-label-dot" />
            <span className="font-mono-tech text-xs tracking-widest text-muted uppercase">文章归档</span>
          </div>
          <div className="flex items-end justify-between">
            <h1 className={`
              font-serif text-5xl
              lg:text-6xl
            `}>全部文章</h1>
            <span className="font-mono-tech text-sm text-muted">{articles.total} 篇文章</span>
          </div>
        </div>
      </section>

      <section className="px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <ArticleArchive categories={site.articleCategories} initialResult={articles} />
        </div>
      </section>
    </div>
  );
}

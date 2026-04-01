import { ArticleSearch } from "@/components/features/articles/article-search";
import { ArticleCard } from "@/components/site/article-card";
import { archiveArticles } from "@/lib/mock/design-content";

export default function ArticlesPage() {
  return (
    <div className={`
      container-shell space-y-10 py-8
      md:py-12
    `}>
      <section className="space-y-5 py-8">
        <div className="flex items-center gap-3">
          <div className="hero-label-dot" />
          <span className="font-mono text-xs tracking-[0.24em] text-primary uppercase">
            Articles
          </span>
        </div>
        <h1 className="font-serif leading-[0.94] font-medium tracking-[-0.05em] text-[var(--text-h1)]">
          Essays, notes and implementation details.
        </h1>
        <p className="max-w-2xl text-lg leading-9 text-muted">
          一个偏内容型的归档页，保留了搜索、筛选和分页的视觉结构，但不接入真实 API 数据。
        </p>
        <div className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
          28 articles available
        </div>
      </section>

      <ArticleSearch />

      <section className={`
        grid gap-6
        md:grid-cols-2
        xl:grid-cols-3
      `}>
        {archiveArticles.map((article) => (
          <ArticleCard key={article.href} {...article} />
        ))}
      </section>

      <div className="flex items-center justify-center gap-2 py-2">
        <button type="button" className={`
          rounded-lg border border-white/10 px-4 py-2 text-sm text-muted transition-colors
          hover:text-fg
        `}>
          Prev
        </button>
        {[1, 2, 3, 4].map((page) => (
          <button
            key={page}
            type="button"
            className={`
              size-10 rounded-lg text-sm transition-colors
              ${
              page === 1
                ? "bg-primary text-primary-fg"
                : `
                  border border-white/10 text-muted
                  hover:text-fg
                `
            }
            `}
          >
            {page}
          </button>
        ))}
        <button type="button" className={`
          rounded-lg border border-white/10 px-4 py-2 text-sm text-muted transition-colors
          hover:text-fg
        `}>
          Next
        </button>
      </div>
    </div>
  );
}

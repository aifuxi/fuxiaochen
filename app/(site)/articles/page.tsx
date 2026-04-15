import { ArticleArchive } from "@/components/blocks/article-archive";
import { SiteSectionHeading } from "@/components/blocks/site-section-heading";
import { getPublicSite, listPublicArticles } from "@/lib/public/public-content-client";

export default async function ArticlesPage() {
  const [articles, site] = await Promise.all([
    listPublicArticles({ page: 1, pageSize: 8 }),
    getPublicSite(),
  ]);

  return (
    <div className="space-y-12 pb-24">
      <section className="px-8 pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-8">
            <SiteSectionHeading
              description="这里按时间整理了全部文章，先看近期写作，再继续向下翻阅完整归档。"
              eyebrow="Archive / 文章"
              meta={`${articles.total} 篇`}
              title="全部文章"
            />
            <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6 text-sm leading-7 text-muted">
              归档内容会保持原有顺序与分类，只把入口调得更安静一些。
            </div>
          </div>
        </div>
      </section>

      <section className="px-8">
        <div className="mx-auto max-w-7xl">
          <ArticleArchive categories={site.articleCategories} initialResult={articles} />
        </div>
      </section>
    </div>
  );
}

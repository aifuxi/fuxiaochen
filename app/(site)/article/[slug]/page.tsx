import Image from "next/image";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blocks/article-card";
import { ArticleStatsPanel } from "@/components/blocks/article-stats-panel";
import { MarkdownViewer } from "@/components/editor/markdown-viewer";
import { extractToc } from "@/lib/markdown";
import { getPublicArticle, PublicContentApiError } from "@/lib/public/public-content-client";
import { createPublicContentRepository } from "@/lib/public/public-content-repository";
import { createPublicContentService } from "@/lib/public/public-content-service";

type ArticleDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const service = createPublicContentService(createPublicContentRepository());
  const slugs = await service.listArticleSlugs();

  return slugs.map((article) => ({ slug: article.slug }));
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const detail = await getArticleDetail(slug);

  if (!detail) {
    notFound();
  }

  const { article, relatedArticles } = detail;
  const markdown = article.contentMarkdown ?? article.contentHtml ?? "";
  const toc = extractToc(markdown);

  return (
    <div>
      <section className="hero-image-container mt-24 overflow-hidden">
        {article.coverImageUrl ? (
          <Image
            priority
            alt={article.coverImageAlt ?? article.title}
            className="hero-image h-[500px] w-full object-cover"
            height={500}
            src={article.coverImageUrl}
            width={1400}
          />
        ) : (
          <div className="hero-image flex h-[500px] w-full items-center justify-center bg-white/5">
            <span className="font-mono-tech text-xs tracking-widest text-muted uppercase">暂无封面</span>
          </div>
        )}
        <div className="hero-image-overlay" />
      </section>

      <ArticleStatsPanel
        authorAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face"
        authorName="Alex Chen"
        category={article.category?.name ?? "未分类"}
        date={formatArticleDate(article.publishedAt)}
        initialLikes={article.likeCount}
        initialViews={article.viewCount}
        readTime={article.readTimeLabel}
        title={article.title}
      />

      <section className="px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-12">
            <div className="article-content flex-1">
              <div className="prose-chen">
                <MarkdownViewer value={markdown} />
              </div>
            </div>

            <aside className={`
              hidden w-72 flex-shrink-0
              lg:block
            `}>
              <div className="toc-container rounded-2xl border border-white/8 bg-white/3 p-5">
                <h4 className="font-mono-tech mb-4 text-xs tracking-widest text-muted uppercase">页面内容</h4>
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
          <h2 className="mb-8 font-serif text-3xl">相关文章</h2>
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

async function getArticleDetail(slug: string) {
  try {
    return await getPublicArticle(slug);
  } catch (error) {
    if (error instanceof PublicContentApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

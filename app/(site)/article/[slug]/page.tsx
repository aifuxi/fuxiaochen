import Image from "next/image";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blocks/article-card";
import { ArticleStatsPanel } from "@/components/blocks/article-stats-panel";
import { TocNav } from "@/components/blocks/toc-nav";
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

      <section
        className={`
          px-6 pt-2
          sm:px-8
        `}
      >
        <div className="mx-auto max-w-4xl">
          <figure className="overflow-hidden rounded-xl border border-white/8 bg-white/3">
            {article.coverImageUrl ? (
              <Image
                priority={false}
                alt={article.coverImageAlt ?? article.title}
                className={`
                  h-[220px] w-full object-cover
                  md:h-[280px]
                `}
                height={280}
                src={article.coverImageUrl}
                width={1400}
              />
            ) : (
              <div
                className={`
                  flex h-[220px] w-full items-center justify-center bg-white/5
                  md:h-[280px]
                `}
              >
                <span className="font-mono-tech text-xs tracking-widest text-muted uppercase">暂无封面</span>
              </div>
            )}
          </figure>
        </div>
      </section>

      <section
        className={`
          px-6 pt-6 pb-20
          sm:px-8
        `}
      >
        <div
          className={`
            mx-auto grid max-w-6xl gap-10
            lg:grid-cols-[minmax(0,44rem)_16rem] lg:items-start
          `}
        >
          <article
            className="min-w-0"
            data-article-content
          >
            <div className="prose-chen">
              <MarkdownViewer value={markdown} />
            </div>
          </article>

          <aside className={`
            hidden
            lg:block
          `}>
            <TocNav items={toc} />
          </aside>
        </div>
      </section>

      <section
        className={`
          px-6 pb-24
          sm:px-8
        `}
      >
        <div className="mx-auto max-w-6xl">
          <h2
            className={`
              mb-6 font-serif text-2xl
              sm:text-3xl
            `}
          >
            相关文章
          </h2>
          <div
            className={`
              grid gap-6
              md:grid-cols-3
            `}
          >
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

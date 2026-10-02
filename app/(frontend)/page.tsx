import Link from "next/link";

import { ArticleFilters } from "@/components/frontend/article-filters";
import { Pagination } from "@/components/frontend/pagination";
import { postTime } from "@/lib/posts/schema";
import { singleParams, type SearchParams } from "@/lib/public/schema";
import { getPublicTaxonomies, listPublicPosts } from "@/lib/public/service";
import { getPublicSettings } from "@/lib/settings/service";

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [settings, taxonomies, result] = await Promise.all([
    getPublicSettings(),
    getPublicTaxonomies(),
    listPublicPosts(params),
  ]);
  const values = singleParams(params);
  return (
    <main id="main-content" className="site-main site-home">
      <section className="site-intro">
        <p className="site-eyebrow">{settings.authorRole}</p>
        <h1>{settings.title}</h1>
        <p>{settings.subtitle}</p>
      </section>
      <section aria-labelledby="posts-heading" className="site-posts">
        <div className="site-section-heading">
          <h2 id="posts-heading">文章</h2>
          {!result.error && <span>{result.total} 篇</span>}
        </div>
        <ArticleFilters
          key={JSON.stringify(values)}
          q={values.q ?? ""}
          categoryId={values.categoryId ?? ""}
          tagId={values.tagId ?? ""}
          categories={taxonomies.categories}
          tags={taxonomies.tags}
        />
        {(values.q || values.categoryId || values.tagId) && (
          <Link className="site-clear-filter" href="/">
            清除筛选
          </Link>
        )}
        {result.error ? (
          <p className="site-empty" role="alert">
            {result.error} <Link href="/">清除筛选</Link>
          </p>
        ) : (
          <>
            {result.items.length === 0 ? (
              <p className="site-empty">
                {values.q || values.categoryId || values.tagId
                  ? "没有匹配的文章，试试其他关键词或清除筛选。"
                  : "还没有发布文章，之后再来看看。"}
              </p>
            ) : (
              <div className="site-post-list">
                {result.items.map((post) => (
                  <article className="site-post-row" key={post.id}>
                    <div className="site-post-meta">
                      <time dateTime={post.publishedAt ?? undefined}>
                        {postTime(post.publishedAt, true)}
                      </time>
                      {post.category && (
                        <Link href={`/?categoryId=${post.category.id}`}>{post.category.name}</Link>
                      )}
                    </div>
                    <h3>
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h3>
                    {post.tags.length > 0 && (
                      <div className="site-tags">
                        {post.tags.map((tag) => (
                          <Link key={tag.id} href={`/?tagId=${tag.id}`}>
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
            <Pagination path="/" params={params} page={result.page} pageCount={result.pageCount} />
          </>
        )}
      </section>
    </main>
  );
}

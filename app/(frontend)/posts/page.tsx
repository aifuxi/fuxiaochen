import Link from "next/link";

import { ArticleFilters } from "@/components/frontend/article-filters";
import { Pagination } from "@/components/frontend/pagination";
import { postTime } from "@/lib/posts/schema";
import { singleParams, type SearchParams } from "@/lib/public/schema";
import { getPublicTaxonomies, listPublicPosts } from "@/lib/public/service";
export const metadata = { title: "文章" };

export default async function PostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [taxonomies, result] = await Promise.all([getPublicTaxonomies(), listPublicPosts(params)]);
  const values = singleParams(params);
  return (
    <main id="main-content" className="site-main">
      <section aria-labelledby="posts-heading" className="site-posts">
        <header className="site-page-heading site-section-heading">
          <h1 id="posts-heading">文章</h1>
          {!result.error && <span>{result.total} 篇</span>}
        </header>
        <ArticleFilters
          key={JSON.stringify(values)}
          q={values.q ?? ""}
          categoryId={values.categoryId ?? ""}
          tagId={values.tagId ?? ""}
          categories={taxonomies.categories}
          tags={taxonomies.tags}
        />
        {(values.q || values.categoryId || values.tagId) && (
          <Link className="site-clear-filter" href="/posts">
            清除筛选
          </Link>
        )}
        {result.error ? (
          <p className="site-empty" role="alert">
            {result.error} <Link href="/posts">清除筛选</Link>
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
                      {post.isFeatured && <span className="site-post-featured">精选</span>}
                    </div>
                    <div className="site-post-body">
                      <h2>
                        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                      </h2>
                      {post.summary && <p className="site-post-summary">{post.summary}</p>}
                      {(post.category || post.tags.length > 0) && (
                        <div className="site-post-taxonomies">
                          {post.category && (
                            <Link href={`/posts?categoryId=${post.category.id}`}>
                              {post.category.name}
                            </Link>
                          )}
                          {post.tags.map((tag) => (
                            <Link key={tag.id} href={`/posts?tagId=${tag.id}`}>
                              #{tag.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
            <Pagination
              path="/posts"
              params={params}
              page={result.page}
              pageCount={result.pageCount}
            />
          </>
        )}
      </section>
    </main>
  );
}

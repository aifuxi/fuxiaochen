import Link from "next/link";

import { ArticleFilters } from "@/components/frontend/article-filters";
import { ArticleListItem } from "@/components/frontend/article-list-item";
import { Pagination } from "@/components/frontend/pagination";
import { singleParams, type SearchParams } from "@/lib/public/schema";
import { getPublicTaxonomies, listPublicPosts } from "@/lib/public/service";
export const metadata = { title: "文章" };

export default async function PostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const [taxonomies, result] = await Promise.all([getPublicTaxonomies(), listPublicPosts(params)]);
  const values = singleParams(params);
  const isFiltered = Boolean(values.q || values.categoryId || values.tagId);
  return (
    <main id="main-content" className="site-main site-posts-main">
      <section aria-labelledby="posts-heading" className="site-posts">
        <header className="site-page-heading site-posts-heading">
          <h1 id="posts-heading">文章</h1>
          {!result.error && <span className="site-post-count">{result.total} 篇</span>}
        </header>
        <ArticleFilters
          q={values.q ?? ""}
          categoryId={values.categoryId ?? ""}
          tagId={values.tagId ?? ""}
          categories={taxonomies.categories}
          tags={taxonomies.tags}
        />
        {isFiltered && (
          <div className="site-post-results-heading">
            <p>
              {[
                values.q && `搜索“${values.q}”`,
                values.categoryId &&
                  (taxonomies.categories.find((c) => c.id === values.categoryId)?.name ??
                    "分类已不可用"),
                values.tagId &&
                  `#${taxonomies.tags.find((t) => t.id === values.tagId)?.name ?? "标签已不可用"}`,
              ]
                .filter(Boolean)
                .join(" · ")}
              {!result.error && <span> · {result.total} 篇匹配</span>}
            </p>
            <Link className="site-clear-filter" href="/posts">
              清除筛选
            </Link>
          </div>
        )}
        {result.error ? (
          <p className="site-empty" role="alert">
            {result.error} <Link href="/posts">清除筛选</Link>
          </p>
        ) : (
          <>
            {result.items.length === 0 ? (
              <p className="site-empty">
                {isFiltered
                  ? "没有匹配的文章，试试其他关键词或清除筛选。"
                  : "还没有发布文章，之后再来看看。"}
              </p>
            ) : (
              <div className="site-post-list">
                {result.items.map((post) => (
                  <ArticleListItem key={post.id} post={post} />
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

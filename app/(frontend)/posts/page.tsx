import type { Metadata } from "next";

import Link from "next/link";
import { permanentRedirect } from "next/navigation";

import { ArticleFilters } from "@/components/frontend/article-filters";
import { ArticleListItem } from "@/components/frontend/article-list-item";
import { Pagination } from "@/components/frontend/pagination";
import {
  normalizedQueryPath,
  publicPostParams,
  queryNeedsRedirect,
  queryPath,
  singleParams,
  type SearchParams,
} from "@/lib/public/schema";
import { getPublicTaxonomies, listPublicPosts } from "@/lib/public/service";
import { pageMetadata } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";

type Props = { searchParams: Promise<SearchParams> };

async function postsContext(params: SearchParams) {
  const [taxonomies, result] = await Promise.all([getPublicTaxonomies(), listPublicPosts(params)]);
  const rawValues = singleParams(params);
  const normalized = result.error
    ? {
        q: rawValues.q?.trim() || undefined,
        categoryId: rawValues.categoryId || undefined,
        tagId: rawValues.tagId || undefined,
        page: rawValues.page && rawValues.page !== "1" ? rawValues.page : undefined,
      }
    : publicPostParams(result.query, result.page);
  if (queryNeedsRedirect(params, normalized))
    permanentRedirect(normalizedQueryPath("/posts", params, normalized));
  const values = singleParams(normalized);
  const isFiltered = Boolean(values.q || values.categoryId || values.tagId);
  return { taxonomies, result, values, isFiltered, path: queryPath("/posts", normalized) };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [settings, context] = await Promise.all([
    getPublicSettings(),
    postsContext(await searchParams),
  ]);
  const page = context.result.error ? 1 : context.result.page;
  return pageMetadata(settings, {
    title: `${context.isFiltered ? "文章筛选结果" : "文章"}${page > 1 ? ` · 第 ${page} 页` : ""}`,
    description: `阅读 ${settings.title} 的文章，按关键词、分类和标签探索内容。`,
    path: context.path,
    robots: context.isFiltered || context.result.error ? { index: false, follow: true } : undefined,
  });
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { taxonomies, result, values, isFiltered } = await postsContext(params);
  return (
    <main id="main-content" className="site-main">
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

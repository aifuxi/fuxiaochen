import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import type { SearchParams } from "@/lib/public/schema";

import { ArticleBackLink } from "@/components/frontend/article-back-link";
import { ArticleContent } from "@/components/frontend/article-content";
import { JsonLd } from "@/components/frontend/json-ld";
import { articleReturnPath } from "@/lib/frontend/article-return";
import { postTime } from "@/lib/posts/schema";
import { getPublicPost } from "@/lib/public/service";
import { articleJsonLd, articleMetadata } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublicPost((await params).slug);
  if (!post) notFound();
  const settings = await getPublicSettings();
  return articleMetadata(settings, post);
}
export default async function PostPage({ params, searchParams }: Props) {
  const post = await getPublicPost((await params).slug);
  if (!post) notFound();
  const settings = await getPublicSettings();
  const returnPath = articleReturnPath((await searchParams).returnTo);
  return (
    <main data-page-motion id="main-content" className="site-main site-article">
      <JsonLd data={articleJsonLd(settings, post)} />
      <article>
        <ArticleBackLink href={returnPath} />
        <header className="site-article-heading">
          <div className="site-post-meta">
            <span>{settings.authorName}</span>
            <time dateTime={post.publishedAt ?? undefined}>{postTime(post.publishedAt, true)}</time>
            {post.publishedAt && post.updatedAt !== post.publishedAt && (
              <span className="site-updated">更新于 {postTime(post.updatedAt)}</span>
            )}
          </div>
          <h1>{post.title}</h1>
          {post.summary && <p className="site-article-summary">{post.summary}</p>}
          {(post.category || post.tags.length > 0) && (
            <nav className="site-article-taxonomy" aria-label="文章分类和标签">
              {post.category && (
                <Link className="site-category-link" href={`/posts?categoryId=${post.category.id}`}>
                  <span className="min-w-0">{post.category.name}</span>
                </Link>
              )}
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/posts?tagId=${tag.id}`}>
                  #{tag.name}
                </Link>
              ))}
            </nav>
          )}
        </header>
        <ArticleContent content={post.content} />
        <footer className="site-article-end">
          <ArticleBackLink
            href={returnPath}
            text="继续浏览文章"
            direction="forward"
            className="site-article-continue"
          />
        </footer>
      </article>
    </main>
  );
}

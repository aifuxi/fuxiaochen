import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleContent } from "@/components/frontend/article-content";
import { CategoryDot } from "@/components/frontend/category-dot";
import { Comments } from "@/components/frontend/comments";
import { JsonLd } from "@/components/frontend/json-ld";
import { postTime } from "@/lib/posts/schema";
import { listPublicComments } from "@/lib/public/comments";
import { getPublicPost } from "@/lib/public/service";
import { articleJsonLd, articleMetadata } from "@/lib/seo";
import { getPublicSettings } from "@/lib/settings/service";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublicPost((await params).slug);
  if (!post) notFound();
  const settings = await getPublicSettings();
  return articleMetadata(settings, post);
}
export default async function PostPage({ params }: Props) {
  const post = await getPublicPost((await params).slug);
  if (!post) notFound();
  const [comments, settings] = await Promise.all([
    listPublicComments(post.id, 1),
    getPublicSettings(),
  ]);
  return (
    <main id="main-content" className="site-main site-reading">
      <JsonLd data={articleJsonLd(settings, post)} />
      <article>
        <Link className="site-back" href="/posts">
          返回文章列表
        </Link>
        <header className="site-article-heading">
          <div className="site-post-meta">
            <time dateTime={post.publishedAt ?? undefined}>{postTime(post.publishedAt, true)}</time>
            {post.category && (
              <Link className="site-category-link" href={`/posts?categoryId=${post.category.id}`}>
                <CategoryDot color={post.category.color} />
                <span className="min-w-0">{post.category.name}</span>
              </Link>
            )}
          </div>
          <h1>{post.title}</h1>
          {post.tags.length > 0 && (
            <div className="site-tags">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/posts?tagId=${tag.id}`}>
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
          {post.publishedAt && post.updatedAt !== post.publishedAt && (
            <p className="site-updated">更新于 {postTime(post.updatedAt)}</p>
          )}
        </header>
        <ArticleContent content={post.content} />
      </article>
      <Comments
        key={post.id}
        postId={post.id}
        initial={comments}
        enabled={settings.enableComments}
        adminAvatarUrl={settings.avatarUrl}
      />
    </main>
  );
}

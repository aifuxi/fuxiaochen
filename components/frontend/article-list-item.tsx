import Link from "next/link";

import { postTime } from "@/lib/posts/schema";

type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  isFeatured: boolean;
  category: { id: string; name: string; color: string } | null;
  tags: { id: string; name: string }[];
};

export function ArticleListItem({
  post,
  compact = false,
  returnTo,
}: {
  post: Article;
  compact?: boolean;
  returnTo?: string;
}) {
  const Title = compact ? "h3" : "h2";
  const href = `/posts/${post.slug}${returnTo ? `?${new URLSearchParams({ returnTo })}` : ""}`;
  return (
    <article className={`site-post-row${compact ? " site-post-row-compact" : ""}`}>
      <Link
        className="site-post-link"
        href={href}
        aria-labelledby={`post-title-${post.id}`}
        data-article-list-return={returnTo}
      >
        <Title id={`post-title-${post.id}`}>{post.title}</Title>
        {post.summary && <p className="site-post-summary">{post.summary}</p>}
      </Link>
      <div className="site-post-details">
        <span className="site-post-date">
          <time dateTime={post.publishedAt ?? undefined}>{postTime(post.publishedAt, true)}</time>
          {post.isFeatured && <span className="site-post-featured">精选</span>}
        </span>
        {post.category && (
          <Link className="site-category-link" href={`/posts?categoryId=${post.category.id}`}>
            <span className="min-w-0">{post.category.name}</span>
          </Link>
        )}
        {!compact &&
          post.tags.map((tag) => (
            <Link className="site-post-tag-link" key={tag.id} href={`/posts?tagId=${tag.id}`}>
              #{tag.name}
            </Link>
          ))}
      </div>
    </article>
  );
}

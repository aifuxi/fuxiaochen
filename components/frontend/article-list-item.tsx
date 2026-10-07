import Link from "next/link";

import { postTime } from "@/lib/posts/schema";

import { CategoryDot } from "./category-dot";

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

export function ArticleListItem({ post }: { post: Article }) {
  return (
    <article className="site-post-row">
      <Link
        className="site-post-link"
        href={`/posts/${post.slug}`}
        aria-labelledby={`post-title-${post.id}`}
      >
        <h2 id={`post-title-${post.id}`}>{post.title}</h2>
        {post.summary && <p className="site-post-summary">{post.summary}</p>}
      </Link>
      <div className="site-post-details">
        <span className="site-post-date">
          <time dateTime={post.publishedAt ?? undefined}>{postTime(post.publishedAt, true)}</time>
          {post.isFeatured && <span className="site-post-featured">精选</span>}
        </span>
        {post.category && (
          <Link className="site-category-link" href={`/posts?categoryId=${post.category.id}`}>
            <CategoryDot color={post.category.color} />
            <span className="min-w-0">{post.category.name}</span>
          </Link>
        )}
        {post.tags.map((tag) => (
          <Link key={tag.id} href={`/posts?tagId=${tag.id}`}>
            #{tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}

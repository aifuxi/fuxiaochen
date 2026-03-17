import { notFound } from "next/navigation";
import { getBlogBySlugAction } from "@/app/actions/blog";
import BlogContent from "@/components/blog/blog-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { formatSimpleDate } from "@/lib/time";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate SEO metadata
export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBlogBySlugAction(slug);

  if (!result.success || !result.data) {
    return {
      title: "博客未找到",
    };
  }

  const blog = result.data;

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt,
      images: blog.cover ? [blog.cover] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const result = await getBlogBySlugAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const blog = result.data;
  const readingTime = Math.max(1, Math.ceil(blog.content.length / 300));

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Back link */}
      <Link
        href="/blog"
        className={`
          mb-8 inline-block transition-colors duration-200
          hover:opacity-80
        `}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          color: "var(--primary)",
          textDecoration: "none",
        }}
      >
        ← 返回博客列表
      </Link>

      {/* Hero Image */}
      {blog.cover && (
        <div
          className="relative mb-10 w-full overflow-hidden"
          style={{ aspectRatio: "21/9", borderRadius: "0.75rem" }}
        >
          <Image
            src={blog.cover}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 50%, oklch(0.07 0 0 / 0.7) 100%)",
            }}
          />
        </div>
      )}

      {/* Article header */}
      <header className="mb-10 max-w-[680px]">
        {blog.category && (
          <div
            className="mb-3"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "var(--primary)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {blog.category.name}
          </div>
        )}

        <h1
          className="mb-5 font-bold"
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.4rem)",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: "var(--foreground)",
          }}
        >
          {blog.title}
        </h1>

        {/* Meta */}
        <div
          className="mb-5 flex flex-wrap items-center gap-4"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "var(--foreground-subtle)",
          }}
        >
          <time>{formatSimpleDate(new Date(blog.createdAt))}</time>
          <span>·</span>
          <span>{readingTime} 分钟阅读</span>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag.id}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  background: "var(--tag-bg)",
                  color: "var(--tag-fg)",
                  border: "1px solid var(--tag-border)",
                  borderRadius: "0.375rem",
                  padding: "0.2rem 0.6rem",
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 3-column grid */}
      <div className={`
        grid grid-cols-1 gap-12
        lg:grid-cols-[200px_1fr_200px]
      `}>
        {/* Left TOC */}
        <aside className={`
          hidden
          lg:block
        `}>
          <div
            className="sticky"
            style={{ top: "100px" }}
          >
            <div
              className="mb-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--foreground-subtle)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              目录
            </div>
            <div style={{ borderLeft: "2px solid var(--border-subtle)", paddingLeft: "0.75rem" }}>
              <TableOfContents />
            </div>
          </div>
        </aside>

        {/* Center article */}
        <article className="max-w-[680px] min-w-0">
          <div className="article-content">
            <BlogContent content={blog.content} />
          </div>
        </article>

        {/* Right empty column for balance */}
        <div className={`
          hidden
          lg:block
        `} />
      </div>
    </div>
  );
}

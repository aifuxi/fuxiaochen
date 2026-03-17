import Link from "next/link";
import Image from "next/image";
import { getBlogsAction } from "@/app/actions/blog";
import { getCategoriesAction } from "@/app/actions/category";
import { ArrowRight } from "lucide-react";
import { formatSimpleDate } from "@/lib/time";

// Section label component
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--foreground-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.10em",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
    </div>
  );
}

// Hero section
function Hero() {
  return (
    <section className={`
      mx-auto max-w-4xl px-6 py-24 text-center
      md:py-32
    `}>
      {/* Eyebrow */}
      <div
        className="mb-6"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--foreground-subtle)",
          animation: "fade-up 0.6s ease forwards",
        }}
      >
        技术博客 · 学习笔记 · 项目分享
      </div>

      {/* H1 */}
      <h1
        className="mb-6 font-bold"
        style={{
          fontSize: "clamp(2.5rem, 6vw, 3.75rem)",
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          animation: "fade-up 0.6s ease 0.1s both",
        }}
      >
        <span className="block" style={{ color: "var(--foreground)" }}>
          探索技术的
        </span>
        <span className="block" style={{ color: "var(--primary)" }}>
          无限可能
        </span>
      </h1>

      {/* Description */}
      <p
        className="mx-auto mb-10 max-w-xl"
        style={{
          fontSize: "1.1rem",
          color: "var(--foreground-muted)",
          lineHeight: 1.6,
          animation: "fade-up 0.6s ease 0.2s both",
        }}
      >
        记录前端开发与技术探索的点滴，分享学习心得与实践经验
      </p>

      {/* CTAs */}
      <div
        className="flex flex-wrap items-center justify-center gap-4"
        style={{ animation: "fade-up 0.6s ease 0.3s both" }}
      >
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 transition-all duration-300"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            padding: "0.75rem 1.75rem",
            borderRadius: "0.5rem",
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
        >
          开始阅读
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/about"
          className={`
            inline-flex items-center gap-2 transition-all duration-300
            hover:border-[var(--border-hover)]
          `}
          style={{
            border: "1px solid var(--border)",
            color: "var(--foreground-muted)",
            padding: "0.75rem 1.75rem",
            borderRadius: "0.5rem",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          关于作者
        </Link>
      </div>
    </section>
  );
}

// Featured post section
async function FeaturedPost() {
  const result = await getBlogsAction({
    page: 1,
    pageSize: 4,
    published: true,
    sortBy: "createdAt",
    order: "desc",
  });

  if (!result.success || !result.data?.lists?.length) {
    return null;
  }

  const posts = result.data.lists;
  const [firstPost, ...restPosts] = posts as [typeof posts[0], ...typeof posts];

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <SectionLabel>精选文章</SectionLabel>

      {/* Featured card */}
      <Link
        href={`/blog/${firstPost.slug}`}
        className="group mb-8 block"
        style={{ textDecoration: "none" }}
      >
        <div
          className={`
            flex flex-col overflow-hidden transition-all duration-300
            hover:-translate-y-[3px] hover:border-[var(--border-hover)] hover:shadow-[0_8px_32px_oklch(0_0_0/0.3)]
            md:flex-row
          `}
          style={{
            border: "1px solid var(--border)",
            background: "var(--background-subtle)",
            borderRadius: "0.5rem",
          }}
        >
          {/* Image */}
          {firstPost.cover && (
            <div className={`
              relative overflow-hidden
              md:w-2/5
            `} style={{ aspectRatio: "16/10" }}>
              <Image
                src={firstPost.cover}
                alt={firstPost.title}
                fill
                className={`
                  object-cover grayscale transition-all duration-500
                  group-hover:scale-105 group-hover:grayscale-0
                `}
              />
            </div>
          )}
          {!firstPost.cover && (
            <div
              className="md:w-2/5"
              style={{
                aspectRatio: "16/10",
                background: "linear-gradient(135deg, var(--background-elevated), var(--border))",
              }}
            />
          )}

          {/* Content */}
          <div className="flex flex-1 flex-col justify-center p-8">
            <div
              className="mb-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: "var(--primary)",
              }}
            >
              {formatSimpleDate(new Date(firstPost.createdAt))}
              {firstPost.category && ` · ${firstPost.category.name}`}
            </div>
            <h2
              className={`
                mb-3 font-bold transition-colors
                group-hover:text-[var(--primary)]
              `}
              style={{
                fontSize: "1.35rem",
                letterSpacing: "-0.02em",
                color: "var(--foreground)",
                lineHeight: 1.3,
              }}
            >
              {firstPost.title}
            </h2>
            {firstPost.description && (
              <p
                className="mb-4 line-clamp-2"
                style={{ fontSize: "0.95rem", color: "var(--foreground-muted)" }}
              >
                {firstPost.description}
              </p>
            )}
            <div
              className={`
                flex items-center gap-1 transition-all duration-200
                group-hover:gap-2
              `}
              style={{ fontSize: "0.85rem", color: "var(--primary)" }}
            >
              <span>阅读全文</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Link>

      {/* Recent posts rows */}
      {restPosts.length > 0 && (
        <div>
          {restPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group relative flex items-center gap-6 px-4 py-5 transition-all duration-200"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                textDecoration: "none",
              }}
            >
              {/* Left bar */}
              <div
                className={`
                  blog-row-bar
                  group-hover:[transform:scaleY(1)]
                `}
                style={{ transform: "scaleY(0)" }}
              />
              {/* Date */}
              <span
                className={`
                  hidden shrink-0
                  md:block
                `}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.72rem",
                  color: "var(--foreground-subtle)",
                  minWidth: "70px",
                }}
              >
                {formatSimpleDate(new Date(post.createdAt))}
              </span>
              {/* Title + excerpt */}
              <div className="min-w-0 flex-1">
                <div
                  className={`
                    mb-1 font-medium transition-colors
                    group-hover:text-[var(--primary)]
                  `}
                  style={{ fontSize: "1rem", color: "var(--foreground)" }}
                >
                  {post.title}
                </div>
                {post.description && (
                  <div
                    className="line-clamp-1"
                    style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}
                  >
                    {post.description}
                  </div>
                )}
              </div>
              {/* Arrow */}
              <ArrowRight
                className={`
                  h-4 w-4 shrink-0 transition-transform duration-200
                  group-hover:translate-x-[3px]
                `}
                style={{ color: "var(--foreground-subtle)" }}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// Categories section
async function CategoriesSection() {
  const result = await getCategoriesAction({ page: 1, pageSize: 12 });

  if (!result.success || !result.data?.lists?.length) {
    return null;
  }

  const categories = result.data.lists;

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <SectionLabel>探索分类</SectionLabel>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/blog?categoryId=${category.id}`}
            className={`
              transition-all duration-200
              hover:border-[var(--primary)] hover:text-[var(--primary)]
            `}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              background: "var(--tag-bg)",
              color: "var(--tag-fg)",
              border: "1px solid var(--tag-border)",
              borderRadius: "0.375rem",
              padding: "0.35rem 0.75rem",
              textDecoration: "none",
            }}
          >
            {category.name}
            <span className="ml-2 opacity-60">{category.blogCount}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Bottom CTA
function BottomCTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div
        className="relative overflow-hidden px-8 py-16 text-center"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--primary-glow) 0%, var(--background-elevated) 100%)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, var(--primary-glow), transparent)",
          }}
        />
        <div className="relative">
          <h2
            className="mb-4 font-bold"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            发现更多精彩内容
          </h2>
          <p
            className="mx-auto mb-8 max-w-md"
            style={{ color: "var(--foreground-muted)", fontSize: "1rem" }}
          >
            探索技术文章、学习笔记和项目分享
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 transition-all duration-300"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              padding: "0.75rem 1.75rem",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            浏览全部文章
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  return (
    <div>
      <Hero />
      <div style={{ height: "1px", background: "linear-gradient(to right, transparent, var(--border-subtle), transparent)" }} />
      <FeaturedPost />
      <CategoriesSection />
      <BottomCTA />
    </div>
  );
}

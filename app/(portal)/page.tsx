import { Suspense } from "react";
import { getBlogsAction } from "@/app/actions/blog";
import { BlogListItemSkeleton } from "@/components/blog/blog-list-skeleton";
import { Hero } from "@/components/portal/hero";
import { BlogCard } from "@/components/blog/blog-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600; // Revalidate every hour

function BlogListSkeleton() {
  return (
    <div className={`
      grid grid-cols-1 gap-8
      md:grid-cols-2
      lg:grid-cols-3
    `}>
      {Array.from({ length: 6 }).map((_, i) => (
        <BlogListItemSkeleton key={i} />
      ))}
    </div>
  );
}

async function BlogList() {
  const { data } = await getBlogsAction({
    page: 1,
    pageSize: 6,
    order: "desc",
    sortBy: "createdAt",
  });

  const blogs = data?.lists || [];

  return (
    <div className={`
      grid grid-cols-1 gap-8
      md:grid-cols-2
      lg:grid-cols-3
    `}>
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          title={blog.title}
          excerpt={blog.description}
          tags={blog.tags?.map((t) => t.name) || []}
          date={
            blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString()
              : ""
          }
          slug={blog.slug}
          cover={blog.cover}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />

      <main className="mx-auto max-w-7xl px-4 pb-20">
        {/* Blog Section */}
        <section id="blog" className="space-y-12">
          <div className={`
            flex flex-col justify-between gap-6
            md:flex-row md:items-end
          `}>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--text-color)]">
                最新 <span className="text-[var(--accent-color)]">文章</span>
              </h2>
              <p className="text-[var(--text-color-secondary)]">
                探索技术、设计以及两者之间的一切。
              </p>
            </div>

            <Link
              href="/blog"
              className={`
                group inline-flex items-center gap-1 font-medium text-[var(--accent-color)] transition-colors
                hover:text-[var(--accent-color)]/80
              `}
            >
              查看归档 <ArrowRight className={`
                h-4 w-4 transition-transform
                group-hover:translate-x-1
              `} />
            </Link>
          </div>

          <Suspense fallback={<BlogListSkeleton />}>
            <BlogList />
          </Suspense>
        </section>
      </main>
    </>
  );
}

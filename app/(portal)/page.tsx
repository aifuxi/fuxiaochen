import { Suspense } from "react";

import { getBlogsAction } from "@/app/actions/blog";

import { BlogListItemSkeleton } from "@/components/blog/blog-list-skeleton";
import { GlitchHero } from "@/components/cyberpunk/glitch-hero";
import { NeonBlogCard } from "@/components/cyberpunk/neon-blog-card";

export const revalidate = 3600; // Revalidate every hour

function BlogListSkeleton() {
  return (
    <div
      className={`
        grid grid-cols-1 gap-8
        md:grid-cols-2
        lg:grid-cols-3
      `}
    >
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
    <div
      className={`
        grid grid-cols-1 gap-8
        md:grid-cols-2
        lg:grid-cols-3
      `}
    >
      {blogs.map((blog) => (
        <NeonBlogCard
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
      <GlitchHero />

      <main className="mx-auto max-w-7xl space-y-32 px-4 pb-20">
        {/* Blog Section */}
        <section id="blog" className="space-y-12">
          <div
            className={`
              flex flex-col justify-between gap-6
              md:flex-row md:items-end
            `}
          >
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-wider text-white uppercase">
                最新 <span className="text-neon-cyan">发布</span>
              </h2>
              <p className="font-mono text-sm text-gray-400">
                /// 正在访问档案库...【读取数据流】
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-neon-cyan to-transparent opacity-50" />

          <Suspense fallback={<BlogListSkeleton />}>
            <BlogList />
          </Suspense>
        </section>
      </main>
    </>
  );
}

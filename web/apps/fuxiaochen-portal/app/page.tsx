import { Suspense } from "react";

import { BlogListItemSkeleton } from "@/components/blog/blog-list-skeleton";
import { AboutMe } from "@/components/cyberpunk/about-me";
import { Changelog } from "@/components/cyberpunk/changelog";
import { GlitchHero } from "@/components/cyberpunk/glitch-hero";
import { NeonBlogCard } from "@/components/cyberpunk/neon-blog-card";

import { getBlogList } from "@/api/blog";

export const revalidate = 3600; // Revalidate every hour

function BlogListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <BlogListItemSkeleton key={i} />
      ))}
    </div>
  );
}

async function BlogList() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const { lists: blogs } = await getBlogList({
    page: 1,
    pageSize: 6,
    featuredStatus: "featured",
    order: "desc",
    sortBy: "createdAt",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

export default async function HomePage() {
  const { lists: blogs } = await getBlogList({
    page: 1,
    pageSize: 6,
    featuredStatus: "featured",
    order: "desc",
    sortBy: "createdAt",
  });

  return (
    <>
      <GlitchHero />

      <main className="max-w-7xl mx-auto px-4 pb-20 space-y-32">
        {/* Blog Section */}
        <section id="blog" className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white uppercase tracking-wider">
                最新 <span className="text-neon-cyan">发布</span>
              </h2>
              <p className="text-gray-400 font-mono text-sm">
                /// ACCESSING_ARCHIVES... [READING_DATA_STREAM]
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-neon-cyan to-transparent opacity-50" />

          <Suspense fallback={<BlogListSkeleton />}>
            <BlogList />
          </Suspense>
        </section>

        {/* Info Grid */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AboutMe />
          <div id="changelog">
            <Changelog />
          </div>
        </section>
      </main>
    </>
  );
}

import { Suspense } from "react";

import Link from "next/link";

import { BlogList } from "@/components/blog/blog-list";
import { BlogListSkeleton } from "@/components/blog/blog-list-skeleton";

import { getCategoryList } from "@/api/category";
import { getTagList } from "@/api/tag";

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const categorySlug = params.category;
  const tagSlug = params.tag;
  const pageSize = 9;

  // 1. Fetch Categories and Tags for sidebar display
  const [categoriesData, tagsData] = await Promise.all([
    getCategoryList({ page: 1, pageSize: 100 }),
    getTagList({ page: 1, pageSize: 100 }),
  ]);

  return (
    <div className="min-h-screen bg-cyber-black text-white font-body selection:bg-neon-cyan selection:text-black">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] pointer-events-none bg-[length:100%_2px,3px_100%] animate-scanline" />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-16 relative">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter uppercase font-display glitch-text"
            data-text="Transmission_Log"
          >
            Transmission_Log
          </h1>
          <p className="text-neon-cyan/80 font-mono text-lg max-w-2xl">
            /// ACCESSING_SECURE_ARCHIVES
            <br />
            /// DECRYPTING_LATEST_PROTOCOLS...
          </p>
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-neon-purple/20 blur-[100px] rounded-full pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar / Filters */}
          <aside className="lg:col-span-1 space-y-8 lg:sticky lg:top-32 lg:h-fit lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto custom-scrollbar pr-1">
            {/* Categories */}
            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <h3 className="text-neon-cyan font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                System_Categories
              </h3>
              <div className="space-y-2">
                <Link
                  href={tagSlug ? `/blog?tag=${tagSlug}` : "/blog"}
                  className={`block px-3 py-2 rounded transition-all duration-300 ${!categorySlug ? "bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  All_Systems
                </Link>
                {categoriesData.lists.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}${tagSlug ? `&tag=${tagSlug}` : ""}`}
                    className={`block px-3 py-2 rounded transition-all duration-300 ${categorySlug === cat.slug ? "bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    {cat.name}{" "}
                    <span className="text-xs opacity-50 ml-1">
                      [{cat.blogCount}]
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <h3 className="text-neon-purple font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-purple rounded-full animate-pulse" />
                Data_Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={
                    categorySlug ? `/blog?category=${categorySlug}` : "/blog"
                  }
                  className={`text-xs uppercase px-2 py-1 rounded border transition-all duration-300 ${!tagSlug ? "border-neon-purple text-neon-purple bg-neon-purple/10" : "border-white/10 text-gray-500 hover:border-neon-purple/50 hover:text-white"}`}
                >
                  ALL
                </Link>
                {tagsData.lists.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}${categorySlug ? `&category=${categorySlug}` : ""}`}
                    className={`text-xs uppercase px-2 py-1 rounded border transition-all duration-300 ${tagSlug === tag.slug ? "border-neon-purple text-neon-purple bg-neon-purple/10" : "border-white/10 text-gray-500 hover:border-neon-purple/50 hover:text-white"}`}
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Blog Grid */}
          <div className="lg:col-span-3">
            <Suspense
              key={currentPage + (categorySlug || "") + (tagSlug || "")}
              fallback={<BlogListSkeleton />}
            >
              <BlogList
                page={currentPage}
                pageSize={pageSize}
                category={categorySlug}
                tag={tagSlug}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

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
  const pageSize = 10;

  // 1. Fetch Categories and Tags for sidebar display
  const [categoriesData, tagsData] = await Promise.all([
    getCategoryList({ page: 1, pageSize: 100 }),
    getTagList({ page: 1, pageSize: 100 }),
  ]);

  return (
    <div
      className={`
        min-h-screen bg-cyber-black font-body text-white
        selection:bg-neon-cyan selection:text-black
      `}
    >
      <main
        className={`
          mx-auto max-w-full px-4 pt-32 pb-20
          lg:max-w-7xl
        `}
      >
        {/* Header Section */}
        <div className="relative mb-16">
          <h1
            className={`
              glitch-text mb-4 font-display text-5xl font-bold tracking-tighter break-all text-white uppercase
              md:text-7xl
            `}
            data-text="Transmission_Log"
          >
            传输日志 / Transmission_Log
          </h1>
          <p className="max-w-2xl font-mono text-lg text-neon-cyan/80">
            /// ACCESSING_SECURE_ARCHIVES... 正在访问安全档案
            <br />
            /// DECRYPTING_LATEST_PROTOCOLS... 正在解密最新协议...
          </p>
          <div
            className={`
              pointer-events-none absolute -top-10 -right-10 h-64 w-64 rounded-full bg-neon-purple/20 blur-[100px]
            `}
          />
        </div>

        <div
          className={`
            grid grid-cols-1 gap-12
            lg:grid-cols-4
          `}
        >
          {/* Sidebar / Filters */}
          <aside
            className={`
              custom-scrollbar space-y-8 pr-1
              lg:sticky lg:top-32 lg:col-span-1 lg:h-fit lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto
            `}
          >
            {/* Categories */}
            <div className="glass-panel rounded-xl border border-white/10 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold tracking-wider text-neon-cyan uppercase">
                <span className="h-2 w-2 animate-pulse rounded-full bg-neon-cyan" />
                系统分类 / System_Categories
              </h3>
              <div className="space-y-2">
                <Link
                  href={tagSlug ? `/blog?tag=${tagSlug}` : "/blog"}
                  className={`
                    block rounded px-3 py-2 transition-all duration-300
                    ${
                      !categorySlug
                        ? `border-l-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan`
                        : `
                          text-gray-400
                          hover:bg-white/5 hover:text-white
                        `
                    }
                  `}
                >
                  所有系统 / All_Systems
                </Link>
                {categoriesData?.lists?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}${tagSlug ? `&tag=${tagSlug}` : ""}`}
                    className={`
                      block rounded px-3 py-2 transition-all duration-300
                      ${
                        categorySlug === cat.slug
                          ? `border-l-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan`
                          : `
                            text-gray-400
                            hover:bg-white/5 hover:text-white
                          `
                      }
                    `}
                  >
                    {cat.name}{" "}
                    <span className="ml-1 text-xs opacity-50">
                      [{cat.blogCount}]
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="glass-panel rounded-xl border border-white/10 p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold tracking-wider text-neon-purple uppercase">
                <span className="h-2 w-2 animate-pulse rounded-full bg-neon-purple" />
                数据标签 / Data_Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={
                    categorySlug ? `/blog?category=${categorySlug}` : "/blog"
                  }
                  className={`
                    rounded border px-2 py-1 text-xs uppercase transition-all duration-300
                    ${
                      !tagSlug
                        ? `border-neon-purple bg-neon-purple/10 text-neon-purple`
                        : `
                          border-white/10 text-gray-500
                          hover:border-neon-purple/50 hover:text-white
                        `
                    }
                  `}
                >
                  全部 / ALL
                </Link>
                {tagsData?.lists?.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}${categorySlug ? `&category=${categorySlug}` : ""}`}
                    className={`
                      rounded border px-2 py-1 text-xs uppercase transition-all duration-300
                      ${
                        tagSlug === tag.slug
                          ? `border-neon-purple bg-neon-purple/10 text-neon-purple`
                          : `
                            border-white/10 text-gray-500
                            hover:border-neon-purple/50 hover:text-white
                          `
                      }
                    `}
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

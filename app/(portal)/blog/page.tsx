import { Suspense } from "react";
import Link from "next/link";
import { getCategoriesAction } from "@/app/actions/category";
import { getTagsAction } from "@/app/actions/tag";
import { BlogList } from "@/components/blog/blog-list";
import { BlogListSkeleton } from "@/components/blog/blog-list-skeleton";
import { GlassCard } from "@/components/ui/glass-card";

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
  const [{ data: categoriesData }, { data: tagsData }] = await Promise.all([
    getCategoriesAction({ page: 1, pageSize: 100 }),
    getTagsAction({ page: 1, pageSize: 100 }),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <main className={`
        mx-auto max-w-full px-4 pt-32 pb-20
        lg:max-w-7xl
      `}>
        {/* Header Section */}
        <div className="relative mb-16 space-y-4">
          <h1 className={`
            text-4xl font-bold tracking-tight text-[var(--text-color)]
            md:text-5xl
          `}>
            Blog Archive
          </h1>
          <p className="max-w-2xl text-lg text-[var(--text-color-secondary)]">
            Explore thoughts, tutorials, and insights on software development.
          </p>
        </div>

        <div className={`
          grid grid-cols-1 gap-12
          lg:grid-cols-4
        `}>
          {/* Sidebar / Filters */}
          <aside className={`
            custom-scrollbar space-y-8
            lg:sticky lg:top-32 lg:col-span-1 lg:h-fit lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto
          `}>
            {/* Categories */}
            <GlassCard className="p-6">
              <h3 className="mb-4 font-bold text-[var(--text-color)]">
                Categories
              </h3>
              <div className="space-y-1">
                <Link
                  href={tagSlug ? `/blog?tag=${tagSlug}` : "/blog"}
                  className={`
                    block rounded-lg px-3 py-2 text-sm transition-all duration-200
                    ${
                      !categorySlug
                        ? "bg-[var(--accent-color)] font-medium text-white"
                        : `
                          text-[var(--text-color-secondary)]
                          hover:bg-[var(--glass-border)] hover:text-[var(--text-color)]
                        `
                    }
                  `}
                >
                  All Categories
                </Link>
                {categoriesData?.lists?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}${tagSlug ? `&tag=${tagSlug}` : ""}`}
                    className={`
                      flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200
                      ${
                        categorySlug === cat.slug
                          ? "bg-[var(--accent-color)] font-medium text-white"
                          : `
                            text-[var(--text-color-secondary)]
                            hover:bg-[var(--glass-border)] hover:text-[var(--text-color)]
                          `
                      }
                    `}
                  >
                    <span>{cat.name}</span>
                    <span className={`
                      text-xs
                      ${categorySlug === cat.slug ? "opacity-80" : "opacity-50"}
                    `}>
                      {cat.blogCount}
                    </span>
                  </Link>
                ))}
              </div>
            </GlassCard>

            {/* Tags */}
            <GlassCard className="p-6">
              <h3 className="mb-4 font-bold text-[var(--text-color)]">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={categorySlug ? `/blog?category=${categorySlug}` : "/blog"}
                  className={`
                    rounded-full px-3 py-1 text-xs transition-all duration-200
                    ${
                      !tagSlug
                        ? "bg-[var(--accent-color)] text-white"
                        : `
                          bg-[var(--glass-border)] text-[var(--text-color-secondary)]
                          hover:bg-[var(--glass-border)] hover:text-[var(--text-color)] hover:brightness-95
                        `
                    }
                  `}
                >
                  All
                </Link>
                {tagsData?.lists?.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}${categorySlug ? `&category=${categorySlug}` : ""}`}
                    className={`
                      rounded-full px-3 py-1 text-xs transition-all duration-200
                      ${
                        tagSlug === tag.slug
                          ? "bg-[var(--accent-color)] text-white"
                          : `
                            bg-[var(--glass-border)] text-[var(--text-color-secondary)]
                            hover:bg-[var(--glass-border)] hover:text-[var(--text-color)] hover:brightness-95
                          `
                      }
                    `}
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </GlassCard>
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

import Link from "next/link";
import { format } from "date-fns";
import { getBlogsAction } from "@/app/actions/blog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BlogCard } from "@/components/blog/blog-card";
import { GlassCard } from "@/components/ui/glass-card";
import { RotateCcw } from "lucide-react";

interface BlogListProps {
  page: number;
  pageSize: number;
  category?: string;
  tag?: string;
}

export async function BlogList({
  page,
  pageSize,
  category,
  tag,
}: BlogListProps) {
  const currentPage = Number(page) || 1;

  const { data } = await getBlogsAction({
    page: currentPage,
    pageSize,
    categoryId: category,
    tagId: tag,
  });

  const lists = data?.lists || [];
  const total = data?.total || 0;

  const totalPages = Math.ceil(total / pageSize);
  const blogs = lists;

  return (
    <>
      {blogs.length > 0 ? (
        <div className={`
          mb-12 grid animate-in grid-cols-1 gap-8 duration-500 fade-in slide-in-from-bottom-4
          md:grid-cols-2
        `}>
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              title={blog.title}
              excerpt={blog.description}
              tags={blog.tags?.map((t) => t.name) || []}
              date={
                blog.publishedAt
                  ? format(new Date(blog.publishedAt), "yyyy-MM-dd")
                  : "Draft"
              }
              slug={blog.slug}
              cover={blog.cover}
            />
          ))}
        </div>
      ) : (
        <GlassCard className={`
          flex animate-in flex-col items-center justify-center py-20 text-center duration-300 zoom-in-95 fade-in
        `}>
          <h3 className="mb-2 text-2xl font-bold text-[var(--text-color)]">
            No posts found
          </h3>
          <p className="mb-6 text-[var(--text-color-secondary)]">
            Try adjusting your filters or search criteria.
          </p>
          {(category || tag) && (
            <Link
              href="/blog"
              className={`
                inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] px-6 py-2 text-sm
                font-medium transition-colors
                hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white
              `}
            >
              <RotateCcw className="h-4 w-4" /> Reset Filters
            </Link>
          )}
        </GlassCard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      page > 1
                        ? `/blog?page=${page - 1}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`
                        : "#"
                    }
                    className={`
                      hover:text-[var(--accent-color)]
                      dark:text-white
                    `}
                  />
                </PaginationItem>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/blog?page=${page}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`}
                      isActive={currentPage === page}
                      className={
                        currentPage === page
                          ? `
                            bg-[var(--accent-color)] text-white
                            hover:bg-[var(--accent-color)]/90
                          `
                          : `
                            hover:bg-[var(--glass-bg)]
                            dark:text-gray-400 dark:hover:text-white
                          `
                      }
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href={
                      page < totalPages
                        ? `/blog?page=${page + 1}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`
                        : "#"
                    }
                    className={`
                      hover:text-[var(--accent-color)]
                      dark:text-white
                    `}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}

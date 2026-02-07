import Link from "next/link";
import { format } from "date-fns";
import { RotateCcw } from "lucide-react";
import { getBlogsAction } from "@/app/actions/blog";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BlogCard } from "@/components/blog/blog-card";

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
        <div
          className={`
            mb-12 grid animate-in grid-cols-1 gap-8 duration-500 fade-in slide-in-from-bottom-4
            md:grid-cols-2
          `}
        >
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              title={blog.title}
              excerpt={blog.description}
              tags={blog.tags?.map((t) => t.name) || []}
              date={
                blog.publishedAt
                  ? format(new Date(blog.publishedAt), "yyyy-MM-dd")
                  : "草稿"
              }
              slug={blog.slug}
              cover={blog.cover}
            />
          ))}
        </div>
      ) : (
        <GlassCard
          className={`
            flex animate-in flex-col items-center justify-center py-20 text-center duration-300 zoom-in-95 fade-in
          `}
        >
          <h3 className="mb-2 text-2xl font-bold text-[var(--text-color)]">
            暂无文章
          </h3>
          <p className="mb-6 text-[var(--text-color-secondary)]">
            尝试调整筛选条件或稍后再试。
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
              <RotateCcw className="h-4 w-4" /> 重置筛选
            </Link>
          )}
        </GlassCard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center">
          <Pagination
            className={`
              w-fit rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 backdrop-blur-md
            `}
          >
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={
                    page > 1
                      ? `/blog?page=${page - 1}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`
                      : "#"
                  }
                  aria-disabled={page <= 1}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : `
                        transition-colors
                        hover:bg-gray-100 hover:text-[var(--accent-color)]
                        dark:hover:bg-[var(--accent-color)]/10
                      `
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href={`/blog?page=${p}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`}
                    isActive={currentPage === p}
                    className={
                      currentPage === p
                        ? `
                          border-transparent bg-[var(--accent-color)] text-white shadow-sm
                          hover:bg-[var(--accent-color)]/90 hover:text-white
                        `
                        : `
                          transition-colors
                          hover:bg-gray-100 hover:text-[var(--accent-color)]
                          dark:hover:bg-[var(--accent-color)]/10
                        `
                    }
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href={
                    page < totalPages
                      ? `/blog?page=${page + 1}${category ? `&category=${category}` : ""}${tag ? `&tag=${tag}` : ""}`
                      : "#"
                  }
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : `
                        transition-colors
                        hover:bg-gray-100 hover:text-[var(--accent-color)]
                        dark:hover:bg-[var(--accent-color)]/10
                      `
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}

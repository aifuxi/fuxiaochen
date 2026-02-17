import Link from "next/link";
import { format } from "date-fns";
import { RotateCcw } from "lucide-react";
import { getBlogsAction } from "@/app/actions/blog";
import { AppleCard } from "@/components/ui/glass-card";
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
              date={format(new Date(blog.updatedAt), "yyyy-MM-dd")}
              slug={blog.slug}
              cover={blog.cover}
            />
          ))}
        </div>
      ) : (
        <AppleCard
          className={`
            flex animate-in flex-col items-center justify-center py-20 text-center duration-300 zoom-in-95 fade-in
          `}
        >
          <h3 className="mb-2 text-2xl font-bold text-text">
            暂无文章
          </h3>
          <p className="mb-6 text-text-secondary">
            尝试调整筛选条件或稍后再试。
          </p>
          {(category || tag) && (
            <Link
              href="/blog"
              className={`
                inline-flex items-center gap-2 rounded-full border border-border px-6 py-2 text-sm font-medium
                transition-colors
                hover:border-accent hover:bg-accent hover:text-white
              `}
            >
              <RotateCcw className="h-4 w-4" /> 重置筛选
            </Link>
          )}
        </AppleCard>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center">
          <Pagination
            className={`w-fit rounded-full border border-border bg-surface px-4 py-2`}
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
                        hover:bg-gray-100 hover:text-accent
                        dark:hover:bg-accent/10
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
                          border-transparent bg-accent text-white shadow-sm
                          hover:bg-accent/90 hover:text-white
                        `
                        : `
                          transition-colors
                          hover:bg-gray-100 hover:text-accent
                          dark:hover:bg-accent/10
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
                        hover:bg-gray-100 hover:text-accent
                        dark:hover:bg-accent/10
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

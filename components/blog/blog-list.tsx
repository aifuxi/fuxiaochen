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

import { NeonBlogCard } from "@/components/cyberpunk/neon-blog-card";

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
            mb-12 grid animate-in grid-cols-1 gap-6 duration-500 fade-in slide-in-from-bottom-4
            md:grid-cols-2
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
                  ? format(new Date(blog.publishedAt), "yyyy-MM-dd")
                  : "未发布 / Unpublished"
              }
              slug={blog.slug}
              cover={blog.cover}
            />
          ))}
        </div>
      ) : (
        <div
          className={`
            glass-panel flex animate-in flex-col items-center justify-center rounded-xl border-2 border-dashed
            border-white/10 py-20 text-center duration-300 zoom-in-95 fade-in
          `}
        >
          <h3 className="mb-2 text-2xl font-bold text-gray-500">
            未发现传输内容 / No Transmissions Found
          </h3>
          <p className="mb-6 text-gray-600">
            尝试调整您的信号过滤器。 / Try adjusting your signal filters.
          </p>
          {(category || tag) && (
            <Link
              href="/blog"
              className={`
                flex items-center gap-2 rounded border border-neon-cyan/50 px-6 py-2 font-mono text-sm tracking-wider
                text-neon-cyan uppercase transition-all duration-300
                hover:bg-neon-cyan/10 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]
              `}
            >
              <span className="text-lg">↺</span> 重置信号 / Reset_Signal
            </Link>
          )}
        </div>
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
                      border-none text-neon-cyan
                      hover:bg-neon-cyan/10 hover:text-neon-cyan
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
                          ? "border-neon-cyan bg-neon-cyan text-black"
                          : `
                            border-transparent text-gray-400
                            hover:bg-white/10 hover:text-white
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
                      border-none text-neon-cyan
                      hover:bg-neon-cyan/10 hover:text-neon-cyan
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

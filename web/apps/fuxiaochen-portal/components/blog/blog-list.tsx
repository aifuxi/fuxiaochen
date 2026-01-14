import Link from "next/link";

import { format } from "date-fns";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { NeonBlogCard } from "@/components/cyberpunk/neon-blog-card";

import { getBlogList } from "@/api/blog";

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

  const blogsData = await getBlogList({
    page: currentPage,
    pageSize,
    category,
    tags: tag ? [tag] : undefined,
  });

  const totalPages = Math.ceil(blogsData.total / pageSize);

  return (
    <>
      {blogsData.lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {blogsData.lists.map((blog) => (
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
        <div className="text-center py-20 glass-panel rounded-xl border-white/10 border-dashed border-2 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-2xl font-bold text-gray-500 mb-2">
            未发现传输内容 / No Transmissions Found
          </h3>
          <p className="text-gray-600 mb-6">
            尝试调整您的信号过滤器。 / Try adjusting your signal filters.
          </p>
          {(category || tag) && (
            <Link
              href="/blog"
              className="px-6 py-2 border border-neon-cyan/50 text-neon-cyan rounded hover:bg-neon-cyan/10 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all duration-300 font-mono text-sm uppercase tracking-wider flex items-center gap-2"
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
                    className="text-neon-cyan hover:text-neon-cyan hover:bg-neon-cyan/10 border-none"
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
                          ? "bg-neon-cyan text-black border-neon-cyan"
                          : "text-gray-400 hover:text-white hover:bg-white/10 border-transparent"
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
                    className="text-neon-cyan hover:text-neon-cyan hover:bg-neon-cyan/10 border-none"
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

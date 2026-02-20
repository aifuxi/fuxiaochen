import Link from "next/link";
import type { Blog } from "@/types/blog";
import { BlogCard } from "./blog-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { FileText, RotateCcw } from "lucide-react";

interface BlogListProps {
  blogs: Blog[];
  total: number;
  currentPage: number;
  pageSize: number;
  baseUrl: string;
}

export function BlogList({
  blogs,
  total,
  currentPage,
  pageSize,
  baseUrl,
}: BlogListProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (blogs.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileText />
          </EmptyMedia>
          <EmptyTitle>暂无博客</EmptyTitle>
          <EmptyDescription>没有找到符合条件的博客文章</EmptyDescription>
        </EmptyHeader>
        <Link
          href="/blog"
          className={`
            inline-flex items-center gap-2 rounded-full bg-surface/50 px-4 py-2 text-sm font-medium text-text-secondary
            transition-all duration-200
            hover:bg-surface hover:text-text
          `}
        >
          <RotateCcw className="h-4 w-4" />
          重置筛选
        </Link>
      </Empty>
    );
  }

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("page", page.toString());
    return `/blog?${url.searchParams.toString()}`;
  };

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* 博客列表 */}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm text-text-secondary">共 {total} 篇博客</span>
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={getPageUrl(currentPage - 1)} />
                </PaginationItem>
              )}

              {getVisiblePages().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href={getPageUrl(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={getPageUrl(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

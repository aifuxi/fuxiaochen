import { getChangelogsAction } from "@/app/actions/changelog";
import { AppleCard } from "@/components/ui/glass-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import BlogContent from "@/components/blog/blog-content";
import { formatSimpleDate } from "@/lib/time";

interface ChangelogPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ChangelogPage({
  searchParams,
}: ChangelogPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const pageSize = 10;

  const { data } = await getChangelogsAction({
    page: currentPage,
    pageSize: pageSize,
  });

  const lists = data?.lists || [];
  const total = data?.total || 0;

  const totalPages = Math.ceil(total / pageSize);
  const changelogs = lists;
  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto max-w-4xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="relative mb-16 space-y-4 text-center">
          <h1 className={`
            text-4xl font-bold tracking-tight text-text
            md:text-5xl
          `}>
            更新日志
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-text-secondary">
            记录平台的演进与更新历程。
          </p>
        </div>

        {/* Changelog Timeline */}
        <div className={`
          relative space-y-12
          before:absolute before:top-2 before:left-0 before:h-full before:w-px before:bg-border
          md:before:left-[12.5rem]
        `}>
          {changelogs.length > 0 ? (
            changelogs.map((log) => (
              <div
                key={log.id}
                className={`
                  relative flex flex-col gap-6 pl-6
                  md:flex-row md:gap-24 md:pl-0
                `}
              >
                {/* Timestamp & Version Marker */}
                <div
                  className={`
                    flex shrink-0 flex-col items-start gap-1
                    md:w-40 md:items-end
                  `}
                >
                  <span className={`
                    text-xl font-bold text-text
                    md:text-2xl
                  `}>
                    {log.version}
                  </span>
                  <time className="text-sm text-text-secondary">
                    {formatSimpleDate(new Date(log.date || log.createdAt))}
                  </time>
                  {/* Timeline Dot */}
                  <div
                    className={`
                      absolute top-2 left-[-5px] h-3 w-3 rounded-full border-2 border-bg bg-accent ring-2 ring-border
                      md:top-2.5 md:left-[12.125rem]
                    `}
                  />
                </div>

                {/* Content Card */}
                <AppleCard className={`
                  flex-1 p-6
                  md:p-8
                `}>
                  <BlogContent content={log.content} />
                </AppleCard>
              </div>
            ))
          ) : (
            <div className={`
              pl-8
              md:pl-44
            `}>
              <AppleCard className="py-20 text-center">
                <h3 className="mb-2 text-2xl font-bold text-text">
                  暂无更新记录
                </h3>
                <p className="text-text-secondary">
                  项目刚刚起步，敬请期待！
                </p>
              </AppleCard>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-20 flex justify-center">
            <Pagination
              className={`w-fit rounded-full border border-border bg-surface px-4 py-2`}
            >
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      currentPage > 1
                        ? `/changelog?page=${currentPage - 1}`
                        : "#"
                    }
                    aria-disabled={currentPage <= 1}
                    className={
                      currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : `
                          transition-colors
                          hover:bg-gray-100 hover:text-accent
                          dark:hover:bg-accent/10
                        `
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`/changelog?page=${page}`}
                        isActive={currentPage === page}
                        className={
                          currentPage === page
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
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href={
                      currentPage < totalPages
                        ? `/changelog?page=${currentPage + 1}`
                        : "#"
                    }
                    aria-disabled={currentPage >= totalPages}
                    className={
                      currentPage >= totalPages
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
      </main>
    </div>
  );
}

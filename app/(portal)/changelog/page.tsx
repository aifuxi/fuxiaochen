import { format } from "date-fns";
import { getChangelogsAction } from "@/app/actions/changelog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import BlogContent from "@/components/blog/blog-content";
import { GlassCard } from "@/components/ui/glass-card";

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
    <div className="min-h-screen bg-[var(--bg-color)]">
      <main className="mx-auto max-w-4xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="relative mb-16 space-y-4">
          <h1 className={`
            text-4xl font-bold tracking-tight text-[var(--text-color)]
            md:text-5xl
          `}>
            Changelog
          </h1>
          <p className="max-w-2xl text-lg text-[var(--text-color-secondary)]">
            Tracking the evolution and updates of the platform.
          </p>
        </div>

        {/* Changelog Timeline */}
        <div className="space-y-8">
          {changelogs.length > 0 ? (
            changelogs.map((log) => (
              <GlassCard key={log.id} className="p-8">
                <div className={`
                  mb-6 flex flex-col gap-4 border-b border-[var(--glass-border)] pb-4
                  md:flex-row md:items-baseline md:justify-between
                `}>
                  <div className="flex items-center gap-3">
                    <span className={`
                      inline-flex items-center rounded-full bg-[var(--accent-color)]/10 px-3 py-1 text-sm font-medium
                      text-[var(--accent-color)]
                    `}>
                      {log.version}
                    </span>
                    <time className="text-sm text-[var(--text-color-secondary)]">
                      {format(new Date(log.date || log.createdAt), "yyyy-MM-dd")}
                    </time>
                  </div>
                </div>

                <div className={`
                  prose prose-gray
                  dark:prose-invert
                  max-w-none
                `}>
                  <BlogContent content={log.content} />
                </div>
              </GlassCard>
            ))
          ) : (
            <GlassCard className="py-20 text-center">
              <h3 className="mb-2 text-2xl font-bold text-[var(--text-color)]">
                No logs found
              </h3>
              <p className="text-[var(--text-color-secondary)]">
                The changelog is currently empty.
              </p>
            </GlassCard>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={`/changelog?page=${currentPage - 1}`}
                      className={`
                        hover:bg-[var(--glass-bg)]
                        dark:text-gray-400 dark:hover:text-white
                      `}
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`/changelog?page=${page}`}
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
                      href={`/changelog?page=${currentPage + 1}`}
                      className={`
                        hover:bg-[var(--glass-bg)]
                        dark:text-gray-400 dark:hover:text-white
                      `}
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}

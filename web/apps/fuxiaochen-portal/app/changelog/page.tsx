import { format } from "date-fns";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import BlogContent from "@/components/blog/blog-content";

import { getChangelogList } from "@/api/changelog";

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

  const { lists, total } = await getChangelogList({
    page: currentPage,
    pageSize: pageSize,
  });

  const totalPages = Math.ceil(total / pageSize);
  const changelogs = lists || [];
  return (
    <div
      className={`
        min-h-screen bg-cyber-black font-body text-white
        selection:bg-neon-cyan selection:text-black
      `}
    >
      <main className="mx-auto max-w-4xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="relative mb-16 text-center">
          <h1
            className={`
              glitch-text mb-4 inline-block font-display text-5xl font-bold tracking-tighter text-white uppercase
              md:text-7xl
            `}
            data-text="System_Logs"
          >
            系统日志 / System_Logs
          </h1>
          <p className="mt-4 font-mono text-lg text-neon-purple/80">
            /// TRACKING_SYSTEM_EVOLUTION... 追踪系统演进
            <br />
            /// VERSION_HISTORY_ARCHIVE... 版本历史档案
          </p>
          <div
            className={`
              pointer-events-none absolute top-1/2 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2
              rounded-full bg-neon-purple/20 blur-[100px]
            `}
          />
        </div>

        {/* Changelog Timeline */}
        <div
          className={`
            glass-panel relative rounded-2xl border border-neon-purple/20 p-8
            md:p-12
          `}
        >
          {/* Timeline Line */}
          <div
            className={`
              absolute top-12 bottom-12 left-8 w-px bg-gradient-to-b from-neon-purple/0 via-neon-purple/50
              to-neon-purple/0
              md:left-12
            `}
          />

          <div className="space-y-12">
            {changelogs.length > 0 ? (
              changelogs.map((log) => (
                <div
                  key={log.id}
                  className={`
                    group relative pl-8
                    md:pl-12
                  `}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`
                      absolute top-2 left-[-5px] z-10 h-3 w-3 rounded-full border-2 border-neon-purple bg-cyber-black
                      shadow-[0_0_10px_var(--color-neon-purple)] transition-colors duration-300
                      group-hover:bg-neon-purple
                      md:left-[-5px]
                    `}
                  />

                  <div
                    className={`
                      mb-3 flex flex-col gap-4
                      md:flex-row md:items-baseline
                    `}
                  >
                    <span
                      className={`
                        rounded border border-neon-cyan/20 bg-neon-cyan/10 px-3 py-1 font-mono text-xl font-bold
                        text-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.1)]
                      `}
                    >
                      {log.version}
                    </span>
                    <span className="font-mono text-sm tracking-wide text-gray-500 uppercase">
                      {log.date
                        ? format(new Date(log.date), "yyyy-MM-dd")
                        : "未知日期"}
                    </span>
                  </div>

                  <div className="text-gray-300/90">
                    <BlogContent content={log.content} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <h3 className="mb-2 text-2xl font-bold text-gray-500">
                  未发现日志 / No Logs Found
                </h3>
                <p className="text-gray-600">
                  系统档案似乎为空。 / System archives appear to be empty.
                </p>
              </div>
            )}
          </div>
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
                        href={`/changelog?page=${page}`}
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
                      href={`/changelog?page=${currentPage + 1}`}
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
      </main>
    </div>
  );
}

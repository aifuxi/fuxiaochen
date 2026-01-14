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

  const changelogData = await getChangelogList({
    page: currentPage,
    pageSize: pageSize,
  });

  const totalPages = Math.ceil(changelogData.total / pageSize);

  return (
    <div className="min-h-screen bg-cyber-black text-white font-body selection:bg-neon-cyan selection:text-black">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] pointer-events-none bg-[length:100%_2px,3px_100%] animate-scanline" />

      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-16 relative text-center">
          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter uppercase font-display glitch-text inline-block"
            data-text="System_Logs"
          >
            System_Logs
          </h1>
          <p className="text-neon-purple/80 font-mono text-lg mt-4">
            /// TRACKING_SYSTEM_EVOLUTION
            <br />
            /// VERSION_HISTORY_ARCHIVE
          </p>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-purple/20 blur-[100px] rounded-full pointer-events-none -z-10" />
        </div>

        {/* Changelog Timeline */}
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-neon-purple/20 relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-12 top-12 bottom-12 w-px bg-gradient-to-b from-neon-purple/0 via-neon-purple/50 to-neon-purple/0" />

          <div className="space-y-12">
            {changelogData.lists.length > 0 ? (
              changelogData.lists.map((log) => (
                <div key={log.id} className="relative pl-8 md:pl-12 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-[-5px] md:left-[-5px] top-2 w-3 h-3 rounded-full bg-cyber-black border-2 border-neon-purple shadow-[0_0_10px_var(--color-neon-purple)] group-hover:bg-neon-purple transition-colors duration-300 z-10" />

                  <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-3">
                    <span className="text-neon-cyan font-mono text-xl font-bold bg-neon-cyan/10 px-3 py-1 rounded border border-neon-cyan/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                      {log.version}
                    </span>
                    <span className="text-gray-500 font-mono text-sm uppercase tracking-wide">
                      {log.date
                        ? format(new Date(log.date), "yyyy-MM-dd")
                        : "Unknown Date"}
                    </span>
                  </div>

                  <div className="text-gray-300/90">
                    <BlogContent content={log.content} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-gray-500 mb-2">
                  No Logs Found
                </h3>
                <p className="text-gray-600">
                  System archives appear to be empty.
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
                      className="text-neon-cyan hover:text-neon-cyan hover:bg-neon-cyan/10 border-none"
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
                      href={`/changelog?page=${currentPage + 1}`}
                      className="text-neon-cyan hover:text-neon-cyan hover:bg-neon-cyan/10 border-none"
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

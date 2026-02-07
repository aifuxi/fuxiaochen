import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <main className="mx-auto max-w-7xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="relative mb-16">
          <Skeleton className={`
            mb-4 h-16 w-3/4 rounded-2xl
            md:w-1/2
          `} />
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <Skeleton className="h-6 w-1/4 rounded-lg" />
          </div>
        </div>

        <div className={`
          grid grid-cols-1 gap-12
          lg:grid-cols-4
        `}>
          {/* Sidebar Skeletons */}
          <aside className={`
            space-y-8
            lg:col-span-1
          `}>
            <div className="glass-panel rounded-2xl p-6">
              <Skeleton className="mb-6 h-6 w-1/2 rounded-lg" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <Skeleton className="mb-6 h-6 w-1/2 rounded-lg" />
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </aside>

          {/* Blog Grid Skeletons */}
          <div className="lg:col-span-3">
            <div className={`
              mb-12 grid grid-cols-1 gap-6
              md:grid-cols-2
            `}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass-panel h-[400px] overflow-hidden rounded-2xl"
                >
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="space-y-4 p-6">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-3/4 rounded-lg" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                    <div className="flex justify-between border-t border-[var(--glass-border)] pt-4">
                      <Skeleton className="h-4 w-24 rounded-lg" />
                      <Skeleton className="h-4 w-24 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

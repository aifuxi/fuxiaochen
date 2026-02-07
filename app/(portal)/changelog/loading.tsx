import { Skeleton } from "@/components/ui/skeleton";

export default function ChangelogLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <main className="mx-auto max-w-4xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="relative mb-16 flex flex-col items-center text-center">
          <Skeleton className="mb-4 h-16 w-64 rounded-2xl" />
          <div className="flex w-full flex-col items-center space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-6 w-40 rounded-lg" />
          </div>
        </div>

        {/* Changelog Timeline */}
        <div
          className={`
            glass-panel relative rounded-2xl p-8
            md:p-12
          `}
        >
          {/* Timeline Line Skeleton */}
          <div
            className={`
              absolute top-12 bottom-12 left-8 w-px bg-[var(--glass-border)]
              md:left-12
            `}
          />

          <div className="space-y-12">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`
                  relative pl-8
                  md:pl-12
                `}
              >
                {/* Timeline Dot Skeleton */}
                <div
                  className={`
                    absolute top-2 left-[-5px] z-10 h-3 w-3 rounded-full border-2 border-[var(--glass-border)]
                    bg-[var(--glass-bg)]
                    md:left-[-5px]
                  `}
                />

                <div
                  className={`
                    mb-3 flex flex-col gap-4
                    md:flex-row md:items-baseline
                  `}
                >
                  <Skeleton className="h-8 w-24 rounded-lg" />
                  <Skeleton className="h-5 w-32 rounded-lg" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-5 w-full rounded-lg" />
                  <Skeleton className="h-5 w-[90%] rounded-lg" />
                  <Skeleton className="h-5 w-[95%] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function ChangelogLoading() {
  return (
    <div className="bg-cyber-black min-h-screen font-body text-white">
      <main className="mx-auto max-w-4xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="relative mb-16 flex flex-col items-center text-center">
          <Skeleton className="mb-4 h-16 w-64 rounded-lg bg-white/5" />
          <div className="flex w-full flex-col items-center space-y-2">
            <Skeleton className="h-6 w-48 rounded bg-white/5" />
            <Skeleton className="h-6 w-40 rounded bg-white/5" />
          </div>
        </div>

        {/* Changelog Timeline */}
        <div
          className={`
            glass-panel relative rounded-md border border-white/10 p-8
            md:p-12
          `}
        >
          {/* Timeline Line Skeleton */}
          <div
            className={`
              absolute top-12 bottom-12 left-8 w-px bg-white/5
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
                    absolute top-2 left-[-5px] z-10 h-3 w-3 rounded-full border-2 border-white/20 bg-white/10
                    md:left-[-5px]
                  `}
                />

                <div
                  className={`
                    mb-3 flex flex-col gap-4
                    md:flex-row md:items-baseline
                  `}
                >
                  <Skeleton className="h-8 w-24 rounded bg-white/5" />
                  <Skeleton className="h-5 w-32 rounded bg-white/5" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-5 w-full rounded bg-white/5" />
                  <Skeleton className="h-5 w-[90%] rounded bg-white/5" />
                  <Skeleton className="h-5 w-[95%] rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function ChangelogLoading() {
  return (
    <div className="min-h-screen bg-cyber-black text-white font-body">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] pointer-events-none bg-[length:100%_2px,3px_100%] animate-scanline" />

      <main className="pt-32 pb-20 max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-16 relative text-center flex flex-col items-center">
          <Skeleton className="h-16 w-64 mb-4 bg-white/5 rounded-lg" />
          <div className="space-y-2 flex flex-col items-center w-full">
            <Skeleton className="h-6 w-48 bg-white/5 rounded" />
            <Skeleton className="h-6 w-40 bg-white/5 rounded" />
          </div>
        </div>

        {/* Changelog Timeline */}
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/10 relative">
          {/* Timeline Line Skeleton */}
          <div className="absolute left-8 md:left-12 top-12 bottom-12 w-px bg-white/5" />

          <div className="space-y-12">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="relative pl-8 md:pl-12">
                {/* Timeline Dot Skeleton */}
                <div className="absolute left-[-5px] md:left-[-5px] top-2 w-3 h-3 rounded-full bg-white/10 border-2 border-white/20 z-10" />

                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-3">
                  <Skeleton className="h-8 w-24 bg-white/5 rounded" />
                  <Skeleton className="h-5 w-32 bg-white/5 rounded" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-5 w-full bg-white/5 rounded" />
                  <Skeleton className="h-5 w-[90%] bg-white/5 rounded" />
                  <Skeleton className="h-5 w-[95%] bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { NeonHeader } from "@/components/cyberpunk/neon-header";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-cyber-black text-white font-body">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] pointer-events-none bg-[length:100%_2px,3px_100%] animate-scanline" />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-16 relative">
          <Skeleton className="h-16 w-3/4 md:w-1/2 mb-4 bg-white/5 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/3 bg-white/5 rounded" />
            <Skeleton className="h-6 w-1/4 bg-white/5 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Skeletons */}
          <aside className="lg:col-span-1 space-y-8">
            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <Skeleton className="h-6 w-1/2 mb-6 bg-white/5 rounded" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full bg-white/5 rounded" />
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-xl border border-white/10">
              <Skeleton className="h-6 w-1/2 mb-6 bg-white/5 rounded" />
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 bg-white/5 rounded" />
                ))}
              </div>
            </div>
          </aside>

          {/* Blog Grid Skeletons */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="glass-panel rounded-xl border border-white/10 overflow-hidden h-[400px]"
                >
                  <Skeleton className="h-48 w-full bg-white/5" />
                  <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 bg-white/5 rounded" />
                      <Skeleton className="h-6 w-16 bg-white/5 rounded" />
                    </div>
                    <Skeleton className="h-8 w-3/4 bg-white/5 rounded" />
                    <Skeleton className="h-20 w-full bg-white/5 rounded" />
                    <div className="flex justify-between pt-4 border-t border-white/10">
                      <Skeleton className="h-4 w-24 bg-white/5 rounded" />
                      <Skeleton className="h-4 w-24 bg-white/5 rounded" />
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

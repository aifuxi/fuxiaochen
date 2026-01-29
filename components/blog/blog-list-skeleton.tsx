import { Skeleton } from "@/components/ui/skeleton";

export function BlogListSkeleton() {
  return (
    <div
      className={`
        mb-12 grid grid-cols-1 gap-6
        md:grid-cols-2
      `}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="glass-panel h-[400px] overflow-hidden rounded-xl border border-white/10"
        >
          <Skeleton className="h-48 w-full bg-white/5" />
          <div className="space-y-4 p-6">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded bg-white/5" />
              <Skeleton className="h-6 w-16 rounded bg-white/5" />
            </div>
            <Skeleton className="h-8 w-3/4 rounded bg-white/5" />
            <Skeleton className="h-20 w-full rounded bg-white/5" />
            <div className="flex justify-between border-t border-white/10 pt-4">
              <Skeleton className="h-4 w-24 rounded bg-white/5" />
              <Skeleton className="h-4 w-24 rounded bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlogListItemSkeleton() {
  return (
    <div className="glass-panel h-[400px] overflow-hidden rounded-xl border border-white/10">
      <Skeleton className="h-48 w-full bg-white/5" />
      <div className="space-y-4 p-6">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded bg-white/5" />
          <Skeleton className="h-6 w-16 rounded bg-white/5" />
        </div>
        <Skeleton className="h-8 w-3/4 rounded bg-white/5" />
        <Skeleton className="h-20 w-full rounded bg-white/5" />
        <div className="flex justify-between border-t border-white/10 pt-4">
          <Skeleton className="h-4 w-24 rounded bg-white/5" />
          <Skeleton className="h-4 w-24 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

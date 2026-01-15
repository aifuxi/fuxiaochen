import { Skeleton } from "@/components/ui/skeleton";

export function BlogListSkeleton() {
  return (
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
  );
}

export function BlogListItemSkeleton() {
  return (
    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden h-[400px]">
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
  );
}

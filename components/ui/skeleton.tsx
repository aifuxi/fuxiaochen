import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-[var(--text-color-secondary)]/10",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };

import { cn } from "@/lib/utils";

interface CyberContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
}

export function CyberContainer({
  children,
  className,
  title,
  action,
  ...props
}: CyberContainerProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Header Section with Cyber Title */}
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          {title && (
            <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-white">
              <span className="h-2 w-2 animate-pulse rounded-sm bg-neon-cyan" />
              {title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Main Content Box */}
      <div className="relative overflow-hidden rounded-md border border-white/10 bg-black/40 backdrop-blur-sm">
        {/* Decorative Corner Borders */}
        <div className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-neon-cyan/50" />
        <div className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-neon-cyan/50" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-neon-cyan/50" />
        <div className="absolute right-0 bottom-0 h-3 w-3 border-r-2 border-b-2 border-neon-cyan/50" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

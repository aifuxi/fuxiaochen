import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hover";
}

export function GlassCard({
  children,
  className,
  variant = "default",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-sm",
        variant === "hover" &&
          `
            transition-all duration-300
            hover:-translate-y-1 hover:shadow-lg
          `,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

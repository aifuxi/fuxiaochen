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
        "rounded-xl border border-border bg-muted p-6 shadow-sm",
        variant === "hover" &&
          `
            transition-all duration-200 ease-in-out
            hover:shadow-md
          `,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hover";
}

export function AppleCard({
  children,
  className,
  variant = "default",
  ...props
}: AppleCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-6 shadow-sm",
        variant === "hover" &&
          `
            transition-all duration-200 ease-apple
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

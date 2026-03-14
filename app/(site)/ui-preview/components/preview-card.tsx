import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PreviewCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function PreviewCard({ title, children, className }: PreviewCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <span className="text-sm font-medium text-muted-foreground">
        {title}
      </span>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-muted p-4">
        {children}
      </div>
    </div>
  );
}

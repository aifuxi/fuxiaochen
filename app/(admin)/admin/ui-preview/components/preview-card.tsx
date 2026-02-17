import type { ReactNode } from "react";
import { Text } from "@/components/ui/typography/text";
import { cn } from "@/lib/utils";

interface PreviewCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function PreviewCard({ title, children, className }: PreviewCardProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Text type="secondary" size="sm" weight="medium">
        {title}
      </Text>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-4">
        {children}
      </div>
    </div>
  );
}

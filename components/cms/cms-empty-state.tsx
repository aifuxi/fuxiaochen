import type React from "react";

import { cn } from "@/lib/utils";

type CmsEmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function CmsEmptyState({
  action,
  className,
  description,
  title,
}: CmsEmptyStateProps) {
  return (
    <div
      className={cn(
        `
          flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border
          border-[color:var(--color-line-default)]
          bg-[color:var(--color-surface-1)]
          px-6 py-10 text-center
        `,
        className,
      )}
    >
      <div className="space-y-2">
        <h3 className="font-serif text-2xl tracking-[-0.04em] text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="max-w-lg text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

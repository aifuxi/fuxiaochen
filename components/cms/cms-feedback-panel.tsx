import type React from "react";

import { cn } from "@/lib/utils";

type CmsFeedbackPanelProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function CmsFeedbackPanel({
  action,
  className,
  description,
  title,
}: CmsFeedbackPanelProps) {
  return (
    <div
      className={cn(
        `
          rounded-2xl border
          border-[color:var(--color-line-default)]
          bg-[color:var(--color-surface-2)]
          p-5
        `,
        className,
      )}
    >
      <div className="space-y-2">
        <p className="font-serif text-xl tracking-[-0.04em] text-foreground">
          {title}
        </p>
        {description ? (
          <p className="text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

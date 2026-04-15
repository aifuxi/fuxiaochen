import type React from "react";

import { cn } from "@/lib/utils";

type CmsMetric = {
  label: string;
  value: string;
  description?: string;
};

type CmsMetricStripProps = {
  items: CmsMetric[];
  className?: string;
};

export function CmsMetricStrip({ className, items }: CmsMetricStripProps) {
  return (
    <div
      className={cn(
        `
          grid gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        `,
        className,
      )}
    >
      {items.map((metric) => (
        <div
          key={metric.label}
          className={`
            rounded-2xl border
            border-[color:var(--color-line-default)]
            bg-[color:var(--color-surface-2)]
            p-5
          `}
        >
          <p className="text-xs tracking-[0.18em] text-muted uppercase">
            {metric.label}
          </p>
          <p className="mt-3 font-serif text-3xl tracking-[-0.05em] text-foreground">
            {metric.value}
          </p>
          {metric.description ? (
            <p className="mt-2 text-sm leading-6 text-muted">
              {metric.description}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

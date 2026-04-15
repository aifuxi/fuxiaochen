import type React from "react";

import { cn } from "@/lib/utils";

type CmsSectionPanelProps = {
  title?: string;
  description?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
};

export function CmsSectionPanel({
  className,
  children,
  description,
  id,
  title,
}: CmsSectionPanelProps) {
  const descriptionClassName = title
    ? "mt-2 text-sm leading-6 text-muted"
    : "text-sm leading-6 text-muted";

  return (
    <section
      id={id}
      className={cn(
        `
          scroll-mt-28 rounded-2xl border
          border-[color:var(--color-line-default)]
          bg-[color:var(--color-surface-1)]
          p-6
        `,
        className,
      )}
    >
      {title ? (
        <div className="space-y-2">
          <h2 className="font-serif text-2xl tracking-[-0.04em] text-foreground">
            {title}
          </h2>
        </div>
      ) : null}
      {description ? (
        <p className={descriptionClassName}>
          {description}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

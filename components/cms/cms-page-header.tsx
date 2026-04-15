import type React from "react";

import { cn } from "@/lib/utils";

type CmsPageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function CmsPageHeader({
  actions,
  className,
  description,
  eyebrow = "CMS",
  meta,
  title,
}: CmsPageHeaderProps) {
  return (
    <header className={cn("space-y-4", className)}>
      <div className="font-mono-tech text-[11px] tracking-[0.28em] text-primary uppercase">
        {eyebrow}
      </div>
      <div
        className={`
          flex flex-col gap-4
          lg:flex-row lg:items-end lg:justify-between
        `}
      >
        <div className="space-y-3">
          <h1
            className={`
              font-serif text-4xl tracking-[-0.05em] text-foreground
              lg:text-5xl
            `}
          >
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-base leading-7 text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {meta || actions ? (
          <div
            className={`
              flex flex-col gap-3
              lg:items-end
            `}
          >
            {meta ? (
              <div className="font-mono-tech text-xs tracking-[0.18em] text-muted uppercase">
                {meta}
              </div>
            ) : null}
            {actions ? (
              <div className="flex flex-wrap gap-3">{actions}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

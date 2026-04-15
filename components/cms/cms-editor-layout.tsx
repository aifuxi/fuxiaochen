import type React from "react";

import { cn } from "@/lib/utils";

type CmsEditorLayoutProps = {
  primary: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
  primaryClassName?: string;
  sidebarClassName?: string;
};

export function CmsEditorLayout({
  className,
  primary,
  primaryClassName,
  sidebar,
  sidebarClassName,
}: CmsEditorLayoutProps) {
  return (
    <div
      className={cn(
        `
          grid gap-6
          xl:grid-cols-[1fr_360px]
        `,
        className,
      )}
    >
      <div className={cn("space-y-6", primaryClassName)}>{primary}</div>
      <aside className={cn("space-y-6", sidebarClassName)}>{sidebar}</aside>
    </div>
  );
}

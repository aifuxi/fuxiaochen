import * as React from "react";
import { cn } from "@/lib/utils";

function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

function PaginationItem({
  active = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        `
          flex size-9 items-center justify-center rounded-full border text-sm transition-all
          duration-[var(--duration-base)] ease-[var(--ease-smooth)]
        `,
        active
          ? "border-primary/40 bg-primary text-primary-fg shadow-[0_10px_24px_rgb(16_185_129_/_0.18)]"
          : `
            border-border bg-surface/70 text-fg
            hover:border-border-h hover:bg-surface
          `,
        className,
      )}
      {...props}
    />
  );
}

export { Pagination, PaginationContent, PaginationItem };

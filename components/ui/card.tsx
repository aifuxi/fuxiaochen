import type { AnchorHTMLAttributes, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const cardClassName = "ds-card rounded-[var(--radius-lg)] bg-[var(--color-surface)]";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(cardClassName, className)} {...props} />;
}

export function CardLink({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(cardClassName, "ds-card-link", className)} {...props}>
      {children}
    </a>
  );
}

export function CardStage({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("ds-stage rounded-[var(--radius-md)] bg-[var(--color-stage)]", className)}
      {...props}
    />
  );
}

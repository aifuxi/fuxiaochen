import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("ds-card rounded-[24px] bg-[var(--color-surface)]", className)} {...props} />
  );
}

export function CardStage({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("ds-stage rounded-[14px] bg-[var(--color-stage)]", className)} {...props} />
  );
}

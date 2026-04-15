import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

export const badgeBaseClassName =
  "inline-flex items-center rounded-lg border px-2.5 py-1 font-mono text-[11px] tracking-[0.24em] uppercase";
export const badgePrimaryClassName =
  "border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] text-primary";
export const badgeMutedClassName =
  "border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] text-muted";

const badgeVariants = cva(
  badgeBaseClassName,
  {
    variants: {
      variant: {
        primary: badgePrimaryClassName,
        muted: badgeMutedClassName,
        success: "border-emerald-400/20 bg-emerald-400/12 text-emerald-300",
        warning: "border-amber-400/20 bg-amber-400/12 text-amber-200",
        destructive: "border-red-400/20 bg-red-400/12 text-red-200",
        info: "border-sky-400/20 bg-sky-400/12 text-sky-200",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

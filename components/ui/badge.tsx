import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.24em] uppercase",
  {
    variants: {
      variant: {
        primary: "border-primary/25 bg-primary/12 text-primary",
        muted: "border-white/8 bg-white/4 text-muted",
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

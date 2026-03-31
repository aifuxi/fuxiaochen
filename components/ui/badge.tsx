import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  `
    inline-flex items-center justify-center rounded-sm border px-2.5 py-1 font-mono text-[11px] tracking-[0.24em]
    uppercase transition-colors duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
  `,
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-fg",
        primary: "border-primary/30 bg-primary/12 text-primary",
        success: "border-success/30 bg-success/12 text-success",
        warning: "border-warning/30 bg-warning/12 text-warning",
        destructive: "border-error/30 bg-error/12 text-error",
        info: "border-info/30 bg-info/12 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ className, variant }))} {...props} />;
}

export { badgeVariants };

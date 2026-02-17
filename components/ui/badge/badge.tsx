import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  `
    inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors duration-150
    focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:outline-none
  `,
  {
    variants: {
      variant: {
        default:
          `
            border-transparent bg-primary text-primary-foreground shadow-sm
            hover:bg-primary/80
          `,
        secondary:
          `
            border-transparent bg-secondary text-secondary-foreground
            hover:bg-secondary/80
          `,
        destructive:
          `
            border-transparent bg-destructive text-destructive-foreground shadow-sm
            hover:bg-destructive/90
          `,
        outline: "border border-border text-foreground",
        success:
          `
            border-transparent bg-emerald-500 text-white shadow-sm
            hover:bg-emerald-600
          `,
        warning:
          `
            border-transparent bg-amber-500 text-white shadow-sm
            hover:bg-amber-600
          `,
      },
      size: {
        sm: "px-2 py-0 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  `
    inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-1
    text-[11px] font-medium whitespace-nowrap transition-all duration-[var(--duration-fast)] ease-[var(--ease-smooth)]
    focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:outline-none
    [&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0
  `,
  {
    variants: {
      variant: {
        default: `
          border-primary/20 bg-primary/12 text-primary
          hover:bg-primary/18
        `,
        secondary: `
          border-white/10 bg-secondary text-foreground
          hover:bg-white/10
        `,
        destructive: `
          border-destructive/20 bg-destructive/12 text-destructive
          hover:bg-destructive/18
        `,
        success: `
          border-primary/20 bg-primary/12 text-primary
          hover:bg-primary/18
        `,
        warning: `
          border-warning/25 bg-warning/15 text-warning
          hover:bg-warning/22
        `,
        info: `
          border-info/25 bg-info/14 text-info
          hover:bg-info/20
        `,
        outline: `
          border-border bg-transparent text-muted-foreground
          hover:border-white/20 hover:bg-white/5 hover:text-foreground
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

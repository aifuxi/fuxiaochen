import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  `
    inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs
    font-medium whitespace-nowrap transition-all duration-200 ease-apple
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none
    [&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0
  `,
  {
    variants: {
      variant: {
        default: `
          border-transparent bg-accent text-white
          hover:bg-accent-hover-color
        `,
        secondary: `
          border-transparent bg-surface text-text
          hover:bg-surface-hover
        `,
        destructive: `
          border-transparent bg-error text-white
          hover:bg-error/90
        `,
        outline: `
          border-border bg-transparent text-text
          hover:bg-surface-hover
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

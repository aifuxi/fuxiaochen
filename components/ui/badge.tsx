import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  `
    focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
    aria-invalid:ring-destructive/20 aria-invalid:border-destructive
    dark:aria-invalid:ring-destructive/40
    inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs
    font-medium whitespace-nowrap transition-[color,box-shadow,background-color]
    [&>svg]:pointer-events-none [&>svg]:size-3
  `,
  {
    variants: {
      variant: {
        default: `
          border-transparent bg-[var(--accent-color)] text-white shadow-sm
          [a&]:hover:bg-[var(--accent-color)]/90
        `,
        secondary: `
          border-transparent bg-[var(--glass-bg)] text-[var(--text-color)] backdrop-blur-sm
          [a&]:hover:bg-[var(--glass-bg)]/80
        `,
        destructive: `
          bg-destructive border-transparent text-white shadow-sm
          [a&]:hover:bg-destructive/90
          focus-visible:ring-destructive/20
          dark:focus-visible:ring-destructive/40 dark:bg-destructive/60
        `,
        outline: `
          border-[var(--glass-border)] text-[var(--text-color)] backdrop-blur-sm
          [a&]:hover:bg-[var(--glass-bg)] [a&]:hover:text-[var(--text-color)]
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
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
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

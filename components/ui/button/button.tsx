import * as React from "react";
import * as SlotPrimitive from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all
    duration-200
    focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none
    active:scale-[0.98]
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        default:
          `
            bg-primary text-primary-foreground shadow-sm
            hover:bg-primary/90 hover:shadow-md
          `,
        primary:
          `
            bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md
            hover:scale-[1.02] hover:shadow-lg
          `,
        secondary:
          `
            border border-border bg-surface text-surface-foreground
            hover:bg-accent hover:text-accent-foreground
          `,
        ghost:
          `
            glass text-foreground
            hover:bg-accent hover:text-accent-foreground
          `,
        link: `
          text-primary underline-offset-4
          hover:underline
        `,
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs",
        md: "h-10 rounded-lg px-4 py-2",
        lg: "h-12 rounded-xl px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? SlotPrimitive.Root : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

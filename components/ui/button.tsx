import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
    ease-apple
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none
    active:scale-[0.98]
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-accent text-white shadow-sm
          hover:bg-accent-hover-color
        `,
        secondary: `
          border border-border bg-surface text-text
          hover:bg-surface-hover
        `,
        ghost: `
          bg-transparent text-text
          hover:bg-surface
        `,
        outline: `
          border border-border bg-transparent text-text
          hover:bg-surface
        `,
        destructive: `
          hover:bg-error-hover-color
          bg-error text-white shadow-sm
        `,
      },
      size: {
        default: "px-5 py-2.5",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
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

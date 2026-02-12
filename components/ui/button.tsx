import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none
    inline-flex items-center justify-center rounded-full text-sm font-medium whitespace-nowrap transition-colors
    duration-300
    active:scale-95
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-accent text-white shadow-md
          hover:opacity-90 hover:shadow-lg
        `,
        secondary: `
          border border-glass-border bg-glass-bg text-text backdrop-blur-sm
          hover:bg-glass-bg/80
        `,
        ghost: `
          text-text
          hover:bg-glass-bg/50
        `,
        glass: `
          glass-panel text-text
          hover:bg-glass-bg/80
        `,
        outline: `
          border border-glass-border bg-transparent text-text
          hover:bg-glass-bg/50
        `,
      },
      size: {
        default: "px-5 py-2.5",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-8 py-3 text-base",
        icon: "h-9 w-9",
      },
      hoverEffect: {
        default: "",
        up: `
          transition-transform duration-150
          hover:-translate-y-0.5 hover:bg-accent/90
        `,
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      hoverEffect: "default",
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
  (
    { className, variant, size, hoverEffect, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, hoverEffect, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

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
          bg-[var(--accent-color)] text-white shadow-md
          hover:opacity-90 hover:shadow-lg
        `,
        secondary: `
          bg-gray-100 text-[var(--text-color)]
          hover:bg-gray-200
          dark:bg-gray-800 dark:hover:bg-gray-700
        `,
        ghost: `
          text-[var(--text-color)]
          hover:bg-gray-100
          dark:hover:bg-gray-800
        `,
        glass: `
          glass-panel
          hover:bg-white/10
          dark:hover:bg-white/5
        `,
        outline: `
          border border-[var(--glass-border)] bg-transparent text-[var(--text-color)]
          hover:bg-[var(--glass-bg)]
        `,
      },
      size: {
        default: "px-5 py-2.5",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-8 py-3 text-base",
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

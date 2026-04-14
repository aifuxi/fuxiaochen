import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-[0.01em] whitespace-nowrap
    transition-all duration-[var(--duration-normal)] ease-[var(--ease-smooth)]
    focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background
    focus-visible:outline-none
    active:scale-[0.98]
    disabled:pointer-events-none disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-primary text-primary-foreground shadow-sm
          hover:-translate-y-0.5 hover:shadow-md hover:brightness-110
        `,
        secondary: `
          border border-border bg-secondary text-foreground shadow-xs
          hover:border-white/20 hover:bg-white/12 hover:text-foreground
        `,
        ghost: `
          bg-transparent text-muted-foreground
          hover:bg-white/5 hover:text-foreground
        `,
        outline: `
          border border-border bg-transparent text-foreground
          hover:border-primary/40 hover:bg-primary/8 hover:text-primary
        `,
        destructive: `
          bg-destructive text-destructive-foreground shadow-sm
          hover:-translate-y-0.5 hover:brightness-110
        `,
        glow: `
          glow-button bg-primary text-primary-foreground shadow-md
          hover:-translate-y-0.5 hover:brightness-110
        `,
        link: `
          h-auto rounded-none px-0 py-0 text-primary underline-offset-4
          hover:text-primary/80 hover:underline
        `,
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-11 rounded-full",
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

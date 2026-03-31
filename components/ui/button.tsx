"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
    inline-flex items-center justify-center gap-2 rounded-md border border-transparent font-medium whitespace-nowrap
    transition-all duration-[var(--duration-base)] ease-[var(--ease-smooth)] outline-none
    focus-visible:ring-2 focus-visible:ring-[color:rgb(16_185_129_/_0.28)] focus-visible:ring-offset-2
    focus-visible:ring-offset-bg
    disabled:pointer-events-none disabled:opacity-50
    [&_svg]:pointer-events-none [&_svg]:shrink-0
  `,
  {
    variants: {
      variant: {
        primary:
          `
            bg-primary text-primary-fg shadow-[0_0_0_1px_rgb(16_185_129_/_0.16),0_14px_30px_rgb(16_185_129_/_0.18)]
            hover:-translate-y-px hover:bg-primary-h
          `,
        secondary:
          `
            border-border bg-surface text-fg
            hover:border-border-h hover:bg-surface-h
          `,
        ghost: `
          bg-transparent text-fg
          hover:bg-surface
        `,
        outline:
          `
            border-border bg-transparent text-fg
            hover:border-border-h hover:bg-surface/80
          `,
        destructive:
          `
            bg-error text-white shadow-[0_10px_24px_rgb(239_68_68_/_0.18)]
            hover:-translate-y-px hover:brightness-110
          `,
        link: `
          h-auto rounded-none p-0 text-primary underline-offset-4
          hover:underline
        `,
      },
      size: {
        sm: "h-8 rounded-sm px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({
  asChild = false,
  className,
  children,
  disabled,
  loading = false,
  size,
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </Comp>
  );
}

export { buttonVariants };

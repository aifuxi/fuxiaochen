import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  `
    glass flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground
    ring-offset-background transition-all duration-200
    file:border-0 file:bg-transparent file:text-sm file:font-medium
    placeholder:text-muted-foreground
    focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none
    disabled:cursor-not-allowed disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        default: "",
        filled: "border-transparent bg-accent/50",
      },
      inputSize: {
        sm: "h-8 rounded-md px-2 text-xs",
        md: "h-10 rounded-lg px-3 text-sm",
        lg: "h-12 rounded-xl px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  },
);

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  variant?: "default" | "filled";
  inputSize?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize = "md", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

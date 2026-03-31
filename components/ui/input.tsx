import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError = false, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          `
            flex h-11 w-full rounded-md border bg-surface/70 px-4 py-2 text-sm text-fg
            shadow-[inset_0_1px_0_rgb(255_255_255_/_0.02)] transition-all duration-[var(--duration-base)]
            ease-[var(--ease-smooth)]
            placeholder:text-muted/80
            focus-visible:border-primary/50 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-primary/20
            focus-visible:outline-none
            disabled:cursor-not-allowed disabled:opacity-45
          `,
          hasError
            ? `
              border-error/60
              focus-visible:border-error/60 focus-visible:ring-error/20
            `
            : "border-border",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `
          file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium
          hover:not(:focus):border-accent/20
          h-10 w-full min-w-0 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text transition-all
          duration-200 ease-apple outline-none
          placeholder:text-text-tertiary
          focus:border-accent focus:ring-2 focus:ring-accent/20
          disabled:cursor-not-allowed disabled:opacity-50
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Input };

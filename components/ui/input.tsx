import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `
          h-11 w-full min-w-0 rounded-md border border-input bg-white/4 px-4 py-2 text-sm text-foreground transition-all
          duration-[var(--duration-normal)] ease-[var(--ease-smooth)] outline-none
          file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
          placeholder:text-muted
          hover:border-white/18 hover:bg-white/6
          focus:border-primary/50 focus:bg-white/7 focus:ring-4 focus:ring-primary/10
          disabled:cursor-not-allowed disabled:opacity-50
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Input };

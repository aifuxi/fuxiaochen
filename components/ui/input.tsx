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
          placeholder:text-muted-foreground
          h-10 w-full min-w-0 rounded-2xl border border-glass-border bg-glass-bg/50 px-3 py-1 text-base text-text
          shadow-sm backdrop-blur-sm transition-all duration-300 outline-none
          selection:bg-accent selection:text-white
          hover:border-accent/30 hover:bg-glass-bg
          focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/20
          disabled:cursor-not-allowed disabled:opacity-50
          md:text-sm
        `,
        `aria-invalid:border-red-500 aria-invalid:ring-red-500/20`,
        className,
      )}
      {...props}
    />
  );
}

export { Input };

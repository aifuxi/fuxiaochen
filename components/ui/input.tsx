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
          h-10 w-full min-w-0 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)]/50 px-3 py-1 text-base
          text-[var(--text-color)] shadow-sm backdrop-blur-sm transition-all duration-300 outline-none
          selection:bg-[var(--accent-color)] selection:text-white
          hover:border-[var(--accent-color)]/30 hover:bg-[var(--glass-bg)]
          focus-visible:border-[var(--accent-color)] focus-visible:ring-4 focus-visible:ring-[var(--accent-color)]/20
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

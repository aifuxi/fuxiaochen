import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `
          placeholder:text-muted-foreground
          flex field-sizing-content min-h-20 w-full rounded-xl border border-[var(--glass-border)]
          bg-[var(--glass-bg)]/50 px-3 py-2 text-base text-[var(--text-color)] shadow-sm backdrop-blur-sm transition-all
          duration-300 outline-none
          hover:border-[var(--accent-color)]/30 hover:bg-[var(--glass-bg)]
          focus-visible:border-[var(--accent-color)] focus-visible:ring-4 focus-visible:ring-[var(--accent-color)]/20
          disabled:cursor-not-allowed disabled:opacity-50
          aria-invalid:border-red-500 aria-invalid:ring-red-500/20
          md:text-sm
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

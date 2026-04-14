import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `
          flex field-sizing-content min-h-28 w-full rounded-[var(--radius-lg)] border border-input bg-white/4 px-4 py-3
          text-base text-foreground transition-all duration-[var(--duration-normal)] ease-[var(--ease-smooth)]
          outline-none
          placeholder:text-muted
          hover:border-white/18 hover:bg-white/6
          focus:border-primary/50 focus:bg-white/7 focus:ring-4 focus:ring-primary/10
          disabled:cursor-not-allowed disabled:opacity-50
          aria-invalid:border-destructive aria-invalid:ring-destructive/20
          md:text-sm
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

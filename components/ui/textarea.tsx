import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `
          flex field-sizing-content min-h-20 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base
          text-text transition-all duration-200 ease-apple outline-none
          placeholder:text-text-tertiary
          focus:border-accent focus:ring-2 focus:ring-accent/20
          disabled:cursor-not-allowed disabled:opacity-50
          aria-invalid:border-error aria-invalid:ring-error/20
          md:text-sm
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

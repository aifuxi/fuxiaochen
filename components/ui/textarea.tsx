import * as React from "react";
import { cn } from "@/lib/utils";

export const textareaClassName =
  "min-h-32 w-full rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-4 py-3 text-sm text-foreground transition-all outline-none placeholder:text-muted focus:border-primary/60 focus:ring-4 focus:ring-primary/10";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(textareaClassName, className)}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

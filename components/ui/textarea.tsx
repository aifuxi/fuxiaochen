import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          `
            min-h-32 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground
            transition-all outline-none
            placeholder:text-muted
            focus:border-primary/60 focus:bg-white/7 focus:ring-4 focus:ring-primary/10
          `,
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

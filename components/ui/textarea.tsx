import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn("ds-input min-h-32 w-full resize-y p-3 text-sm leading-6", className)}
      {...props}
    />
  );
}

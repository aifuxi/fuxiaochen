import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "ds-input ds-textarea min-h-32 w-full resize-y px-3 py-[5px] text-sm leading-5",
        className,
      )}
      {...props}
    />
  );
}

import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `
          flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-input/30 px-4 py-3 text-sm
          text-foreground ring-offset-0 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none
          placeholder:text-muted
          focus-visible:ring-2 focus-visible:ring-ring/50
          disabled:cursor-not-allowed disabled:opacity-50
          aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
        `,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

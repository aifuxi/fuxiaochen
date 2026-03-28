import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  variant = "default",
  ...props
}: React.ComponentProps<"input"> & { variant?: "default" | "search" | "error" }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-variant={variant}
      className={cn(
        `
          h-10 w-full min-w-0 rounded-lg border bg-transparent px-4 py-2 text-sm text-foreground ring-offset-0
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none
          file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground
          placeholder:text-muted
          focus-visible:ring-2 focus-visible:ring-ring/50
          disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
          aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20
        `,
        // Variant: default
        variant === "default" && `
          hover:border-border-hover
          border-input bg-input/30
          focus-visible:border-primary
        `,
        // Variant: search
        variant === "search" && `
          hover:border-border-hover
          border-input bg-input/30 pl-10
          focus-visible:border-primary
        `,
        // Variant: error
        variant === "error" && `
          border-destructive bg-destructive/10
          focus-visible:border-destructive focus-visible:ring-destructive/20
        `,
        className
      )}
      {...props}
    />
  )
}

function InputWrapper({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-wrapper"
      className={cn("relative", className)}
      {...props}
    />
  )
}

function InputIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-icon"
      className={cn(
        "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted",
        className
      )}
      {...props}
    />
  )
}

function InputSuffix({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-suffix"
      className={cn(
        "absolute top-1/2 right-3 -translate-y-1/2 text-muted",
        className
      )}
      {...props}
    />
  )
}

export { Input, InputWrapper, InputIcon, InputSuffix }

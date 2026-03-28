import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  variant?: "default" | "glass" | "shimmer" | "spotlight"
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        `
          group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card text-card-foreground ring-1
          ring-foreground/5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          has-data-[slot=card-footer]:pb-0
          has-[>img:first-child]:pt-0
          data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0
          *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl
        `,
        // Variant styles
        variant === "glass" && "glass-card backdrop-blur-xl",
        variant === "shimmer" && "shimmer-border",
        variant === "spotlight" && "spotlight-card",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        `
          group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-6 py-5
          group-data-[size=sm]/card:px-4 group-data-[size=sm]/card:py-4
          has-data-[slot=card-action]:grid-cols-[1fr_auto]
          has-data-[slot=card-description]:grid-rows-[auto_auto]
          [.border-b]:pb-4
          group-data-[size=sm]/card:[.border-b]:pb-3
        `,
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        `
          font-serif text-xl leading-snug font-medium tracking-tight
          group-data-[size=sm]/card:text-base
        `,
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(`
        px-6
        group-data-[size=sm]/card:px-4
      `, className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        `
          flex items-center rounded-b-xl border-t border-white/5 bg-muted/30 p-4
          group-data-[size=sm]/card:p-4
        `,
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

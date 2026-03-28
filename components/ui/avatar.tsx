"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "md",
  ring = false,
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "sm" | "md" | "lg" | "xl"
  ring?: boolean
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        `
          group/avatar relative flex shrink-0 overflow-hidden rounded-lg bg-secondary font-medium text-foreground
          select-none
          after:absolute after:inset-0 after:rounded-lg after:mix-blend-darken
          dark:after:mix-blend-lighten
        `,
        // Sizes
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-16 text-xl",
        size === "xl" && "size-20 text-2xl",
        // Ring variant
        ring && "bg-linear-to-br from-primary to-foreground p-0.5",
        ring && "after:rounded-lg after:border-0",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-lg object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        `
          flex size-full items-center justify-center rounded-lg bg-secondary text-foreground
          group-data-[size=lg]/avatar:text-xl
          group-data-[size=md]/avatar:text-sm
          group-data-[size=sm]/avatar:text-xs
          group-data-[size=xl]/avatar:text-2xl
        `,
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        `
          absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary
          text-primary-foreground ring-2 ring-background
        `,
        "group-data-[size=sm]/avatar:size-2",
        "group-data-[size=md]/avatar:size-2.5",
        "group-data-[size=lg]/avatar:size-3",
        "group-data-[size=xl]/avatar:size-4",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        `
          group/avatar-group flex -space-x-2
          *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background
        `,
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        `
          relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-medium
          text-foreground ring-2 ring-background
          group-has-data-[size=lg]/avatar-group:size-16 group-has-data-[size=lg]/avatar-group:text-xl
          group-has-data-[size=md]/avatar-group:size-10 group-has-data-[size=md]/avatar-group:text-sm
          group-has-data-[size=sm]/avatar-group:size-8 group-has-data-[size=sm]/avatar-group:text-xs
          group-has-data-[size=xl]/avatar-group:size-20 group-has-data-[size=xl]/avatar-group:text-2xl
        `,
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}

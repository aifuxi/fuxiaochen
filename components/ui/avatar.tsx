"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { cn } from "@/lib/utils";

const avatarSizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
} as const;

type AvatarSize = keyof typeof avatarSizes;

function Avatar({
  className,
  size = "md",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: AvatarSize;
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        `
          relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border
          bg-surface text-fg shadow-[0_10px_24px_rgb(0_0_0_/_0.24)]
        `,
        avatarSizes[size],
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        `
          flex size-full items-center justify-center
          bg-[linear-gradient(135deg,rgb(16_185_129_/_0.22),rgb(255_255_255_/_0.06))] font-mono tracking-[0.18em]
          uppercase
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };

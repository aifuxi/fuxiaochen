"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import * as React from "react";

import { cn } from "@/lib/utils";

type AvatarProps = {
  src?: string;
  alt: string;
  fallback: string;
  className?: string;
};

export const avatarClassName =
  "relative flex size-12 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] text-sm font-semibold text-foreground";
export const avatarFallbackClassName =
  "flex size-full items-center justify-center bg-gradient-to-br from-primary/30 to-[color:var(--color-surface-1)]";

export function Avatar({ alt, className, fallback, src }: AvatarProps) {
  return (
    <BaseAvatar.Root className={cn(avatarClassName, className)}>
      {src ? <BaseAvatar.Image className="size-full object-cover" src={src} alt={alt} /> : null}
      <BaseAvatar.Fallback className={avatarFallbackClassName}>
        {fallback}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}

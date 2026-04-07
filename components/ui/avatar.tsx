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

export function Avatar({ alt, className, fallback, src }: AvatarProps) {
  return (
    <BaseAvatar.Root
      className={cn(
        `
          relative flex size-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10
          bg-white/6 text-sm font-semibold text-foreground
        `,
        className,
      )}
    >
      {src ? <BaseAvatar.Image className="size-full object-cover" src={src} alt={alt} /> : null}
      <BaseAvatar.Fallback className={`
        flex size-full items-center justify-center bg-gradient-to-br from-primary/30 to-white/6
      `}>
        {fallback}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}

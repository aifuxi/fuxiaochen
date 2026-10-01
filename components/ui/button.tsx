"use client";

import type { ComponentProps } from "react";

import { Button as BaseButton } from "@base-ui/react/button";

import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<typeof BaseButton> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "default" | "compact";
};

export function Button({
  className,
  variant = "secondary",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={cn(
        "ds-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
        size === "sm" ? "h-8 px-3" : "h-10 px-4",
        size === "compact" && "ds-control-compact",
        `ds-button-${variant}`,
        className,
      )}
      {...props}
    />
  );
}

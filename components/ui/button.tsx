"use client";

import type { ComponentProps } from "react";

import { Button as BaseButton } from "@base-ui/react/button";

import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<typeof BaseButton> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "default";
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
        "ds-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-[background-color,transform,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "h-8 px-3" : "h-10",
        variant === "primary" &&
          "ds-button-primary bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-pressed)]",
        variant === "secondary" &&
          "ds-button-secondary bg-[var(--color-raised)] text-[var(--color-foreground)] hover:bg-[#323232] active:bg-[#262626]",
        variant === "ghost" && "text-[var(--color-muted)] hover:bg-white/5 hover:text-white",
        className,
      )}
      {...props}
    />
  );
}

"use client";

import type { ComponentProps } from "react";

import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

export function Switch({
  className,
  touchTarget = false,
  ...props
}: ComponentProps<typeof BaseSwitch.Root> & { touchTarget?: boolean }) {
  return (
    <BaseSwitch.Root
      nativeButton
      render={<button type="button" aria-label={props["aria-label"]} />}
      className={cn(
        "ds-switch relative inline-flex shrink-0 cursor-[var(--cursor-action)] rounded-full",
        touchTarget && "ds-switch-touch",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className="ds-switch-thumb block rounded-full" />
    </BaseSwitch.Root>
  );
}

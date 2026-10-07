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
        "ds-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full bg-[#393939] p-[3px] transition-colors duration-[var(--motion-quick)] ease-[var(--motion-ease)] data-checked:bg-[var(--color-primary)] enabled:hover:brightness-110 enabled:active:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] data-disabled:cursor-not-allowed data-disabled:opacity-40",
        touchTarget && "ds-switch-touch",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className="ds-switch-thumb block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-[var(--motion-quick)] ease-[var(--motion-ease)] data-checked:translate-x-5" />
    </BaseSwitch.Root>
  );
}

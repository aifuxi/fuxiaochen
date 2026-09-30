"use client";

import type { ComponentProps } from "react";

import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: ComponentProps<typeof BaseSwitch.Root>) {
  return (
    <BaseSwitch.Root
      nativeButton
      render={<button type="button" aria-label={props["aria-label"] ?? "开关"} />}
      className={cn(
        "ds-switch relative inline-flex h-6 w-11 shrink-0 rounded-full bg-[#393939] p-[3px] transition-colors duration-200 data-checked:bg-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] data-disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <BaseSwitch.Thumb className="ds-switch-thumb block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 data-checked:translate-x-5" />
    </BaseSwitch.Root>
  );
}

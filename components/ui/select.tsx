"use client";

import type { ComponentProps } from "react";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { renderPopupMotion } from "@/components/motion/popup-motion";
import { cn } from "@/lib/utils";

export const Select = BaseSelect.Root;
export const SelectLabel = BaseSelect.Label;
export const SelectValue = BaseSelect.Value;

export function SelectTrigger({
  className,
  children,
  size = "default",
  ...props
}: ComponentProps<typeof BaseSelect.Trigger> & { size?: "default" | "compact" }) {
  return (
    <BaseSelect.Trigger
      type="button"
      className={cn(
        "ds-input flex h-[var(--control-form)] w-full cursor-pointer items-center justify-between gap-3 px-3 text-left text-sm leading-5 data-placeholder:text-[var(--color-subtle)]",
        size === "compact" && "ds-control-compact",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      <BaseSelect.Icon className="shrink-0 text-[var(--color-muted)]">
        <ChevronDown size={16} aria-hidden="true" />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  render,
  ...props
}: ComponentProps<typeof BaseSelect.Popup>) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner
        alignItemWithTrigger={false}
        sideOffset={6}
        className="z-50 w-[var(--anchor-width)]"
      >
        <BaseSelect.Popup
          className={cn("ds-picker-popup", className)}
          render={render ?? renderPopupMotion}
          {...props}
        >
          <BaseSelect.List className="max-h-60 overflow-y-auto p-1">{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseSelect.Item>) {
  return (
    <BaseSelect.Item className={cn("ds-picker-item", className)} {...props}>
      <BaseSelect.ItemText className="min-w-0 flex-1 truncate">{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="shrink-0 text-[var(--color-focus)]">
        <Check size={15} aria-hidden="true" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

"use client";

import type { ComponentProps, ReactNode } from "react";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";

import { renderPopupMotion } from "@/components/motion/popup-motion";
import { cn } from "@/lib/utils";

export const Combobox = BaseCombobox.Root;
export const ComboboxList = BaseCombobox.List;

export function ComboboxInputGroup({
  className,
  ...props
}: ComponentProps<typeof BaseCombobox.InputGroup>) {
  return (
    <BaseCombobox.InputGroup
      className={cn(
        "ds-input ds-combobox-group flex h-[var(--control-form)] w-full items-center",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxInput({ className, ...props }: ComponentProps<typeof BaseCombobox.Input>) {
  return (
    <BaseCombobox.Input
      className={cn(
        "ds-combobox-input h-full min-w-0 flex-1 bg-transparent px-3 text-sm leading-5 text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxClear({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseCombobox.Clear>) {
  return (
    <BaseCombobox.Clear
      type="button"
      aria-label="清除选择"
      className={cn("ds-picker-action", className)}
      {...props}
    >
      {children ?? <X size={15} aria-hidden="true" />}
    </BaseCombobox.Clear>
  );
}

export function ComboboxTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseCombobox.Trigger>) {
  return (
    <BaseCombobox.Trigger
      type="button"
      aria-label="展开选项"
      className={cn("ds-picker-action mr-1", className)}
      {...props}
    >
      {children ?? <ChevronDown size={16} aria-hidden="true" />}
    </BaseCombobox.Trigger>
  );
}

export function ComboboxContent({
  className,
  children,
  render,
  emptyText = "没有匹配的选项",
  ...props
}: ComponentProps<typeof BaseCombobox.Popup> & { emptyText?: ReactNode }) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner sideOffset={6} className="z-50 w-[var(--anchor-width)]">
        <BaseCombobox.Popup
          className={cn("ds-picker-popup", className)}
          render={render ?? renderPopupMotion}
          {...props}
        >
          <BaseCombobox.Empty className="px-3 py-4 text-center text-xs text-[var(--color-muted)]">
            {emptyText}
          </BaseCombobox.Empty>
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export function ComboboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseCombobox.Item>) {
  return (
    <BaseCombobox.Item className={cn("ds-picker-item", className)} {...props}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <BaseCombobox.ItemIndicator className="shrink-0 text-[var(--color-focus)]">
        <Check size={15} aria-hidden="true" />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  );
}

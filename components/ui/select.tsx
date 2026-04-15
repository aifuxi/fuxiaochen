"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

export const selectTriggerClassName =
  "flex h-12 w-full items-center justify-between rounded-xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] px-4 text-sm text-foreground transition-all outline-none focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10";

export const selectPopupClassName =
  "min-w-[var(--anchor-width)] rounded-[1.4rem] border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.4)]";

type SelectProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Root> & {
  options: SelectOption[];
  placeholder?: string;
  className?: string;
};

export function Select({
  className,
  options,
  placeholder = "请选择一个选项",
  ...props
}: SelectProps) {
  return (
    <BaseSelect.Root {...props}>
      <BaseSelect.Trigger
        className={cn(selectTriggerClassName, className)}
      >
        <BaseSelect.Value
          className={`
            text-left text-foreground
            data-[placeholder]:text-muted
          `}
        >
          {placeholder}
        </BaseSelect.Value>
        <BaseSelect.Icon>
          <ChevronDown className="size-4 text-muted" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={8}>
          <BaseSelect.Popup className={selectPopupClassName}>
            <BaseSelect.List className="space-y-1">
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  className={`
                    flex cursor-default items-center justify-between rounded-2xl px-3 py-2 text-sm text-muted
                    transition-colors outline-none
                    data-[highlighted]:bg-[color:var(--color-line-default)] data-[highlighted]:text-foreground
                    data-[selected]:text-foreground
                  `}
                  value={option.value}
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator>
                    <Check className="size-4 text-primary" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const DropdownMenu = BaseMenu.Root;
export const DropdownMenuTrigger = BaseMenu.Trigger;

export function DropdownMenuContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Popup>) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={10}>
        <BaseMenu.Popup
          className={cn(
            `
              min-w-56 rounded-[1.4rem] border border-white/10 bg-popover p-2 shadow-[0_30px_80px_rgba(0,0,0,0.42)]
              backdrop-blur-xl
            `,
            className,
          )}
          {...props}
        />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Item> & { inset?: boolean }) {
  return (
    <BaseMenu.Item
      className={cn(
        `
          flex cursor-default items-center rounded-2xl px-3 py-2 text-sm text-muted transition-colors outline-none
          data-[highlighted]:bg-white/6 data-[highlighted]:text-foreground
        `,
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLinkItem(props: React.ComponentPropsWithoutRef<typeof BaseMenu.LinkItem>) {
  return (
    <BaseMenu.LinkItem
      className={`
        flex cursor-default items-center rounded-2xl px-3 py-2 text-sm text-muted transition-colors outline-none
        data-[highlighted]:bg-white/6 data-[highlighted]:text-foreground
      `}
      {...props}
    />
  );
}

export function DropdownMenuSubTrigger(props: React.ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>) {
  return (
    <BaseMenu.SubmenuTrigger
      className={`
        flex cursor-default items-center justify-between rounded-2xl px-3 py-2 text-sm text-muted transition-colors
        outline-none
        data-[highlighted]:bg-white/6 data-[highlighted]:text-foreground
      `}
      {...props}
    >
      {props.children}
      <ChevronRight className="size-4" />
    </BaseMenu.SubmenuTrigger>
  );
}

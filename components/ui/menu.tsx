"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import { MoreHorizontal } from "lucide-react";
import { useRef, Fragment, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import "./menu.css";

export const Menu = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;
export const MenuSeparator = BaseMenu.Separator;

export function MenuContent({ className, ...props }: ComponentProps<typeof BaseMenu.Popup>) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner align="end" sideOffset={6} collisionPadding={12} className="z-50">
        <BaseMenu.Popup className={cn("ds-menu", className)} {...props} />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuItem({
  className,
  destructive = false,
  ...props
}: ComponentProps<typeof BaseMenu.Item> & { destructive?: boolean }) {
  return (
    <BaseMenu.Item
      className={cn("ds-menu-item", destructive && "is-destructive", className)}
      data-cursor-interactive
      {...props}
    />
  );
}

export type RowAction = {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  opensDialog?: boolean;
  onSelect: (trigger: HTMLElement | null) => void;
};

export type RowActionsProps = { label: string; disabled?: boolean; actions: RowAction[] };

export function RowActions({ label, disabled, actions }: RowActionsProps) {
  const trigger = useRef<HTMLButtonElement | null>(null);
  const dialogOpened = useRef(false);
  return (
    <Menu
      onOpenChange={(open) => {
        if (open) dialogOpened.current = false;
      }}
    >
      <MenuTrigger
        ref={trigger}
        disabled={disabled}
        render={<Button variant="ghost" size="compact" className="ds-row-actions" />}
        aria-label={label}
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </MenuTrigger>
      <MenuContent finalFocus={() => (dialogOpened.current ? false : (trigger.current ?? true))}>
        {actions.map((action) => (
          <Fragment key={action.label}>
            {action.separator && <MenuSeparator className="ds-menu-separator" />}
            <MenuItem
              disabled={action.disabled}
              destructive={action.destructive}
              onClick={() => {
                dialogOpened.current = Boolean(action.opensDialog);
                action.onSelect(trigger.current);
              }}
            >
              <span aria-hidden="true">{action.icon}</span>
              {action.label}
            </MenuItem>
          </Fragment>
        ))}
      </MenuContent>
    </Menu>
  );
}

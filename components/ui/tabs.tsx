"use client";

import type { ComponentProps } from "react";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

export const Tabs = BaseTabs.Root;

export function TabsList({
  children,
  className,
  size = "default",
  ...props
}: ComponentProps<typeof BaseTabs.List> & { size?: "default" | "compact" }) {
  return (
    <BaseTabs.List
      className={cn(
        "ds-tabs-list inline-flex h-10 gap-1 rounded-full bg-white/[0.05] p-1",
        size === "compact" && "ds-control-compact",
        className,
      )}
      {...props}
    >
      {children}
      <BaseTabs.Indicator className="ds-tabs-indicator" renderBeforeHydration />
    </BaseTabs.List>
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "ds-tabs-trigger rounded-full px-4 text-[13px] text-[var(--color-subtle)] transition-colors duration-200 enabled:hover:text-white enabled:active:text-[var(--color-muted)] data-active:text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] data-disabled:cursor-not-allowed data-disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel className={cn("animate-panel-in pt-6 outline-none", className)} {...props} />
  );
}

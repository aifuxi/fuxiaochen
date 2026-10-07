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
        "ds-tabs-list inline-flex h-[var(--control-default)] gap-1 rounded-full bg-white/[0.05] p-1",
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
  return <BaseTabs.Tab className={cn("ds-tabs-trigger rounded-full px-4", className)} {...props} />;
}

export function TabsPanel({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel className={cn("ds-tabs-panel animate-panel-in pt-6", className)} {...props} />
  );
}

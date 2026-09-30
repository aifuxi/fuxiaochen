"use client";

import type { ComponentProps } from "react";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

export const Tabs = BaseTabs.Root;

export function TabsList({ className, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn("inline-flex h-10 gap-1 rounded-full bg-white/[0.05] p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "rounded-full px-4 text-[13px] text-[var(--color-subtle)] transition-colors duration-200 hover:text-white data-active:bg-[var(--color-raised)] data-active:text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]",
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

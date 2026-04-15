"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Tabs = BaseTabs.Root;
export const tabsListClassName =
  "inline-flex rounded-2xl border border-[color:var(--color-line-default)] bg-[color:var(--color-surface-1)] p-1";
export const tabsTriggerClassName =
  "rounded-xl border border-transparent px-4 py-2 text-sm text-muted transition-all data-[selected]:border-[color:var(--color-line-default)] data-[selected]:bg-[color:var(--color-surface-1)] data-[selected]:text-foreground";

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List className={cn(tabsListClassName, className)} {...props} />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(tabsTriggerClassName, className)}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn("mt-6 outline-none", className)} {...props} />;
}

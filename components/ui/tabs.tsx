"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

export const Tabs = BaseTabs.Root;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn("inline-flex rounded-full border border-white/8 bg-white/5 p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        `
          rounded-full px-4 py-2 text-sm text-muted transition-all
          data-[selected]:bg-primary data-[selected]:text-primary-foreground
        `,
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel className={cn("mt-6 outline-none", className)} {...props} />;
}

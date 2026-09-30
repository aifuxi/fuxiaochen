"use client";

import type { ComponentProps } from "react";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";

import { cn } from "@/lib/utils";

export const Accordion = BaseAccordion.Root;
export const AccordionItem = BaseAccordion.Item;
export const AccordionHeader = BaseAccordion.Header;

export function AccordionTrigger({
  className,
  ...props
}: ComponentProps<typeof BaseAccordion.Trigger>) {
  return (
    <BaseAccordion.Trigger
      className={cn(
        "group flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]",
        className,
      )}
      {...props}
    />
  );
}

export function AccordionPanel({
  className,
  ...props
}: ComponentProps<typeof BaseAccordion.Panel>) {
  return (
    <BaseAccordion.Panel
      className={cn(
        "ds-accordion-panel overflow-hidden text-sm leading-6 text-[var(--color-muted)]",
        className,
      )}
      {...props}
    />
  );
}

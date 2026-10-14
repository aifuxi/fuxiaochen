"use client";

import type { ComponentProps } from "react";

import { ComboboxContent as SharedComboboxContent } from "@/components/ui/combobox";
import { DialogContent as SharedDialogContent } from "@/components/ui/dialog";
import { SelectContent as SharedSelectContent } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import styles from "./preview.module.css";

// Portal 仍挂载到 body 避免裁切，但整个浮层（含遮罩）使用本页的样式作用域。
export function DialogContent({
  portalClassName,
  ...props
}: ComponentProps<typeof SharedDialogContent>) {
  return <SharedDialogContent {...props} portalClassName={cn(styles.scope, portalClassName)} />;
}

export function SelectContent({
  portalClassName,
  ...props
}: ComponentProps<typeof SharedSelectContent>) {
  return <SharedSelectContent {...props} portalClassName={cn(styles.scope, portalClassName)} />;
}

export function ComboboxContent({
  portalClassName,
  ...props
}: ComponentProps<typeof SharedComboboxContent>) {
  return <SharedComboboxContent {...props} portalClassName={cn(styles.scope, portalClassName)} />;
}

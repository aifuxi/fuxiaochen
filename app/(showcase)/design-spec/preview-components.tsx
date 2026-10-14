"use client";

import type { ComponentProps } from "react";

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { Select as BaseSelect } from "@base-ui/react/select";

import type { SelectContent as SharedSelectContent } from "@/components/ui/select";

import { renderPopupMotion } from "@/components/motion/popup-motion";
import { useTheme } from "@/components/theme/theme-provider";
import { ComboboxContent as SharedComboboxContent } from "@/components/ui/combobox";
import { DialogContent as SharedDialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import styles from "./preview.module.css";

// 页面侧栏与所有局部浮层共用覆盖式轨道，不影响共享组件的滚动样式。
export function PreviewScrollbar() {
  return (
    <ScrollArea.Scrollbar className={styles.scrollbar} orientation="vertical">
      <ScrollArea.Thumb className={styles.scrollThumb} />
    </ScrollArea.Scrollbar>
  );
}

// Portal 仍挂载到 body 避免裁切，但整个浮层（含遮罩）使用本页的样式作用域。
export function DialogContent({
  portalClassName,
  className,
  children,
  ...props
}: ComponentProps<typeof SharedDialogContent>) {
  const { theme } = useTheme();
  return (
    <SharedDialogContent
      {...props}
      className={cn(styles.scrollDialog, className)}
      portalClassName={cn(styles.scope, theme === "light" && styles.light, portalClassName)}
    >
      <ScrollArea.Root className={styles.scrollArea}>
        <ScrollArea.Viewport
          render={<section />}
          aria-label="弹窗内容"
          tabIndex={-1}
          className={cn(styles.scrollViewport, styles.dialogViewport)}
        >
          <ScrollArea.Content className={styles.dialogContent} style={{ minWidth: 0 }}>
            {children}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <PreviewScrollbar />
      </ScrollArea.Root>
    </SharedDialogContent>
  );
}

export function SelectContent({
  portalClassName,
  className,
  children,
  render,
  ...props
}: ComponentProps<typeof SharedSelectContent>) {
  const { theme } = useTheme();
  return (
    <BaseSelect.Portal
      className={cn(styles.scope, theme === "light" && styles.light, portalClassName)}
    >
      <BaseSelect.Positioner
        alignItemWithTrigger={false}
        sideOffset={6}
        className="z-50 w-[var(--anchor-width)]"
      >
        <BaseSelect.Popup
          {...props}
          className={cn("ds-picker-popup", className)}
          render={render ?? renderPopupMotion}
        >
          <ScrollArea.Root className={styles.scrollArea}>
            {/* List 与 Viewport 共用 DOM，保留键盘导航使用的真实滚动节点。 */}
            <BaseSelect.List
              render={<ScrollArea.Viewport />}
              tabIndex={-1}
              className={cn(styles.scrollViewport, styles.pickerViewport)}
            >
              <ScrollArea.Content className={styles.pickerContent} style={{ minWidth: 0 }}>
                {children}
              </ScrollArea.Content>
            </BaseSelect.List>
            <PreviewScrollbar />
          </ScrollArea.Root>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function ComboboxList({
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof BaseCombobox.List>, "render">) {
  return (
    <ScrollArea.Root className={styles.scrollArea}>
      <BaseCombobox.List
        {...props}
        render={<ScrollArea.Viewport />}
        tabIndex={-1}
        className={cn(styles.scrollViewport, styles.pickerViewport, className)}
      >
        {/* Content 观察筛选后的高度变化，长列表缩短时同步隐藏滑块。 */}
        <ScrollArea.Content className={styles.pickerContent} style={{ minWidth: 0 }}>
          {typeof children === "function" ? (
            <BaseCombobox.Collection>{children}</BaseCombobox.Collection>
          ) : (
            children
          )}
        </ScrollArea.Content>
      </BaseCombobox.List>
      <PreviewScrollbar />
    </ScrollArea.Root>
  );
}

export function ComboboxContent({
  portalClassName,
  className,
  ...props
}: ComponentProps<typeof SharedComboboxContent>) {
  const { theme } = useTheme();
  return (
    <SharedComboboxContent
      {...props}
      className={cn(styles.comboboxPopup, className)}
      portalClassName={cn(styles.scope, theme === "light" && styles.light, portalClassName)}
    />
  );
}

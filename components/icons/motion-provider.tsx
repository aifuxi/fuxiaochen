"use client";

import type { ComponentProps } from "react";

import { createContext } from "react";

export const IconMotionContext = createContext(true);

// React context 随 Portal 传递，使浮层沿用所属页面的动效开关。
export function IconMotionProvider({
  enabled,
  ...props
}: ComponentProps<"div"> & { enabled: boolean }) {
  return (
    <IconMotionContext value={enabled}>
      <div {...props} />
    </IconMotionContext>
  );
}

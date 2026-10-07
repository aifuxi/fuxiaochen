"use client";

import type { HTMLProps } from "@base-ui/react/types";
import type { HTMLMotionProps } from "motion/react";

import * as m from "motion/react-m";

import { useMotionSettings } from "./motion-provider";

type PopupMotionState = {
  open: boolean;
  transitionStatus: "starting" | "ending" | "idle" | undefined;
  instant?: string;
};

function PopupMotion({
  popupState,
  ...props
}: HTMLMotionProps<"div"> & { popupState: PopupMotionState }) {
  const { ready, reducedMotion, quickDuration, ease } = useMotionSettings();
  const animated = ready && !reducedMotion && !popupState.instant;
  const opacity =
    !popupState.open || (animated && popupState.transitionStatus === "starting") ? 0 : 1;

  return (
    <m.div
      {...props}
      initial={false}
      // 单帧目标让静态偏好切换取消正在播放的动画；只改 duration 不会取消同目标动画。
      animate={{ opacity: animated ? opacity : [opacity] }}
      transition={{ type: "tween", duration: animated ? quickDuration : 0, ease }}
    />
  );
}

// 保留 Base UI 的 props 和 ref，原生 opacity 动画由其等待完成后再卸载。
export function renderPopupMotion(props: HTMLProps<HTMLDivElement>, state: PopupMotionState) {
  const { onAnimationStart, onDrag, onDragStart, onDragEnd, ...motionProps } = props;
  // 这些原生事件与 Motion 手势同名，使用静态元素保留调用者的 DOM 事件语义。
  if (onAnimationStart || onDrag || onDragStart || onDragEnd) return <div {...props} />;
  return <PopupMotion {...motionProps} popupState={state} />;
}

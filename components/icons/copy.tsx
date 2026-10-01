"use client";

// 改编自 https://lucide-animated.com/r/copy.json，MIT；动画路径保留官方实现。
import type { Transition } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 17,
  mass: 1,
};

export function Copy({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
  const { controls, ref } = useIconAnimation();
  return (
    <svg
      ref={ref}
      className={className}
      data-animated-icon=""
      focusable="false"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <motion.rect
        animate={controls}
        height="14"
        rx="2"
        ry="2"
        transition={DEFAULT_TRANSITION}
        variants={{
          normal: { translateY: 0, translateX: 0 },
          animate: { translateY: -3, translateX: -3 },
        }}
        width="14"
        x="8"
        y="8"
      />
      <motion.path
        animate={controls}
        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        transition={DEFAULT_TRANSITION}
        variants={{
          normal: { x: 0, y: 0 },
          animate: { x: 3, y: 3 },
        }}
      />
    </svg>
  );
}

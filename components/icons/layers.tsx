"use client";

// 改编自 https://lucide-animated.com/r/layers.json，MIT；动画路径保留官方实现。
import type { Transition } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 14,
  mass: 1,
};

export function Layers3({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <motion.path
        animate={controls}
        d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"
        transition={DEFAULT_TRANSITION}
        variants={{
          normal: { y: 0 },
          firstState: { y: -9 },
          secondState: { y: 0 },
        }}
      />
      <motion.path
        animate={controls}
        d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"
        transition={DEFAULT_TRANSITION}
        variants={{
          normal: { y: 0 },
          firstState: { y: -5 },
          secondState: { y: 0 },
        }}
      />
    </svg>
  );
}

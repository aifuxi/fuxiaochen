"use client";

// 改编自 https://lucide-animated.com/r/chevron-down.json，MIT；动画路径保留官方实现。
import type { Transition } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const DEFAULT_TRANSITION: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
};

export function ChevronDown({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
      <motion.path
        animate={controls}
        d="m6 9 6 6 6-6"
        transition={DEFAULT_TRANSITION}
        variants={{
          normal: { y: 0 },
          animate: { y: [0, 2, 0] },
        }}
      />
    </svg>
  );
}

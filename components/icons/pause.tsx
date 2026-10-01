"use client";

// 改编自 https://lucide-animated.com/r/pause.json，MIT；动画路径保留官方实现。
import type { Variants } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const BASE_RECT_VARIANTS: Variants = {
  normal: {
    y: 0,
  },
};

const BASE_RECT_TRANSITION = {
  transition: {
    times: [0, 0.2, 0.5, 1],
    duration: 0.5,
    type: "tween" as const,
    ease: "easeInOut" as const,
  },
};

const LEFT_RECT_VARIANTS: Variants = {
  ...BASE_RECT_VARIANTS,
  animate: {
    y: [0, 2, 0, 0],
    ...BASE_RECT_TRANSITION,
  },
};

const RIGHT_RECT_VARIANTS: Variants = {
  ...BASE_RECT_VARIANTS,
  animate: {
    y: [0, 0, 2, 0],
    ...BASE_RECT_TRANSITION,
  },
};

export function Pause({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
        height="16"
        rx="1"
        variants={LEFT_RECT_VARIANTS}
        width="4"
        x="6"
        y="4"
      />
      <motion.rect
        animate={controls}
        height="16"
        rx="1"
        variants={RIGHT_RECT_VARIANTS}
        width="4"
        x="14"
        y="4"
      />
    </svg>
  );
}

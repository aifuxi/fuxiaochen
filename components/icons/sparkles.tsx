"use client";

// 改编自 https://lucide-animated.com/r/sparkles.json，MIT；动画路径保留官方实现。
import type { Variants } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const SPARKLE_VARIANTS: Variants = {
  normal: {
    y: 0,
    fill: "none",
  },
  animate: {
    y: [0, -1, 0, 0],
    fill: "currentColor",
    transition: {
      duration: 1,
      type: "tween",
      ease: "easeInOut",
    },
  },
};

const STAR_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  animate: () => ({
    opacity: [0, 1, 0, 0, 0, 0, 1],
    transition: {
      duration: 2,
      delay: 1,
      // Motion 的 spring 只支持两个关键帧；保留官方闪烁序列并改用 tween。
      type: "tween",
      ease: "easeInOut",
    },
  }),
};

export function Sparkles({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        variants={SPARKLE_VARIANTS}
      />
      <motion.path animate={controls} d="M20 3v4" variants={STAR_VARIANTS} />
      <motion.path animate={controls} d="M22 5h-4" variants={STAR_VARIANTS} />
      <motion.path animate={controls} d="M4 17v2" variants={STAR_VARIANTS} />
      <motion.path animate={controls} d="M5 18H3" variants={STAR_VARIANTS} />
    </svg>
  );
}

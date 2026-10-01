"use client";

// 改编自 https://lucide-animated.com/r/arrow-up.json，MIT；动画路径保留官方实现。
import type { Variants } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const PATH_VARIANTS: Variants = {
  normal: { d: "m5 12 7-7 7 7", translateY: 0 },
  animate: {
    d: "m5 12 7-7 7 7",
    translateY: [0, 3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const SECOND_PATH_VARIANTS: Variants = {
  normal: { d: "M12 19V5" },
  animate: {
    d: ["M12 19V5", "M12 19V10", "M12 19V5"],
    transition: {
      duration: 0.4,
    },
  },
};

export function ArrowUp({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
      <motion.path animate={controls} d="m5 12 7-7 7 7" variants={PATH_VARIANTS} />
      <motion.path animate={controls} d="M12 19V5" variants={SECOND_PATH_VARIANTS} />
    </svg>
  );
}

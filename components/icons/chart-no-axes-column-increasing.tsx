"use client";

// 改编自 https://lucide-animated.com/r/chart-no-axes-column-increasing.json，MIT；动画路径保留官方实现。
import type { Variants } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const LINE_VARIANTS: Variants = {
  visible: { pathLength: 1, opacity: 1 },
  hidden: { pathLength: 0, opacity: 0 },
};

export function BarChart3({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
        custom={0}
        d="M6 20v-4"
        initial="visible"
        variants={LINE_VARIANTS}
      />
      <motion.path
        animate={controls}
        custom={1}
        d="M12 20v-10"
        initial="visible"
        variants={LINE_VARIANTS}
      />
      <motion.path
        animate={controls}
        custom={2}
        d="M18 20v-16"
        initial="visible"
        variants={LINE_VARIANTS}
      />
    </svg>
  );
}

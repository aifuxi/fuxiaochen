"use client";

// 改编自 https://lucide-animated.com/r/menu.json，MIT；动画路径保留官方实现。
import type { Variants } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const LINE_VARIANTS: Variants = {
  normal: {
    rotate: 0,
    y: 0,
    opacity: 1,
  },
  animate: (custom: number) => ({
    rotate: custom === 1 ? 45 : custom === 3 ? -45 : 0,
    y: custom === 1 ? 6 : custom === 3 ? -6 : 0,
    opacity: custom === 2 ? 0 : 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  }),
};

export function Menu({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
      <motion.line
        animate={controls}
        custom={1}
        initial="normal"
        variants={LINE_VARIANTS}
        x1="4"
        x2="20"
        y1="6"
        y2="6"
      />
      <motion.line
        animate={controls}
        custom={2}
        initial="normal"
        variants={LINE_VARIANTS}
        x1="4"
        x2="20"
        y1="12"
        y2="12"
      />
      <motion.line
        animate={controls}
        custom={3}
        initial="normal"
        variants={LINE_VARIANTS}
        x1="4"
        x2="20"
        y1="18"
        y2="18"
      />
    </svg>
  );
}

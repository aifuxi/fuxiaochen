"use client";

// 改编自 https://lucide-animated.com/r/earth.json，MIT；动画路径保留官方实现。
import type { Transition, Variants } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const CIRCLE_TRANSITION: Transition = {
  duration: 0.3,
  delay: 0.1,
  opacity: { delay: 0.15 },
};

const CIRCLE_VARIANTS: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
  },
};

export function Globe2({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
        d="M21.54 15H17a2 2 0 0 0-2 2v4.54"
        transition={{ duration: 0.7, delay: 0.5, opacity: { delay: 0.5 } }}
        variants={{
          normal: {
            pathLength: 1,
            opacity: 1,
            pathOffset: 0,
          },
          animate: {
            pathLength: [0, 1],
            opacity: [0, 1],
            pathOffset: [1, 0],
          },
        }}
      />
      <motion.path
        animate={controls}
        d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"
        transition={{ duration: 0.7, delay: 0.5, opacity: { delay: 0.5 } }}
        variants={{
          normal: {
            pathLength: 1,
            opacity: 1,
            pathOffset: 0,
          },
          animate: {
            pathLength: [0, 1],
            opacity: [0, 1],
            pathOffset: [1, 0],
          },
        }}
      />
      <motion.path
        animate={controls}
        d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"
        transition={{ duration: 0.7, delay: 0.5, opacity: { delay: 0.5 } }}
        variants={{
          normal: {
            pathLength: 1,
            opacity: 1,
            pathOffset: 0,
          },
          animate: {
            pathLength: [0, 1],
            opacity: [0, 1],
            pathOffset: [1, 0],
          },
        }}
      />
      <motion.circle
        animate={controls}
        cx="12"
        cy="12"
        r="10"
        transition={CIRCLE_TRANSITION}
        variants={CIRCLE_VARIANTS}
      />
    </svg>
  );
}

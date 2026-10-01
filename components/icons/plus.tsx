"use client";

// 改编自 https://lucide-animated.com/r/plus.json，MIT；动画路径保留官方实现。

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

export function Plus({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
      <motion.g
        animate={controls}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        variants={{
          normal: {
            rotate: 0,
          },
          animate: {
            rotate: 180,
          },
        }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </motion.g>
    </svg>
  );
}

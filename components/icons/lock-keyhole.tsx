"use client";

// 改编自 https://lucide-animated.com/r/lock-keyhole.json，MIT；动画路径保留官方实现。

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

export function LockKeyhole({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
        initial="normal"
        transition={{
          duration: 1,
          ease: [0.4, 0, 0.2, 1],
        }}
        variants={{
          normal: {
            rotate: 0,
            scale: 1,
          },
          animate: {
            rotate: [-3, 1, -2, 0],
            scale: [0.95, 1.05, 0.98, 1],
          },
        }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <circle cx="12" cy="16" r="1" />
        <rect height="12" rx="2" width="18" x="3" y="10" />
        <motion.path
          animate={controls}
          d="M7 10V7a5 5 0 0 1 10 0v3"
          initial="normal"
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
          variants={{
            normal: {
              pathLength: 1,
            },
            animate: {
              pathLength: 0.7,
            },
          }}
        />
      </motion.g>
    </svg>
  );
}

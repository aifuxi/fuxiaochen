"use client";

// 改编自 https://lucide-animated.com/r/file-text.json，MIT；动画路径保留官方实现。

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

export function FileText({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
        variants={{
          normal: { scale: 1 },
          animate: {
            scale: 1.05,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
        }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />

        <motion.path
          d="M10 9H8"
          stroke="currentColor"
          strokeWidth="2"
          variants={{
            normal: {
              pathLength: 1,
              x1: 8,
              x2: 10,
            },
            animate: {
              pathLength: [1, 0, 1],
              x1: [8, 10, 8],
              x2: [10, 10, 10],
              transition: {
                duration: 0.7,
                delay: 0.3,
              },
            },
          }}
        />
        <motion.path
          d="M16 13H8"
          stroke="currentColor"
          strokeWidth="2"
          variants={{
            normal: {
              pathLength: 1,
              x1: 8,
              x2: 16,
            },
            animate: {
              pathLength: [1, 0, 1],
              x1: [8, 16, 8],
              x2: [16, 16, 16],
              transition: {
                duration: 0.7,
                delay: 0.5,
              },
            },
          }}
        />
        <motion.path
          d="M16 17H8"
          stroke="currentColor"
          strokeWidth="2"
          variants={{
            normal: {
              pathLength: 1,
              x1: 8,
              x2: 16,
            },
            animate: {
              pathLength: [1, 0, 1],
              x1: [8, 16, 8],
              x2: [16, 16, 16],
              transition: {
                duration: 0.7,
                delay: 0.7,
              },
            },
          }}
        />
      </motion.g>
    </svg>
  );
}

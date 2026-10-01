"use client";

// 图形来自 Lucide（ISC），以 Motion 补齐官方动画库未覆盖的图标。
import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

export function Folder({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
  const { controls, ref } = useIconAnimation();
  return (
    <svg
      ref={ref}
      className={className}
      data-animated-icon=""
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <motion.g
        initial="normal"
        animate={controls}
        variants={{
          normal: { scale: 1 },
          animate: {
            scale: [1, 1.08, 1],
            transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        style={{ transformOrigin: "12px 12px" }}
      >
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      </motion.g>
    </svg>
  );
}

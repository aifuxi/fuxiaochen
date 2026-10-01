"use client";

// 图形来自 Lucide（ISC），以 Motion 补齐官方动画库未覆盖的图标。
import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

export function Smartphone({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </motion.g>
    </svg>
  );
}

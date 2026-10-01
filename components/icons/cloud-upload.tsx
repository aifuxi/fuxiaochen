"use client";

// 改编自 https://lucide-animated.com/r/cloud-upload.json，MIT；动画路径保留官方实现。
import type { Variants } from "motion/react";

import { motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const CLOUD_VARIANTS: Variants = {
  initial: { y: -2 },
  active: { y: 0 },
};

export function UploadCloud({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
      <path d="M4.2 15.1A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.2" />
      <motion.g
        animate={controls}
        transition={{
          duration: 0.3,
          ease: [0.68, -0.6, 0.32, 1.6],
        }}
        variants={CLOUD_VARIANTS}
      >
        <path d="M12 13v8" />
        <path d="m8 17 4-4 4 4" />
      </motion.g>
    </svg>
  );
}

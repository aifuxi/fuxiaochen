"use client";

// 改编自 https://lucide-animated.com/r/calendar-days.json，MIT；动画路径保留官方实现。
import type { Variants } from "motion/react";

import { AnimatePresence, motion } from "motion/react";

import type { IconProps } from "./types";

import { useIconAnimation } from "./use-icon-animation";

const DOTS = [
  { cx: 8, cy: 14 },
  { cx: 12, cy: 14 },
  { cx: 16, cy: 14 },
  { cx: 8, cy: 18 },
  { cx: 12, cy: 18 },
  { cx: 16, cy: 18 },
];

const VARIANTS: Variants = {
  normal: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  animate: (i: number) => ({
    opacity: [1, 0.3, 1],
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      times: [0, 0.5, 1],
    },
  }),
};

export function CalendarDays({ size = 24, strokeWidth = 2, className, ...props }: IconProps) {
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
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <path d="M3 10h18" />
      <AnimatePresence>
        {DOTS.map((dot, index) => (
          <motion.circle
            animate={controls}
            custom={index}
            cx={dot.cx}
            cy={dot.cy}
            fill="currentColor"
            initial="normal"
            key={`${dot.cx}-${dot.cy}`}
            r="1"
            stroke="none"
            variants={VARIANTS}
          />
        ))}
      </AnimatePresence>
    </svg>
  );
}

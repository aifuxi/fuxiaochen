"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
  borderColor?: string;
  shadowColor?: string;
}

export function AnimatedCard({
  children,
  className,
  hoverScale = -4,
  hoverY = -8,
  borderColor = "var(--primary)",
  shadowColor = "rgba(16, 185, 129, 0.1)",
}: AnimatedCardProps) {
  return (
    <motion.div
      className={cn("rounded-xl border border-white/8 bg-card p-6", className)}
      whileHover={{
        scale: hoverScale,
        y: hoverY,
        borderColor: borderColor,
        boxShadow: `0 0 30px ${shadowColor}`,
      }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

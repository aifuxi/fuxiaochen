"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SpotlightCard({ children, className, style }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      style={style}
    >
      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.08) 0%, transparent 50%)`,
        }}
        animate={{ opacity: 1 }}
      />
      {children}
    </div>
  );
}

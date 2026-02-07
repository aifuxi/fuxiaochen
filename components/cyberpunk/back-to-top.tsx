"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Visibility check
      const scrollTop = window.scrollY;
      setIsVisible(scrollTop > 300);

      // Progress calculation
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (docHeight > 0) {
        const scrollPercent = scrollTop / docHeight;
        setProgress(Math.min(100, Math.max(0, scrollPercent * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Circle properties
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "group fixed right-8 bottom-8 z-50 cursor-pointer!",
        "transition-all duration-500 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-8 opacity-0",
      )}
      aria-label="回到顶部"
    >
      {/* Glow Effect Background */}
      <div
        className={`
          absolute inset-0 rounded-full bg-neon-cyan/5 blur-md transition-all duration-300
          group-hover:bg-neon-cyan/20
        `}
      />

      <div
        className={`
          relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/80
          shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300
          group-hover:border-neon-cyan/50 group-hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]
        `}
      >
        {/* Progress Ring SVG */}
        <svg
          className="absolute inset-0 h-full w-full -rotate-90 transform"
          viewBox="0 0 56 56"
        >
          {/* Track */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/10"
          />
          {/* Progress Indicator */}
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-neon-cyan transition-all duration-100 ease-linear"
          />
        </svg>

        {/* Icon */}
        <div
          className={`
            relative z-10 transform text-neon-cyan transition-colors duration-300
            group-hover:-translate-y-1 group-hover:text-white
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </div>

        {/* Tech Decor Dots */}
        <div
          className={`
            absolute top-1 left-1/2 h-1 w-0.5 -translate-x-1/2 bg-neon-cyan/50 opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          `}
        />
        <div
          className={`
            absolute bottom-1 left-1/2 h-1 w-0.5 -translate-x-1/2 bg-neon-cyan/50 opacity-0 transition-opacity
            duration-300
            group-hover:opacity-100
          `}
        />
        <div
          className={`
            absolute top-1/2 left-1 h-0.5 w-1 -translate-y-1/2 bg-neon-cyan/50 opacity-0 transition-opacity duration-300
            group-hover:opacity-100
          `}
        />
        <div
          className={`
            absolute top-1/2 right-1 h-0.5 w-1 -translate-y-1/2 bg-neon-cyan/50 opacity-0 transition-opacity
            duration-300
            group-hover:opacity-100
          `}
        />
      </div>

      {/* Label Tooltip (Optional, shows on hover) */}
      <span
        className={`
          pointer-events-none absolute top-1/2 right-full mr-4 translate-x-2 -translate-y-1/2 rounded border
          border-neon-cyan/30 bg-black/80 px-3 py-1 font-mono text-xs tracking-wider whitespace-nowrap text-neon-cyan
          uppercase opacity-0 backdrop-blur-sm transition-all duration-300
          group-hover:translate-x-0 group-hover:opacity-100
        `}
      >
        顶部
      </span>
    </button>
  );
}
